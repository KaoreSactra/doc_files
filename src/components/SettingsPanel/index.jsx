import { useRef } from 'react';
import { toast } from '@/lib/library';
import { clearData, exportData, importData } from '@/lib/userData';
import { OPTIONS, SECRET_THEME, THEMES, resetSettings, updateSettings, useIsDark, useSettings } from '@/lib/settings';
import { CheckIcon, KeyboardIcon, MonitorIcon, MoonIcon, ResetIcon, SunIcon } from '../Icons';
import Modal from '../Modal';

const MODE_ICONS = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };

export default function SettingsPanel({ open, onClose, onShortcuts }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configurações"
      variant="drawer"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="btn-text" onClick={() => { resetSettings(); toast('Configurações restauradas'); }}>
            <ResetIcon size={14} /> Restaurar padrões
          </button>
          <button type="button" className="btn-text" onClick={onShortcuts}>
            <KeyboardIcon size={14} /> Atalhos
          </button>
        </div>
      }
    >
      <SettingsForm />
    </Modal>
  );
}

function SettingsForm() {
  const s = useSettings();
  const dark = useIsDark();
  const set = (key) => (value) => updateSettings({ [key]: value });

  return (
    <div className="space-y-7">
      <Section title="Aparência">
        <Segmented label="Modo" value={s.mode} onChange={set('mode')}
                   options={OPTIONS.mode.map((o) => ({ ...o, Icon: MODE_ICONS[o.value] }))} />

        <fieldset>
          <legend className="field-label">Tema</legend>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <ThemeSwatch key={t.id} theme={t} dark={dark} selected={s.theme === t.id} onSelect={() => set('theme')(t.id)} />
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="Leitura">
        <Segmented label="Tamanho do texto" value={s.fontSize} onChange={set('fontSize')} options={OPTIONS.fontSize} />
        <Segmented label="Fonte" value={s.fontFamily} onChange={set('fontFamily')} options={OPTIONS.fontFamily} />
        <Segmented label="Espaçamento entre linhas" value={s.lineHeight} onChange={set('lineHeight')} options={OPTIONS.lineHeight} />
        <Segmented label="Largura do conteúdo" value={s.contentWidth} onChange={set('contentWidth')} options={OPTIONS.contentWidth} />

        <div>
          <div className="field-label">Prévia</div>
          <div className="prose prose-doc max-w-none rounded-lg border border-line bg-bg px-4 py-3">
            <p className="!my-0">
              Documentação boa é aquela que você <strong>consegue ler</strong> sem esforço.
              Ajuste até ficar confortável — <code>as mudanças</code> valem na hora.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Interface">
        <Toggle label="Índice da página" hint="Lista de seções ao lado do documento." checked={s.showToc} onChange={set('showToc')} />
        <Toggle label="Barra de progresso" hint="Mostra quanto do documento já foi lido." checked={s.showProgress} onChange={set('showProgress')} />
        <Toggle label="Lembrar posição de leitura" hint="Volta ao ponto onde você parou em cada documento." checked={s.rememberPosition} onChange={set('rememberPosition')} />
        <Toggle label="Modo foco" hint="Esconde a barra lateral. Atalho: F" checked={s.focusMode} onChange={set('focusMode')} />
        <Toggle label="Reduzir animações" hint="Desliga transições e rolagem suave." checked={s.reduceMotion} onChange={set('reduceMotion')} />
        {s.theme === SECRET_THEME.id && (
          <Toggle label="Sons" hint="Efeitos sonoros curtos deste tema." checked={s.cyberSound} onChange={set('cyberSound')} />
        )}
      </Section>

      <Section title="Código">
        <Toggle label="Quebrar linhas longas" hint="Evita a rolagem horizontal nos blocos de código." checked={s.codeWrap} onChange={set('codeWrap')} />
      </Section>

      <DataSection />
    </div>
  );
}

/** Backup das configurações, favoritos e histórico (tudo fica só neste navegador). */
function DataSection() {
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await importData(file);
      toast('Dados importados');
    } catch (err) {
      toast(err.message);
    }
  };

  const onClear = () => {
    if (window.confirm('Apagar configurações, favoritos e histórico deste navegador?')) {
      clearData();
      toast('Dados apagados');
    }
  };

  return (
    <Section title="Seus dados">
      <p className="text-xs text-muted">
        Configurações, favoritos e histórico ficam salvos só neste navegador. Exporte para levar a outro dispositivo.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-outline" onClick={() => { exportData(); toast('Backup exportado'); }}>Exportar</button>
        <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()}>Importar</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
      </div>
      <button type="button" className="btn-text text-red-500 hover:text-red-500" onClick={onClear}>Apagar todos os dados</button>
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div role="radiogroup" className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-line bg-bg p-1">
        {options.map(({ value: v, label: l, Icon }) => {
          const on = v === value;
          return (
            <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)}
                    className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition ${
                      on ? 'bg-accent font-medium text-accent-fg shadow-sm' : 'text-muted hover:bg-hover hover:text-fg'
                    }`}>
              {Icon && <Icon size={14} />}{l}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div onClick={() => onChange(!checked)} className="cursor-pointer select-none">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
              className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-accent' : 'bg-line'}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

/** Miniatura renderizada com as variáveis reais do tema (via data-theme no próprio elemento). */
function ThemeSwatch({ theme, dark, selected, onSelect }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect}
            className={`rounded-lg border p-1 text-left transition ${selected ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-muted'}`}>
      <div data-theme={theme.id} className={`${dark ? 'dark' : ''} relative overflow-hidden rounded-md border border-line bg-bg p-1.5 pt-2.5`}>
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
        <div className="flex gap-1">
          <div className="w-3 space-y-1 rounded-sm bg-surface p-0.5">
            <div className="h-1 rounded-full bg-accent" />
            <div className="h-1 rounded-full bg-line" />
            <div className="h-1 rounded-full bg-line" />
          </div>
          <div className="flex-1 space-y-1 pt-0.5">
            <div className="h-1.5 w-3/4 rounded-full bg-fg" />
            <div className="h-1 rounded-full bg-muted/60" />
            <div className="h-1 w-5/6 rounded-full bg-muted/60" />
            <div className="h-1.5 w-1/3 rounded-full bg-accent" />
          </div>
        </div>
        {selected && (
          <span className="absolute right-1 top-1 rounded-full bg-accent p-0.5 text-accent-fg">
            <CheckIcon size={9} />
          </span>
        )}
      </div>
      <div data-theme={theme.id} className={`${dark ? 'dark' : ''} mt-1 flex items-center gap-1.5 px-0.5 text-xs font-medium`}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent ring-1 ring-line" />
        <span className="text-fg">{theme.label}</span>
      </div>
    </button>
  );
}

import { MOD_KEY } from '@/lib/library';
import Modal from '../Modal';

const GROUPS = [
  {
    title: 'Geral',
    items: [
      [[`${MOD_KEY} K`], 'Pesquisar'],
      [['/'], 'Pesquisar'],
      [[`${MOD_KEY} ,`], 'Configurações'],
      [['?'], 'Mostrar atalhos'],
      [['Esc'], 'Fechar janela'],
    ],
  },
  {
    title: 'Aparência',
    items: [
      [['T'], 'Alternar claro / escuro'],
      [['F'], 'Modo foco'],
    ],
  },
  {
    title: 'Documento',
    items: [
      [['['], 'Documento anterior'],
      [[']'], 'Próximo documento'],
      [['S'], 'Favoritar / desfavoritar'],
      [['U'], 'Voltar ao topo'],
      [['Esc'], 'Limpar destaque da busca'],
    ],
  },
];

export default function ShortcutsDialog({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Atalhos do teclado">
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{g.title}</h3>
            <ul className="divide-y divide-line">
              {g.items.map(([keys, label]) => (
                <li key={label + keys} className="flex items-center justify-between py-2 text-sm">
                  <span>{label}</span>
                  <span className="flex gap-1">{keys.map((k) => <kbd key={k} className="kbd">{k}</kbd>)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}

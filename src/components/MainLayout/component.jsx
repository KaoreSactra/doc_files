import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { useHotkey } from '@/hooks/useHotkey';
import { toast } from '@/lib/library';
import { SECRET_THEME, settingsStore, toggleDark, toggleSetting, useSettings } from '@/lib/settings';
import CyberBoot from '../CyberBoot';
import CyberSfx from '../CyberSfx';
import { CloseIcon, ExitFocusIcon, MenuIcon, SearchIcon, SettingsIcon } from '../Icons';
import SearchPalette from '../SearchPalette';
import SettingsPanel from '../SettingsPanel';
import ShortcutsDialog from '../ShortcutsDialog';
import Sidebar from '../Sidebar';
import Toaster from '../Toaster';

export default function MainLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { focusMode } = useSettings();

  const closeAll = () => { setMenuOpen(false); setSearchOpen(false); setSettingsOpen(false); setShortcutsOpen(false); };
  const openSearch = () => { closeAll(); setSearchOpen(true); };
  const openSettings = () => { closeAll(); setSettingsOpen(true); };
  const openShortcuts = () => { closeAll(); setShortcutsOpen(true); };

  const toggleFocus = () => {
    toggleSetting('focusMode');
    toast(settingsStore.get().focusMode ? 'Modo foco ativado — F para sair' : 'Modo foco desativado');
  };

  useHotkey('mod+k', () => (searchOpen ? setSearchOpen(false) : openSearch()), { allowInInput: true });
  useHotkey('/', openSearch);
  useHotkey('mod+,', () => (settingsOpen ? setSettingsOpen(false) : openSettings()), { allowInInput: true });
  useHotkey('?', () => (shortcutsOpen ? setShortcutsOpen(false) : openShortcuts()));
  useHotkey('t', () => (settingsStore.get().theme === SECRET_THEME.id ? toast('Segure o botão de tema para sair da rede') : toggleDark()));
  useHotkey('f', toggleFocus);

  const sidebarProps = {
    onSearch: openSearch,
    onSettings: openSettings,
    onShortcuts: openShortcuts,
  };

  return (
    <div className="flex h-dvh w-full bg-bg text-fg print:block print:h-auto">
      {/* Desktop */}
      {!focusMode && (
        <aside className="app-sidebar hidden w-72 shrink-0 border-r border-line bg-surface/50 lg:block print:hidden">
          <Sidebar {...sidebarProps} />
        </aside>
      )}

      {/* Mobile (ou desktop em modo foco) */}
      {menuOpen && (
        <div className={`fixed inset-0 z-40 print:hidden ${focusMode ? '' : 'lg:hidden'}`} onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="app-sidebar relative h-full w-72 max-w-[85vw] bg-bg" onClick={(e) => e.stopPropagation()}>
            <Sidebar {...sidebarProps} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className={`flex items-center gap-1 border-b border-line px-3 py-2 print:hidden ${focusMode ? '' : 'lg:hidden'}`}>
          <button className="btn-ghost" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <span className="ml-1 font-semibold">doc<span className="text-accent">files</span></span>
          <div className="ml-auto flex items-center">
            <button className="btn-ghost" onClick={openSearch} aria-label="Pesquisar"><SearchIcon /></button>
            <button className="btn-ghost" onClick={openSettings} aria-label="Configurações"><SettingsIcon /></button>
            {focusMode && (
              <button className="btn-text" onClick={toggleFocus} title="Sair do modo foco (F)">
                <ExitFocusIcon size={14} /> Sair do foco
              </button>
            )}
          </div>
        </header>
        <main id="scroll-root" className="flex-1 overflow-y-auto scroll-smooth print:overflow-visible">
          <Outlet />
        </main>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} onShortcuts={openShortcuts} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Toaster />
      <CyberBoot />
      <CyberSfx />
    </div>
  );
}

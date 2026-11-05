import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { groupedDocs } from '@/lib/docs';
import { MOD_KEY, favoriteDocs, favoritesStore } from '@/lib/library';
import { toggleSetting, useSettings } from '@/lib/settings';
import { useStore } from '@/lib/store';
import { ChevronIcon, FocusIcon, KeyboardIcon, SearchIcon, SettingsIcon, StarIcon } from '../Icons';
import ThemeToggle from '../ThemeToggle';

const groups = groupedDocs();

export default function Sidebar({ onSearch, onNavigate, onSettings, onShortcuts }) {
  const { _splat: current } = useParams({ strict: false });
  const [collapsed, setCollapsed] = useState({});
  const favorites = favoriteDocs(useStore(favoritesStore));
  const { focusMode } = useSettings();

  const allGroups = favorites.length
    ? [{ group: '__favorites', label: 'Favoritos', items: favorites, star: true }, ...groups]
    : groups;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" onClick={onNavigate} className="text-lg font-semibold tracking-tight">
          doc<span className="text-accent">files</span>
        </Link>
        <div className="flex items-center">
          <ThemeToggle />
          <button type="button" className="btn-ghost" onClick={onSettings} aria-label="Configurações" title={`Configurações (${MOD_KEY} ,)`}>
            <SettingsIcon />
          </button>
        </div>
      </div>

      <button type="button" onClick={onSearch}
              className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-accent">
        <SearchIcon />
        <span className="flex-1 text-left">Pesquisar…</span>
        <kbd className="kbd">{MOD_KEY} K</kbd>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Documentação">
        {allGroups.map(({ group, label, items, star }) => {
          const isClosed = collapsed[group];
          return (
            <div key={group} className="mb-3">
              <button type="button"
                      onClick={() => setCollapsed((c) => ({ ...c, [group]: !c[group] }))}
                      aria-expanded={!isClosed}
                      className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted hover:text-fg">
                <ChevronIcon size={12} className={`transition ${isClosed ? '' : 'rotate-90'}`} />
                {star && <StarIcon size={12} filled className="text-accent" />}
                {label}
              </button>
              {!isClosed && (
                <ul className="mt-1 space-y-0.5">
                  {items.map((d) => (
                    <li key={d.slug}>
                      <Link to="/docs/$" params={{ _splat: d.slug }} onClick={onNavigate}
                            className={`block rounded-md px-3 py-1.5 text-sm transition ${
                              current === d.slug
                                ? 'bg-accent/10 font-medium text-accent'
                                : 'text-fg/80 hover:bg-hover'
                            }`}>
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-1 border-t border-line px-3 py-2">
        <button type="button" className="btn-text" onClick={onShortcuts} title="Atalhos (?)">
          <KeyboardIcon size={14} /> Atalhos
        </button>
        <button type="button" className="btn-text ml-auto" aria-pressed={focusMode}
                onClick={() => { toggleSetting('focusMode'); onNavigate?.(); }} title="Modo foco (F)">
          <FocusIcon size={14} /> Foco
        </button>
      </div>
    </div>
  );
}

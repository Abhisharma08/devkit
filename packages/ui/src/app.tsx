'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Binary, Braces, Check, ChevronRight, Clock3, Code2, Coffee, Database, Fingerprint, Grid2X2, KeyRound, Keyboard, LockKeyhole, Menu, Moon, Palette, QrCode, Regex, Search, ShieldCheck, Shuffle, Star, Sun, Text, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { projectConfig, validDonationUrl } from '@devkit/config';
import { Button } from './components/ui/button';
import { categories, tools, type ToolDefinition } from './registry';
import { usePreferences } from './store';
import { AppErrorBoundary } from './error-boundary';

const icons: Record<ToolDefinition['icon'], LucideIcon> = { braces: Braces, database: Database, binary: Binary, key: KeyRound, fingerprint: Fingerprint, qr: QrCode, clock: Clock3, regex: Regex, text: Text, palette: Palette, code: Code2 };
const categoryIcons: Record<string, LucideIcon> = { 'All tools': Grid2X2, Favorites: Star, Data: Braces, Encoding: Binary, API: Code2, Security: ShieldCheck, Generators: Shuffle, Time: Clock3, Text, Design: Palette };
export interface DevKitAppProps { surface?: 'web' | 'popup' | 'sidepanel' | 'workspace'; openWorkspace?: () => void; openSidePanel?: () => void }

function WorkspaceApp({ surface = 'web', openWorkspace, openSidePanel }: DevKitAppProps) {
  const { theme, favorites, toggleTheme, toggleFavorite } = usePreferences();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState('All tools');
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigation = useRef<HTMLDialogElement>(null);
  const shortcuts = useRef<HTMLDialogElement>(null);
  const privacy = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    setToast(message); clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3500);
  }, []);
  const closeNavigation = useCallback(() => { navigation.current?.close(); setMobileNav(false); }, []);

  useEffect(() => {
    void usePreferences.persist?.rehydrate();
    const id = new URLSearchParams(location.hash.slice(1)).get('tool');
    if (tools.some(tool => tool.id === id)) setSelected(id);
    return () => clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 901px)');
    const resize = () => { if (desktop.matches) closeNavigation(); };
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, [closeNavigation]);
  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      // Modal dialogs own their keyboard interactions and focus.
      if (navigation.current?.open || shortcuts.current?.open || privacy.current?.open) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 'k') { event.preventDefault(); search.current?.focus(); search.current?.select(); }
      if (modifier && event.key === 'Enter') { event.preventDefault(); window.dispatchEvent(new Event('devkit:run')); }
      if (modifier && event.shiftKey && event.key === 'Backspace') { event.preventDefault(); window.dispatchEvent(new Event('devkit:reset')); }
      if (event.key === 'Escape') { setQuery(''); search.current?.blur(); }
      const target = event.target as HTMLElement;
      if (event.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !target.isContentEditable) shortcuts.current?.showModal();
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  function choose(id: string | null) {
    setSelected(id); setQuery(''); closeNavigation();
    history.replaceState(null, '', id ? `#tool=${id}` : location.pathname);
    // Deliberate navigation starts at the tool title, including in the scrollable popup.
    document.querySelector('.surface-popup')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  const active = tools.find(tool => tool.id === selected);
  const searchMatches = tools.filter(tool => `${tool.name} ${tool.category} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  const matches = searchMatches.filter(tool => category === 'All tools' || (category === 'Favorites' ? favorites.includes(tool.id) : tool.category === category));
  const quickTools = tools.filter(tool => favorites.includes(tool.id)).slice(0, 4);
  const donation = validDonationUrl(projectConfig.donationUrl);
  const Tool = active?.component;
  const showSearchResults = Boolean(active && query.trim() && searchOpen);
  const categoryCount = (item: string) => item === 'All tools' ? tools.length : item === 'Favorites' ? favorites.length : tools.filter(tool => tool.category === item).length;

  const navigationContent = () => <>
    <button className="brand" onClick={() => { setCategory('All tools'); choose(null); }} aria-label="DevKit home">
      <span className="brand-icon"><Code2 size={20} /></span><span>DevKit</span>
    </button>
    <p className="nav-label">TOOLS</p>
    <nav aria-label="Tool categories">{categories.map(item => {
      const Icon = categoryIcons[item] ?? Braces;
      return <button key={item} className={`nav-item ${category === item && !active ? 'active' : ''}`} aria-current={category === item && !active ? 'page' : undefined} onClick={() => { setCategory(item); choose(null); }}>
        <Icon size={18} /><span>{item}</span><span className="nav-count">{categoryCount(item)}</span>
      </button>;
    })}</nav>
    <div className="sidebar-bottom">
      <div className="privacy-card"><span className="privacy-symbol"><LockKeyhole size={15} /></span><strong>Local processing</strong><p>Inputs are never saved or uploaded.</p><button onClick={() => { closeNavigation(); privacy.current?.showModal(); }}>Privacy policy <ArrowUpRight size={13} /></button></div>
      {donation && <a className="donation-link" href={donation} target="_blank" rel="noopener noreferrer"><Coffee size={16} /> Buy me a coffee <ArrowUpRight size={14} /></a>}
      <button className="keyboard-link" onClick={() => { closeNavigation(); shortcuts.current?.showModal(); }}><Keyboard size={17} /> Keyboard shortcuts <kbd>?</kbd></button>
    </div>
  </>;

  return <div className={`devkit surface-${surface}`}>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <aside className="sidebar" aria-label="Workspace navigation">{navigationContent()}</aside>
    <dialog ref={navigation} id="mobile-navigation" className="mobile-navigation" aria-labelledby="navigation-title" onClose={() => setMobileNav(false)}>
      <div className="mobile-navigation-heading"><span id="navigation-title">Navigation</span><Button variant="ghost" size="icon" aria-label="Close navigation" onClick={closeNavigation}><X size={20} /></Button></div>
      {navigationContent()}
    </dialog>
    <div className="main-column">
      <header className="topbar">
        <div className="breadcrumb"><button className="compact-brand" aria-label="DevKit home" onClick={() => { setCategory('All tools'); choose(null); }}><Code2 size={19} /><span>DevKit</span></button><button className="mobile-menu icon-control" aria-label="Open navigation" aria-expanded={mobileNav} aria-controls="mobile-navigation" onClick={() => { navigation.current?.showModal(); setMobileNav(true); }}><Menu size={20} /></button><span>Tools</span><ChevronRight size={14} /><strong>{active?.name ?? category}</strong></div>
        <div className="topbar-actions"><span className="local-badge"><LockKeyhole size={13} /> Runs locally</span><Button variant="ghost" size="icon" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</Button>{openWorkspace && <Button variant="outline" size="small" onClick={openWorkspace}>Expand <ArrowUpRight size={14} /></Button>}</div>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        {active ? <>
          <button className="back-link" onClick={() => choose(null)}><ArrowLeft size={16} /> Back to tools</button>
          <div className="tool-title-row"><div><span className="eyebrow">{active.category}</span><h1 ref={heading} tabIndex={-1}>{active.name}</h1><p className="subtitle">{active.description}</p></div><Button variant="outline" size="icon" title={favorites.includes(active.id) ? 'Remove from favorites' : 'Add to favorites'} aria-label={`${favorites.includes(active.id) ? 'Unfavorite' : 'Favorite'} ${active.name}`} aria-pressed={favorites.includes(active.id)} onClick={() => toggleFavorite(active.id)}><Star size={19} fill={favorites.includes(active.id) ? 'currentColor' : 'none'} /></Button></div>
        </> : <div className="hero"><h1 ref={heading} tabIndex={-1}>Developer tools</h1><p className="subtitle">Format, inspect, and convert data in your browser.</p></div>}


        <div className="search-area" role="search" aria-label="Find developer tools" onFocusCapture={() => setSearchOpen(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchOpen(false); }}>
          <div className={`search-wrap ${active ? 'search-compact' : ''}`}><Search size={20} /><input ref={search} aria-label="Search tools" aria-keyshortcuts="Control+K Meta+K" aria-controls={showSearchResults ? 'tool-search-results' : undefined} placeholder={active ? 'Find another tool…' : 'Find a tool… JSON, Base64, regex'} autoComplete="off" spellCheck={false} value={query} onChange={event => { setQuery(event.target.value); if (!active) setCategory('All tools'); }} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && query.trim() && searchMatches.length) { event.preventDefault(); choose(searchMatches[0]!.id); search.current?.blur(); } }} />{query ? <button aria-label="Clear search" className="icon-control" onClick={() => { setQuery(''); search.current?.focus(); }}><X size={17} /></button> : <kbd>⌘ / Ctrl K</kbd>}</div>
          {showSearchResults && <div className="search-results" id="tool-search-results"><p className="search-results-count" role="status">{searchMatches.length ? `${searchMatches.length} matching ${searchMatches.length === 1 ? 'tool' : 'tools'}` : 'No tools found. Try another name or keyword.'}</p>{searchMatches.map(tool => { const Icon = icons[tool.icon]; return <button key={tool.id} className="search-result" onClick={() => choose(tool.id)}><Icon size={18} /><span><strong>{tool.name}</strong><span>{tool.category}</span></span><ArrowUpRight size={16} /></button>; })}</div>}
        </div>

        {active && Tool ? <Tool key={active.id} tool={active} dark={theme === 'dark'} notify={notify} /> : <>
          {!query && category === 'All tools' && quickTools.length > 0 && <div className="quick-access" aria-label={favorites.length ? 'Favorite shortcuts' : 'Quick access'}><span>Favorites</span>{quickTools.map(tool => <button key={tool.id} onClick={() => choose(tool.id)} aria-label={`Quick open ${tool.name}`}>{tool.name}<ArrowUpRight size={13} /></button>)}</div>}
          <div className="catalog-heading"><div><h2>{query ? 'Search results' : category === 'All tools' ? 'All tools' : category}</h2><p role="status" aria-live="polite">{matches.length} {matches.length === 1 ? 'tool' : 'tools'}{query.trim() ? ` found for “${query.trim()}”` : ' available'}</p></div><span className="catalog-view">{tools.length} tools / MIT licensed</span></div>
          <div className="category-chips" aria-label="Filter tools">{categories.map(item => <button key={item} aria-pressed={category === item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item === 'Favorites' && <Star size={13} />}{item}<span>{categoryCount(item)}</span></button>)}</div>
          <div className="tool-grid">{matches.map(tool => {
            const Icon = icons[tool.icon]; const favorite = favorites.includes(tool.id);
            return <article className="tool-card" key={tool.id}>
              <button className="card-open" onClick={() => choose(tool.id)} aria-label={`Open ${tool.name}`}><span className="tool-icon"><Icon size={19} /></span><h3>{tool.name}</h3><p>{tool.description}</p></button>
              <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} title={favorite ? 'Remove from favorites' : 'Add to favorites'} aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${tool.name}`} aria-pressed={favorite} onClick={() => toggleFavorite(tool.id)}><Star size={16} fill={favorite ? 'currentColor' : 'none'} /></button>
            </article>;
          })}</div>
          {!matches.length && <div className="empty-catalog">{category === 'Favorites' && !query ? <Star size={30} /> : <Search size={30} />}<h2>{category === 'Favorites' && !query ? 'No favorites yet.' : 'No tools found.'}</h2><p>{category === 'Favorites' && !query ? 'Star a tool to keep it here.' : 'Try a different name or keyword, or explore all tools.'}</p><Button variant="outline" onClick={() => { setCategory('All tools'); setQuery(''); }}>Explore all tools</Button></div>}
        </>}
        {openSidePanel && <Button className="sidepanel-launch" variant="outline" onClick={openSidePanel}>Open side panel <ArrowUpRight size={15} /></Button>}
        <footer><span>DevKit <span aria-hidden="true">/</span> Local developer utilities</span><div><button onClick={() => privacy.current?.showModal()}>Privacy</button><span>Free & open source</span>{donation && <a href={donation} target="_blank" rel="noopener noreferrer"><Coffee size={15} /> Support DevKit</a>}</div></footer>
      </main>
    </div>
    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{toast && <><Check size={17} />{toast}</>}</div>
    <dialog ref={shortcuts} className="modal" aria-labelledby="shortcuts-title"><div className="modal-heading"><h2 id="shortcuts-title">Keyboard shortcuts</h2><Button size="icon" variant="ghost" aria-label="Close shortcuts" onClick={() => shortcuts.current?.close()}><X size={20} /></Button></div><p className="subtitle">Available throughout the workspace.</p><dl className="shortcut-list"><div><dt>Search tools</dt><dd><kbd>Ctrl / ⌘ K</kbd></dd></div><div><dt>Run current tool</dt><dd><kbd>Ctrl / ⌘ Enter</kbd></dd></div><div><dt>Reset current tool</dt><dd><kbd>Ctrl / ⌘ Shift ⌫</kbd></dd></div><div><dt>Show shortcuts</dt><dd><kbd>?</kbd></dd></div><div><dt>Close dialog / clear search</dt><dd><kbd>Esc</kbd></dd></div></dl></dialog>
    <dialog ref={privacy} className="modal" aria-labelledby="privacy-title"><div className="modal-heading"><h2 id="privacy-title">Privacy policy</h2><Button size="icon" variant="ghost" aria-label="Close privacy policy" onClick={() => privacy.current?.close()}><X size={20} /></Button></div><div className="privacy-text"><p>Every tool runs locally in your browser. DevKit has no backend, accounts, analytics, advertising, external database, or remote tool APIs.</p><p>Inputs and results live only in memory. Switching tools or reloading clears them. Only your theme and favorite tool IDs are saved in local storage. Your browser, clipboard manager, or other extensions may retain copied content.</p><p>The web host receives normal page and asset requests and may keep access logs under its own policy. Tool contents are never added to those requests. The installed production extension works offline.</p><p>An optional donation link opens Buy Me a Coffee only when you click it; their privacy policy then applies. Donations never unlock functionality.</p><p>The extension requests only the sidePanel permission to open Chrome’s side panel. It cannot read websites, browsing history, or page content.</p></div></dialog>
  </div>;
}

export function DevKitApp(props: DevKitAppProps) { return <AppErrorBoundary><WorkspaceApp {...props} /></AppErrorBoundary>; }

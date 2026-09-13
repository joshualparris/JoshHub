/* Josh Podcast Dock — canonical shared multi-topic client. Podcasts are opt-in. */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'josh-podcast-dock/v2';
  const LEGACY_KEY = 'josh-podcast-dock/v1';
  const TOPICS = {
    it:{name:'IT & MSP',label:'🎧 Listen to a different IT support podcast'},
    software:{name:'Software building',label:'🎧 Listen to a different software-building podcast'},
    research:{name:'Research & evidence',label:'🎧 Listen to a different research podcast'},
    faith:{name:'Faith',label:'🎧 Listen to a different faith podcast'},
    relationships:{name:'Relationships',label:'🎧 Listen to a different relationship-growth podcast'},
    career:{name:'Career',label:'🎧 Listen to a different career podcast'},
    decision:{name:'Decision making',label:'🧭 Listen to a different decision podcast'},
    homelab:{name:'Homelab & local AI',label:'🎧 Listen to a different homelab podcast'},
    horses:{name:'Horse therapy',label:'🐎 Listen to a different horse-therapy podcast'}
  };

  const emptyState = () => ({
    currentByTopic:{}, recentByTopic:{}, favourites:[], lastTopic:'', enabled:false
  });

  function normaliseEpisodes(entries) {
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries.filter((ep) => {
      if (!ep || typeof ep.id !== 'string' || !/^[A-Za-z0-9]{22}$/.test(ep.id)) return false;
      if (!ep.title || !ep.show || seen.has(ep.id)) return false;
      seen.add(ep.id);
      return true;
    });
  }

  function contextTerms(pathname) {
    return String(pathname || '').toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2);
  }

  function pickNext(entries, currentId, recentIds, terms, randomFn) {
    const valid = normaliseEpisodes(entries);
    if (!valid.length) return null;
    const recent = new Set(Array.isArray(recentIds) ? recentIds : []);
    let pool = valid.filter((ep) => ep.id !== currentId && !recent.has(ep.id));
    if (!pool.length) pool = valid.filter((ep) => ep.id !== currentId);
    if (!pool.length) pool = valid;
    const wanted = Array.isArray(terms) ? terms : [];
    const scored = pool.map((ep) => ({
      ep,
      score:wanted.reduce((n, t) => n + ([ep.title, ep.show].concat(ep.tags || []).join(' ').toLowerCase().includes(t) ? 1 : 0), 0)
    }));
    const max = Math.max(0, ...scored.map((x) => x.score));
    const best = max > 0 ? scored.filter((x) => x.score === max).map((x) => x.ep) : pool;
    const r = typeof randomFn === 'function' ? randomFn() : Math.random();
    return best[Math.min(best.length - 1, Math.floor(Math.max(0, Math.min(.999999, r)) * best.length))];
  }

  function parseState(storage, key) {
    try {
      const raw = storage && storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function readState(storage) {
    const current = parseState(storage, STORAGE_KEY);
    const legacy = parseState(storage, LEGACY_KEY);
    const source = current || legacy || {};
    return {
      currentByTopic:source && typeof source.currentByTopic === 'object' ? source.currentByTopic : {},
      recentByTopic:source && typeof source.recentByTopic === 'object' ? source.recentByTopic : {},
      favourites:Array.isArray(source && source.favourites) ? source.favourites : [],
      lastTopic:typeof(source && source.lastTopic) === 'string' ? source.lastTopic : '',
      enabled:current && typeof current.enabled === 'boolean' ? current.enabled : false
    };
  }

  function writeState(storage, state) {
    try {
      if (!storage) return false;
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  root.JoshPodcastDockCore = {normaliseEpisodes, pickNext, readState, writeState, contextTerms, emptyState};
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = root.JoshPodcastDockCore;
    return;
  }

  const script = document.currentScript;
  const cfg = script ? script.dataset : {};
  const requested = String(cfg.topics || 'it').split(',').map((x) => x.trim()).filter((x) => TOPICS[x]);
  if (!requested.length) return;

  const base = new URL('.', script && script.src ? script.src : document.baseURI);
  const state = readState(root.localStorage);
  if (cfg.defaultOn === 'true' && !parseState(root.localStorage, STORAGE_KEY)) state.enabled = true;
  writeState(root.localStorage, state);

  const catalogue = {};
  let topic = requested.includes(cfg.defaultTopic)
    ? cfg.defaultTopic
    : (requested.includes(state.lastTopic) ? state.lastTopic : requested[0]);
  let expanded = false;
  let runtimeHidden = false;
  let currentEpisode = null;

  const style = document.createElement('style');
  style.textContent = `
    #josh-podcast-dock{position:fixed;z-index:2147482000;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100vw - 16px));font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff}
    #josh-podcast-dock *{box-sizing:border-box}
    #jpd-bar,#jpd-panel{background:rgba(15,23,42,.96);border:1px solid rgba(148,163,184,.35);box-shadow:0 12px 40px rgba(2,6,23,.35);backdrop-filter:blur(12px)}
    #jpd-bar{display:flex;gap:8px;align-items:center;border-radius:999px;padding:8px}
    #jpd-main{flex:1;min-width:0;border:0;border-radius:999px;padding:11px 14px;background:#f8fafc;color:#0f172a;font-weight:750;text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #jpd-toggle,#jpd-close{width:40px;height:40px;flex:0 0 40px;border:0;border-radius:50%;background:#1e293b;color:#fff;cursor:pointer;font:700 18px/1 system-ui,-apple-system,"Segoe UI",sans-serif}
    #jpd-close{font-size:22px}
    #jpd-panel{display:none;margin-bottom:8px;border-radius:18px;padding:14px}
    #josh-podcast-dock[data-expanded=true] #jpd-panel{display:block}
    #josh-podcast-dock[data-hidden=true]{display:none}
    #jpd-reopen{position:fixed;z-index:2147481999;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));border:1px solid rgba(148,163,184,.45);border-radius:999px;padding:9px 12px;background:rgba(15,23,42,.94);color:#fff;box-shadow:0 8px 26px rgba(2,6,23,.28);backdrop-filter:blur(10px);cursor:pointer;font:700 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif}
    #jpd-reopen[hidden]{display:none}
    #jpd-head{display:flex;gap:8px;align-items:center;margin-bottom:10px}
    #jpd-topic{max-width:200px;background:#0b1220;color:#fff;border:1px solid #475569;border-radius:10px;padding:8px}
    #jpd-favourite{margin-left:auto;background:transparent;color:#fff;border:1px solid #475569;border-radius:10px;padding:8px 10px;cursor:pointer}
    #jpd-title{margin:2px 0 4px;font-size:16px;line-height:1.3}
    #jpd-meta{margin:0 0 10px;color:#cbd5e1;font-size:12px}
    #jpd-iframe{width:100%;height:152px;border:0;border-radius:12px;background:#0b1220}
    #jpd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    #jpd-actions button,#jpd-actions a{border:1px solid #475569;border-radius:10px;padding:8px 10px;background:#1e293b;color:#fff;text-decoration:none;cursor:pointer;font:inherit}
    #jpd-app-settings{box-sizing:border-box;margin:16px 0;padding:14px 16px;border:1px solid rgba(148,163,184,.38);border-radius:14px;background:rgba(148,163,184,.08);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:inherit}
    #jpd-app-settings .jpd-settings-line{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #jpd-app-settings .jpd-settings-copy{min-width:0}
    #jpd-app-settings .jpd-settings-title{display:block;font-weight:750;margin:0 0 2px}
    #jpd-app-settings .jpd-settings-help{display:block;opacity:.72;font-size:12px}
    #jpd-app-settings input{width:20px;height:20px;flex:0 0 auto;accent-color:currentColor}
    #josh-podcast-dock button:focus-visible,#josh-podcast-dock a:focus-visible,#josh-podcast-dock select:focus-visible,#jpd-app-settings input:focus-visible,#jpd-reopen:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}
    @media(max-width:640px){#josh-podcast-dock{width:calc(100vw - 10px);bottom:max(5px,env(safe-area-inset-bottom))}#jpd-reopen{right:max(6px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom))}}
    @media(prefers-reduced-motion:reduce){#josh-podcast-dock *{transition:none!important}}
  `;
  document.head.appendChild(style);

  const dock = document.createElement('section');
  dock.id = 'josh-podcast-dock';
  dock.dataset.expanded = 'false';
  dock.dataset.hidden = 'true';
  dock.setAttribute('aria-label', 'Podcast player');
  dock.innerHTML = `
    <div id="jpd-panel" role="region" aria-label="Podcast details">
      <div id="jpd-head">
        <select id="jpd-topic" aria-label="Podcast topic"></select>
        <button id="jpd-favourite" type="button" aria-label="Favourite current episode">☆ Favourite</button>
      </div>
      <h2 id="jpd-title">Loading podcasts…</h2>
      <p id="jpd-meta">Spotify playback starts only when you press play in the Spotify player.</p>
      <iframe id="jpd-iframe" title="Spotify podcast episode" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      <div id="jpd-actions">
        <button id="jpd-next" type="button">Different podcast</button>
        <a id="jpd-open" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a>
      </div>
    </div>
    <div id="jpd-bar">
      <button id="jpd-main" type="button" aria-expanded="false" aria-controls="jpd-panel">Loading podcasts…</button>
      <button id="jpd-toggle" type="button" aria-label="Expand podcast player" aria-expanded="false">⌃</button>
      <button id="jpd-close" type="button" aria-label="Close podcast dock" title="Close podcast dock">×</button>
    </div>`;
  document.body.appendChild(dock);

  const reopen = document.createElement('button');
  reopen.id = 'jpd-reopen';
  reopen.type = 'button';
  reopen.textContent = '⚙ Podcast settings';
  reopen.setAttribute('aria-label', 'Podcast settings. Podcasts are off; turn them on.');
  reopen.hidden = true;
  document.body.appendChild(reopen);

  const $ = (id) => dock.querySelector('#' + id);
  const main = $('jpd-main');
  const toggle = $('jpd-toggle');
  const close = $('jpd-close');
  const select = $('jpd-topic');
  const fav = $('jpd-favourite');
  const title = $('jpd-title');
  const meta = $('jpd-meta');
  const iframe = $('jpd-iframe');
  const open = $('jpd-open');
  const next = $('jpd-next');

  requested.forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = TOPICS[key].name;
    select.appendChild(option);
  });
  select.value = topic;
  select.hidden = requested.length === 1;

  function current() {
    const id = state.currentByTopic[topic];
    return normaliseEpisodes(catalogue[topic]).find((ep) => ep.id === id) || null;
  }

  function label() {
    return cfg.label || TOPICS[topic].label;
  }

  function setExpanded(value) {
    expanded = Boolean(value) && state.enabled;
    dock.dataset.expanded = expanded ? 'true' : 'false';
    main.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '⌄' : '⌃';
    toggle.setAttribute('aria-label', expanded ? 'Collapse podcast player' : 'Expand podcast player');
  }

  function render(ep) {
    currentEpisode = ep || null;
    main.textContent = label();
    main.disabled = !normaliseEpisodes(catalogue[topic]).length;
    if (!ep) {
      title.textContent = main.disabled ? 'Podcast bank unavailable' : 'Choose an episode';
      meta.textContent = main.disabled ? 'The curated catalogue could not be loaded.' : 'Press the main button for a curated Spotify episode.';
      iframe.removeAttribute('src');
      open.href = 'https://open.spotify.com/';
      fav.textContent = '☆ Favourite';
      return;
    }
    title.textContent = ep.title;
    meta.textContent = [ep.show, ep.duration, (ep.tags || []).join(' · ')].filter(Boolean).join(' · ');
    iframe.title = 'Spotify episode: ' + ep.title;
    if (state.enabled) iframe.src = 'https://open.spotify.com/embed/episode/' + ep.id + '?theme=0';
    open.href = 'https://open.spotify.com/episode/' + ep.id;
    fav.textContent = state.favourites.includes(ep.id) ? '★ Favourited' : '☆ Favourite';
  }

  function choose() {
    if (!state.enabled) return null;
    const ep = pickNext(
      catalogue[topic],
      state.currentByTopic[topic],
      state.recentByTopic[topic] || [],
      contextTerms(root.location && root.location.pathname),
      Math.random
    );
    if (!ep) {
      render(null);
      return null;
    }
    state.currentByTopic[topic] = ep.id;
    state.recentByTopic[topic] = [ep.id]
      .concat(state.recentByTopic[topic] || [])
      .filter((id, i, all) => all.indexOf(id) === i)
      .slice(0, 6);
    state.lastTopic = topic;
    writeState(root.localStorage, state);
    render(ep);
    setExpanded(true);
    return ep;
  }

  function syncSettingsControls() {
    document.querySelectorAll('[data-josh-podcast-setting],[data-jpd-enabled-control="true"]').forEach((control) => {
      if (control.matches('input[type="checkbox"]')) {
        control.checked = !!state.enabled;
        control.setAttribute('aria-checked', String(!!state.enabled));
      } else {
        control.setAttribute('aria-pressed', String(!!state.enabled));
      }
    });
  }

  function refreshVisibility() {
    const selectors = String(cfg.quietSelectors || '').split(',').map((s) => s.trim()).filter(Boolean);
    const quiet = selectors.some((selector) => {
      try { return !!document.querySelector(selector); } catch (_) { return false; }
    });
    const appHidden = runtimeHidden || document.body.dataset.podcastHidden === 'true';
    const hidden = !state.enabled || appHidden;
    dock.dataset.hidden = hidden ? 'true' : 'false';
    reopen.hidden = !!state.enabled || appHidden || quiet;
    if (quiet || hidden) setExpanded(false);
  }

  function setEnabled(value) {
    const changed = state.enabled !== Boolean(value);
    state.enabled = Boolean(value);
    writeState(root.localStorage, state);
    if (!state.enabled) {
      setExpanded(false);
      iframe.removeAttribute('src');
    } else if (currentEpisode || current()) {
      render(currentEpisode || current());
    }
    syncSettingsControls();
    refreshVisibility();
    if (changed) {
      try {
        document.dispatchEvent(new CustomEvent('josh-podcast:enabled-change', {detail:{enabled:state.enabled, topic}}));
      } catch (_) {}
    }
  }

  function bindSettingsControl(control) {
    if (!control || control.dataset.joshPodcastBound === 'true') return;
    control.dataset.joshPodcastBound = 'true';
    if (control.matches('input[type="checkbox"]')) {
      control.checked = !!state.enabled;
      control.addEventListener('change', () => setEnabled(control.checked));
    } else {
      control.setAttribute('role', control.getAttribute('role') || 'switch');
      control.addEventListener('click', () => setEnabled(!state.enabled));
    }
  }

  function findSettingsHost() {
    if (cfg.settingsTarget) {
      try {
        const explicit = document.querySelector(cfg.settingsTarget);
        if (explicit) return explicit;
      } catch (_) {}
    }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,[role="heading"]'));
    const heading = headings.find((el) => /^(settings|preferences)$/i.test((el.textContent || '').trim()));
    if (heading && !heading.closest('#josh-podcast-dock')) {
      return heading.closest('[role="dialog"],main,section,article,form') || heading.parentElement;
    }
    if (/\b(settings|preferences)\b/i.test(location.pathname + location.hash)) {
      return document.querySelector('main,[role="main"],section') || document.body;
    }
    return null;
  }

  function mountSettings() {
    document.querySelectorAll('[data-josh-podcast-setting],[data-jpd-enabled-control="true"]').forEach(bindSettingsControl);
    const host = findSettingsHost();
    if (!host || host.querySelector('#jpd-app-settings')) {
      syncSettingsControls();
      return;
    }
    const card = document.createElement('div');
    card.id = 'jpd-app-settings';
    card.innerHTML = `
      <label class="jpd-settings-line">
        <span class="jpd-settings-copy">
          <span class="jpd-settings-title">Podcast dock</span>
          <span class="jpd-settings-help">Optional. Off by default. Turn it on to show the podcast player; use × on the dock to close it again.</span>
        </span>
        <input type="checkbox" data-josh-podcast-setting aria-label="Show podcast dock">
      </label>`;
    host.appendChild(card);
    bindSettingsControl(card.querySelector('[data-josh-podcast-setting]'));
    syncSettingsControls();
  }

  main.addEventListener('click', choose);
  next.addEventListener('click', choose);
  toggle.addEventListener('click', () => {
    if (!current() && !expanded) choose();
    else setExpanded(!expanded);
  });
  close.addEventListener('click', () => setEnabled(false));
  reopen.addEventListener('click', () => setEnabled(true));
  fav.addEventListener('click', () => {
    const ep = current();
    if (!ep) return;
    state.favourites = state.favourites.includes(ep.id)
      ? state.favourites.filter((id) => id !== ep.id)
      : state.favourites.concat(ep.id);
    writeState(root.localStorage, state);
    render(ep);
  });
  select.addEventListener('change', () => {
    topic = select.value;
    state.lastTopic = topic;
    writeState(root.localStorage, state);
    render(current());
    if (state.enabled && !current()) choose();
  });

  if (cfg.quietOnInput === 'true') {
    document.addEventListener('focusin', (event) => {
      const el = event.target;
      if (el && el.matches && el.matches('textarea,[contenteditable=true],input:not([type=button]):not([type=checkbox]):not([type=radio])')) {
        setExpanded(false);
      }
    });
  }

  document.addEventListener('play', (event) => {
    if (event.target && /^(AUDIO|VIDEO)$/.test(event.target.tagName || '')) setExpanded(false);
  }, true);

  document.addEventListener('josh-podcast:hide', () => { runtimeHidden = true; refreshVisibility(); });
  document.addEventListener('josh-podcast:show', () => { runtimeHidden = false; refreshVisibility(); });
  document.addEventListener('josh-podcast:enable', () => setEnabled(true));
  document.addEventListener('josh-podcast:disable', () => setEnabled(false));
  document.addEventListener('josh-podcast:toggle', () => setEnabled(!state.enabled));

  root.JoshPodcastDock = Object.assign({}, root.JoshPodcastDock || {}, {
    enable:() => setEnabled(true),
    disable:() => setEnabled(false),
    toggle:() => setEnabled(!state.enabled),
    isEnabled:() => !!state.enabled,
    mountSettings,
    topic:() => topic
  });

  const onDomChange = () => { refreshVisibility(); mountSettings(); };
  root.addEventListener('popstate', onDomChange);
  root.addEventListener('hashchange', onDomChange);
  document.addEventListener('click', () => setTimeout(onDomChange, 0), true);
  if (root.MutationObserver) {
    new MutationObserver(onDomChange).observe(document.body, {
      childList:true, subtree:true, attributes:true,
      attributeFilter:['data-podcast-hidden','class','aria-hidden']
    });
  }

  Promise.all(requested.map((key) =>
    fetch(new URL('podcasts/' + key + '.json', base))
      .then((response) => response.ok ? response.json() : [])
      .catch(() => [])
      .then((data) => { catalogue[key] = normaliseEpisodes(data); })
  )).then(() => {
    render(current());
    refreshVisibility();
    mountSettings();
  });
})();

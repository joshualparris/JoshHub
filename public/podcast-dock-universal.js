/* Josh Podcast Dock Universal — reusable opt-in Spotify episode bank. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  const script = document.currentScript;
  if (!script) return;

  const cfg = script.dataset || {};
  const bank = String(cfg.bank || '').trim();
  if (!bank || !/^[a-z0-9-]+$/.test(bank)) return;

  const labels = {
    dnd: '🎲 Listen to a different D&D podcast',
    piano: '🎹 Listen to a different piano podcast',
    books: '📚 Listen to a different books podcast',
    chess: '♟️ Listen to a different chess podcast',
    gold: '⛏️ Listen to a different gold prospecting podcast',
    health: '💚 Listen to a different health podcast',
    radio: '📻 Listen to a different radio & SDR podcast',
    cards: '🃏 Listen to a different card-game podcast',
    career: '🎧 Listen to a different career podcast',
    it: '🎧 Listen to a different IT support podcast',
    software: '🎧 Listen to a different software-building podcast',
    research: '🎧 Listen to a different research podcast',
    faith: '🎧 Listen to a different faith podcast',
    relationships: '🎧 Listen to a different relationship-growth podcast',
    homelab: '🎧 Listen to a different homelab podcast',
    horses: '🐎 Listen to a different horse-therapy podcast'
  };

  const label = cfg.label || labels[bank] || '🎧 Listen to a different podcast';
  const key = 'josh-podcast-dock/universal/v2/' + bank;
  const legacyKey = 'josh-podcast-dock/universal/v1/' + bank;
  const base = new URL('.', script.src || document.baseURI);
  const onlyPaths = String(cfg.onlyPaths || '')
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);

  let episodes = [];
  let current = null;
  let expanded = false;
  let runtimeHidden = false;

  const parseStored = (storageKey) => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
    } catch (_) {
      return {};
    }
  };

  const legacyState = parseStored(legacyKey);
  const v2State = parseStored(key);
  const state = Object.assign({}, legacyState, v2State);
  state.recent = Array.isArray(state.recent) ? state.recent : [];
  state.favourites = Array.isArray(state.favourites) ? state.favourites : [];
  // v1 episode/favourite state may migrate, but the visibility preference does not.
  // v2 is deliberately opt-in unless this exact v2 state has already been enabled.
  state.enabled = typeof v2State.enabled === 'boolean' ? v2State.enabled : cfg.defaultOn === 'true';

  const write = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (_) {}
  };
  write();

  const valid = (episode) =>
    episode &&
    typeof episode.id === 'string' &&
    /^[A-Za-z0-9]{22}$/.test(episode.id) &&
    episode.title &&
    episode.show;

  const pick = () => {
    const recent = new Set(state.recent || []);
    let pool = episodes.filter((episode) => episode.id !== state.current && !recent.has(episode.id));
    if (!pool.length) pool = episodes.filter((episode) => episode.id !== state.current);
    if (!pool.length) pool = episodes.slice();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const pathAllowed = () =>
    !onlyPaths.length ||
    onlyPaths.some((rule) => {
      if (rule.endsWith('*')) return location.pathname.startsWith(rule.slice(0, -1));
      return location.pathname === rule;
    });

  const style = document.createElement('style');
  style.textContent = `
    #josh-universal-podcast{position:fixed;z-index:2147482000;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100vw - 16px));font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff}
    #jup-bar,#jup-panel{background:rgba(15,23,42,.96);border:1px solid rgba(148,163,184,.35);box-shadow:0 12px 40px rgba(2,6,23,.35);backdrop-filter:blur(12px)}
    #jup-bar{display:flex;gap:8px;align-items:center;border-radius:999px;padding:8px}
    #jup-main{flex:1;border:0;border-radius:999px;padding:11px 14px;background:#f8fafc;color:#0f172a;font-weight:750;text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #jup-toggle,#jup-close{width:40px;height:40px;flex:0 0 40px;border:0;border-radius:50%;background:#1e293b;color:#fff;cursor:pointer;font:700 18px/1 system-ui,-apple-system,"Segoe UI",sans-serif}
    #jup-close{font-size:22px}
    #jup-panel{display:none;margin-bottom:8px;border-radius:18px;padding:14px}
    #josh-universal-podcast[data-expanded=true] #jup-panel{display:block}
    #jup-title{font-size:16px;margin:0 0 4px}
    #jup-meta{color:#cbd5e1;font-size:12px;margin:0 0 10px}
    #jup-frame{width:100%;height:152px;border:0;border-radius:12px;background:#0b1220}
    #jup-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    #jup-actions button,#jup-actions a{border:1px solid #475569;border-radius:10px;padding:8px 10px;background:#1e293b;color:#fff;text-decoration:none;cursor:pointer;font:inherit}
    #josh-universal-podcast[data-hidden=true]{display:none}
    #jup-reopen{position:fixed;z-index:2147481999;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));border:1px solid rgba(148,163,184,.45);border-radius:999px;padding:9px 12px;background:rgba(15,23,42,.94);color:#fff;box-shadow:0 8px 26px rgba(2,6,23,.28);backdrop-filter:blur(10px);cursor:pointer;font:700 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif}
    #jup-reopen[hidden]{display:none}
    #josh-universal-podcast button:focus-visible,#josh-universal-podcast a:focus-visible,#jup-settings-row input:focus-visible,#jup-reopen:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}
    #jup-settings-row{box-sizing:border-box;margin:16px 0;padding:14px 16px;border:1px solid rgba(148,163,184,.38);border-radius:14px;background:rgba(148,163,184,.08);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:inherit}
    #jup-settings-row .jup-settings-line{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #jup-settings-row .jup-settings-copy{min-width:0}
    #jup-settings-row .jup-settings-title{display:block;font-weight:750;margin:0 0 2px}
    #jup-settings-row .jup-settings-help{display:block;opacity:.72;font-size:12px}
    #jup-settings-row input{width:20px;height:20px;flex:0 0 auto;accent-color:currentColor}
    @media(max-width:640px){#josh-universal-podcast{width:calc(100vw - 10px);bottom:max(5px,env(safe-area-inset-bottom))}#jup-reopen{right:max(6px,env(safe-area-inset-right));bottom:max(6px,env(safe-area-inset-bottom))}}
    @media(prefers-reduced-motion:reduce){#josh-universal-podcast *{transition:none!important}}
  `;
  document.head.appendChild(style);

  const dock = document.createElement('section');
  dock.id = 'josh-universal-podcast';
  dock.dataset.expanded = 'false';
  dock.dataset.hidden = 'true';
  dock.setAttribute('aria-label', 'Podcast player');
  dock.innerHTML = `
    <div id="jup-panel" role="region" aria-label="Podcast details">
      <h2 id="jup-title">Loading podcasts…</h2>
      <p id="jup-meta">Spotify playback starts only after you press play in the Spotify player.</p>
      <iframe id="jup-frame" title="Spotify podcast episode" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      <div id="jup-actions">
        <button id="jup-next" type="button">Different podcast</button>
        <button id="jup-fav" type="button">☆ Favourite</button>
        <a id="jup-open" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a>
      </div>
    </div>
    <div id="jup-bar">
      <button id="jup-main" type="button" aria-expanded="false" aria-controls="jup-panel">${label}</button>
      <button id="jup-toggle" type="button" aria-label="Expand podcast player" aria-expanded="false">⌃</button>
      <button id="jup-close" type="button" aria-label="Close podcast dock" title="Close podcast dock">×</button>
    </div>
  `;
  document.body.appendChild(dock);

  const reopen = document.createElement('button');
  reopen.id = 'jup-reopen';
  reopen.type = 'button';
  reopen.textContent = '⚙ Podcast settings';
  reopen.setAttribute('aria-label', 'Podcast settings. Podcasts are off; turn them on.');
  reopen.hidden = true;
  document.body.appendChild(reopen);

  const $ = (id) => dock.querySelector('#' + id);
  const main = $('jup-main');
  const toggle = $('jup-toggle');
  const close = $('jup-close');
  const title = $('jup-title');
  const meta = $('jup-meta');
  const frame = $('jup-frame');
  const next = $('jup-next');
  const fav = $('jup-fav');
  const open = $('jup-open');

  const setExpanded = (value) => {
    expanded = !!value;
    dock.dataset.expanded = expanded ? 'true' : 'false';
    main.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '⌄' : '⌃';
    toggle.setAttribute('aria-label', expanded ? 'Collapse podcast player' : 'Expand podcast player');
  };

  const render = (episode) => {
    current = episode || null;
    if (!episode) {
      title.textContent = episodes.length ? 'Choose an episode' : 'Podcast bank unavailable';
      meta.textContent = episodes.length
        ? 'Press the main button to choose a curated episode.'
        : 'The curated episode bank could not be loaded.';
      frame.removeAttribute('src');
      open.href = 'https://open.spotify.com/';
      fav.textContent = '☆ Favourite';
      main.disabled = !episodes.length;
      return;
    }

    main.disabled = false;
    title.textContent = episode.title;
    meta.textContent = [episode.show, episode.duration, (episode.tags || []).join(' · ')]
      .filter(Boolean)
      .join(' · ');
    if (state.enabled) frame.src = 'https://open.spotify.com/embed/episode/' + episode.id + '?theme=0';
    frame.title = 'Spotify episode: ' + episode.title;
    open.href = 'https://open.spotify.com/episode/' + episode.id;
    fav.textContent = state.favourites.includes(episode.id) ? '★ Favourited' : '☆ Favourite';
  };

  const syncSettingsControls = () => {
    document.querySelectorAll('[data-josh-podcast-setting]').forEach((control) => {
      if (control.matches('input[type="checkbox"]')) {
        control.checked = !!state.enabled;
        control.setAttribute('aria-checked', String(!!state.enabled));
      } else {
        control.setAttribute('aria-pressed', String(!!state.enabled));
      }
    });
  };

  const dispatchEnabledChange = () => {
    try {
      document.dispatchEvent(
        new CustomEvent('josh-podcast:enabled-change', { detail: { enabled: !!state.enabled, bank } })
      );
    } catch (_) {}
  };

  const refresh = () => {
    const selectors = String(cfg.quietSelectors || '')
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean);
    const quiet = selectors.some((selector) => {
      try {
        return !!document.querySelector(selector);
      } catch (_) {
        return false;
      }
    });
    const appHidden =
      runtimeHidden ||
      document.body.dataset.podcastHidden === 'true' ||
      !pathAllowed();
    const shouldHide = !state.enabled || appHidden;

    dock.dataset.hidden = shouldHide ? 'true' : 'false';
    reopen.hidden = !!state.enabled || appHidden || quiet;
    if (quiet || shouldHide) setExpanded(false);
  };

  const setEnabled = (value) => {
    const nextValue = !!value;
    const changed = state.enabled !== nextValue;
    state.enabled = nextValue;
    write();

    if (!state.enabled) {
      setExpanded(false);
      frame.removeAttribute('src');
    } else if (current) {
      frame.src = 'https://open.spotify.com/embed/episode/' + current.id + '?theme=0';
    }

    syncSettingsControls();
    refresh();
    if (changed) dispatchEnabledChange();
  };

  const choose = () => {
    if (!state.enabled) return;
    const episode = pick();
    if (!episode) {
      render(null);
      return;
    }
    state.current = episode.id;
    state.recent = [episode.id]
      .concat(state.recent || [])
      .filter((id, index, all) => all.indexOf(id) === index)
      .slice(0, 6);
    write();
    render(episode);
    setExpanded(true);
  };

  main.addEventListener('click', choose);
  next.addEventListener('click', choose);
  toggle.addEventListener('click', () => {
    if (!current && !expanded) choose();
    else setExpanded(!expanded);
  });
  close.addEventListener('click', () => setEnabled(false));
  reopen.addEventListener('click', () => setEnabled(true));
  fav.addEventListener('click', () => {
    if (!current) return;
    state.favourites = state.favourites.includes(current.id)
      ? state.favourites.filter((id) => id !== current.id)
      : state.favourites.concat(current.id);
    write();
    render(current);
  });

  const bindSettingsControl = (control) => {
    if (!control || control.dataset.joshPodcastBound === 'true') return;
    control.dataset.joshPodcastBound = 'true';

    if (control.matches('input[type="checkbox"]')) {
      control.checked = !!state.enabled;
      control.setAttribute('aria-label', control.getAttribute('aria-label') || 'Show podcast dock');
      control.addEventListener('change', () => setEnabled(control.checked));
    } else {
      control.setAttribute('role', control.getAttribute('role') || 'switch');
      control.setAttribute('aria-pressed', String(!!state.enabled));
      control.addEventListener('click', () => setEnabled(!state.enabled));
    }
  };

  const findSettingsHost = () => {
    if (cfg.settingsTarget) {
      try {
        const explicit = document.querySelector(cfg.settingsTarget);
        if (explicit) return explicit;
      } catch (_) {}
    }

    const headings = Array.from(document.querySelectorAll('h1,h2,h3,[role="heading"]'));
    const heading = headings.find((element) => /^(settings|preferences)$/i.test((element.textContent || '').trim()));
    if (heading && !heading.closest('#josh-universal-podcast')) {
      return heading.closest('[role="dialog"],main,section,article,form') || heading.parentElement;
    }

    if (/\b(settings|preferences)\b/i.test(location.pathname + location.hash)) {
      return document.querySelector('main,[role="main"],section') || document.body;
    }

    return null;
  };

  const mountSettingsControl = () => {
    document.querySelectorAll('[data-josh-podcast-setting]').forEach(bindSettingsControl);

    const host = findSettingsHost();
    if (!host || host.querySelector('#jup-settings-row')) {
      syncSettingsControls();
      return;
    }

    const row = document.createElement('div');
    row.id = 'jup-settings-row';
    row.setAttribute('data-josh-podcast-generated-setting', 'true');
    row.innerHTML = `
      <label class="jup-settings-line">
        <span class="jup-settings-copy">
          <span class="jup-settings-title">Podcast dock</span>
          <span class="jup-settings-help">Optional. Off by default. Turn it on to show the podcast player; use × on the dock to close it again.</span>
        </span>
        <input type="checkbox" data-josh-podcast-setting aria-label="Show podcast dock">
      </label>
    `;
    host.appendChild(row);
    bindSettingsControl(row.querySelector('[data-josh-podcast-setting]'));
    syncSettingsControls();
  };

  if (cfg.quietOnInput === 'true') {
    document.addEventListener('focusin', (event) => {
      const element = event.target;
      if (
        element &&
        element.matches &&
        element.matches('textarea,[contenteditable=true],input:not([type=button]):not([type=checkbox]):not([type=radio])')
      ) {
        setExpanded(false);
      }
    });
  }

  document.addEventListener(
    'play',
    (event) => {
      if (event.target && /^(AUDIO|VIDEO)$/.test(event.target.tagName || '')) setExpanded(false);
    },
    true
  );

  // Temporary visibility controls used by routes / safety / focused workflows.
  document.addEventListener('josh-podcast:hide', () => {
    runtimeHidden = true;
    refresh();
  });
  document.addEventListener('josh-podcast:show', () => {
    runtimeHidden = false;
    refresh();
  });

  // Persistent opt-in controls for app Settings integrations.
  document.addEventListener('josh-podcast:enable', () => setEnabled(true));
  document.addEventListener('josh-podcast:disable', () => setEnabled(false));
  document.addEventListener('josh-podcast:toggle', () => setEnabled(!state.enabled));

  window.JoshPodcastDock = Object.assign({}, window.JoshPodcastDock || {}, {
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    toggle: () => setEnabled(!state.enabled),
    isEnabled: () => !!state.enabled,
    mountSettings: mountSettingsControl,
    bank
  });

  const onRouteOrDomChange = () => {
    refresh();
    mountSettingsControl();
  };

  window.addEventListener('popstate', onRouteOrDomChange);
  window.addEventListener('hashchange', onRouteOrDomChange);
  document.addEventListener('click', () => setTimeout(onRouteOrDomChange, 0), true);

  if (window.MutationObserver) {
    new MutationObserver(onRouteOrDomChange).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-podcast-hidden', 'class', 'aria-hidden']
    });
  }

  fetch(new URL('podcasts/' + bank + '.json', base))
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then((data) => {
      const seen = new Set();
      episodes = (Array.isArray(data) ? data : []).filter(
        (episode) => valid(episode) && !seen.has(episode.id) && seen.add(episode.id)
      );
      const saved = episodes.find((episode) => episode.id === state.current);
      render(saved || null);
      refresh();
      mountSettingsControl();
    })
    .catch(() => {
      render(null);
      refresh();
      mountSettingsControl();
    });
})();

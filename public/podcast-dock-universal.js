/* Josh Podcast Dock Universal — reusable one-click Spotify episode bank. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const script = document.currentScript;
  if (!script) return;
  const cfg = script.dataset || {};
  const bank = String(cfg.bank || '').trim();
  if (!bank || !/^[a-z0-9-]+$/.test(bank)) return;
  const labels = {
    dnd:'🎲 Listen to a different D&D podcast', piano:'🎹 Listen to a different piano podcast',
    books:'📚 Listen to a different books podcast', chess:'♟️ Listen to a different chess podcast',
    gold:'⛏️ Listen to a different gold prospecting podcast', health:'💚 Listen to a different health podcast',
    radio:'📻 Listen to a different radio & SDR podcast', cards:'🃏 Listen to a different card-game podcast',
    career:'🎧 Listen to a different career podcast', it:'🎧 Listen to a different IT support podcast',
    software:'🎧 Listen to a different software-building podcast', research:'🎧 Listen to a different research podcast',
    faith:'🎧 Listen to a different faith podcast', relationships:'🎧 Listen to a different relationship-growth podcast',
    homelab:'🎧 Listen to a different homelab podcast', horses:'🐎 Listen to a different horse-therapy podcast'
  };
  const label = cfg.label || labels[bank] || '🎧 Listen to a different podcast';
  const key = 'josh-podcast-dock/universal/v1/' + bank;
  const base = new URL('.', script.src || document.baseURI);
  let episodes = [], current = null, expanded = false, hidden = false;
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; } };
  const state = read(); state.recent = Array.isArray(state.recent) ? state.recent : []; state.favourites = Array.isArray(state.favourites) ? state.favourites : [];
  const write = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} };
  const valid = ep => ep && typeof ep.id === 'string' && /^[A-Za-z0-9]{22}$/.test(ep.id) && ep.title && ep.show;
  const pick = () => {
    const recent = new Set(state.recent || []);
    let pool = episodes.filter(ep => ep.id !== state.current && !recent.has(ep.id));
    if (!pool.length) pool = episodes.filter(ep => ep.id !== state.current);
    if (!pool.length) pool = episodes.slice();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const style = document.createElement('style');
  style.textContent = '#josh-universal-podcast{position:fixed;z-index:2147482000;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100vw - 16px));font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff}#jup-bar,#jup-panel{background:rgba(15,23,42,.96);border:1px solid rgba(148,163,184,.35);box-shadow:0 12px 40px rgba(2,6,23,.35);backdrop-filter:blur(12px)}#jup-bar{display:flex;gap:8px;align-items:center;border-radius:999px;padding:8px}#jup-main{flex:1;border:0;border-radius:999px;padding:11px 14px;background:#f8fafc;color:#0f172a;font-weight:750;text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#jup-toggle{width:40px;height:40px;border:0;border-radius:50%;background:#1e293b;color:#fff;cursor:pointer}#jup-panel{display:none;margin-bottom:8px;border-radius:18px;padding:14px}#josh-universal-podcast[data-expanded=true] #jup-panel{display:block}#jup-title{font-size:16px;margin:0 0 4px}#jup-meta{color:#cbd5e1;font-size:12px;margin:0 0 10px}#jup-frame{width:100%;height:152px;border:0;border-radius:12px;background:#0b1220}#jup-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#jup-actions button,#jup-actions a{border:1px solid #475569;border-radius:10px;padding:8px 10px;background:#1e293b;color:#fff;text-decoration:none;cursor:pointer;font:inherit}#josh-universal-podcast[data-hidden=true]{display:none}#josh-universal-podcast button:focus-visible,#josh-universal-podcast a:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}@media(max-width:640px){#josh-universal-podcast{width:calc(100vw - 10px);bottom:max(5px,env(safe-area-inset-bottom))}}@media(prefers-reduced-motion:reduce){#josh-universal-podcast *{transition:none!important}}';
  document.head.appendChild(style);
  const dock = document.createElement('section');
  dock.id = 'josh-universal-podcast'; dock.dataset.expanded = 'false'; dock.setAttribute('aria-label','Podcast player');
  dock.innerHTML = '<div id="jup-panel" role="region" aria-label="Podcast details"><h2 id="jup-title">Loading podcasts…</h2><p id="jup-meta">Spotify playback starts only after you press play in the Spotify player.</p><iframe id="jup-frame" title="Spotify podcast episode" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><div id="jup-actions"><button id="jup-next" type="button">Different podcast</button><button id="jup-fav" type="button">☆ Favourite</button><a id="jup-open" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a></div></div><div id="jup-bar"><button id="jup-main" type="button" aria-expanded="false" aria-controls="jup-panel">'+label+'</button><button id="jup-toggle" type="button" aria-label="Expand podcast player" aria-expanded="false">⌃</button></div>';
  document.body.appendChild(dock);
  const $ = id => dock.querySelector('#'+id), main=$('jup-main'), toggle=$('jup-toggle'), title=$('jup-title'), meta=$('jup-meta'), frame=$('jup-frame'), next=$('jup-next'), fav=$('jup-fav'), open=$('jup-open');
  const setExpanded = v => { expanded=!!v; dock.dataset.expanded=expanded?'true':'false'; main.setAttribute('aria-expanded',String(expanded)); toggle.setAttribute('aria-expanded',String(expanded)); toggle.textContent=expanded?'⌄':'⌃'; toggle.setAttribute('aria-label',expanded?'Collapse podcast player':'Expand podcast player'); };
  const render = ep => {
    current = ep || null;
    if (!ep) { title.textContent=episodes.length?'Choose an episode':'Podcast bank unavailable'; meta.textContent=episodes.length?'Press the main button to choose a curated episode.':'The curated episode bank could not be loaded.'; frame.removeAttribute('src'); open.href='https://open.spotify.com/'; fav.textContent='☆ Favourite'; main.disabled=!episodes.length; return; }
    main.disabled=false; title.textContent=ep.title; meta.textContent=[ep.show,ep.duration,(ep.tags||[]).join(' · ')].filter(Boolean).join(' · '); frame.src='https://open.spotify.com/embed/episode/'+ep.id+'?theme=0'; frame.title='Spotify episode: '+ep.title; open.href='https://open.spotify.com/episode/'+ep.id; fav.textContent=state.favourites.includes(ep.id)?'★ Favourited':'☆ Favourite';
  };
  const choose = () => { const ep=pick(); if(!ep){render(null);return;} state.current=ep.id; state.recent=[ep.id].concat(state.recent||[]).filter((id,i,a)=>a.indexOf(id)===i).slice(0,6); write(); render(ep); setExpanded(true); };
  main.addEventListener('click',choose); next.addEventListener('click',choose); toggle.addEventListener('click',()=>{ if(!current&&!expanded) choose(); else setExpanded(!expanded); });
  fav.addEventListener('click',()=>{if(!current)return; state.favourites=state.favourites.includes(current.id)?state.favourites.filter(id=>id!==current.id):state.favourites.concat(current.id); write(); render(current);});
  const refresh = () => { const selectors=String(cfg.quietSelectors||'').split(',').map(s=>s.trim()).filter(Boolean); const quiet=selectors.some(sel=>{try{return !!document.querySelector(sel);}catch(_){return false;}}); dock.dataset.hidden=(hidden||document.body.dataset.podcastHidden==='true')?'true':'false'; if(quiet)setExpanded(false); };
  if(cfg.quietOnInput==='true'){document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.matches&&el.matches('textarea,[contenteditable=true],input:not([type=button]):not([type=checkbox]):not([type=radio])'))setExpanded(false);});}
  document.addEventListener('play',e=>{if(e.target&&/^(AUDIO|VIDEO)$/.test(e.target.tagName||''))setExpanded(false);},true);
  document.addEventListener('josh-podcast:hide',()=>{hidden=true;refresh();}); document.addEventListener('josh-podcast:show',()=>{hidden=false;refresh();});
  if(window.MutationObserver)new MutationObserver(refresh).observe(document.body,{attributes:true,subtree:true,attributeFilter:['data-podcast-hidden','class']});
  fetch(new URL('podcasts/'+bank+'.json',base)).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json();}).then(data=>{const seen=new Set();episodes=(Array.isArray(data)?data:[]).filter(ep=>valid(ep)&&!seen.has(ep.id)&&seen.add(ep.id)); const saved=episodes.find(ep=>ep.id===state.current); render(saved||null); refresh();}).catch(()=>render(null));
})();

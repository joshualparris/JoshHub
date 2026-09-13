/* Josh Podcast Dock — canonical shared client. No autoplay assumptions. */
(function (root) {
  "use strict";
  const STORAGE_KEY = "josh-podcast-dock/v1";
  const TOPICS = {
    it:{name:"IT & MSP",label:"🎧 Listen to a different IT support podcast"},
    software:{name:"Software building",label:"🎧 Listen to a different software-building podcast"},
    research:{name:"Research & evidence",label:"🎧 Listen to a different research podcast"},
    faith:{name:"Faith",label:"🎧 Listen to a different faith podcast"},
    relationships:{name:"Relationships",label:"🎧 Listen to a different relationship-growth podcast"},
    career:{name:"Career",label:"🎧 Listen to a different career podcast"},
    decision:{name:"Decision making",label:"🧭 Listen to a different decision podcast"},
    homelab:{name:"Homelab & local AI",label:"🎧 Listen to a different homelab podcast"},
    horses:{name:"Horse therapy",label:"🎧 Listen to a different horse-therapy podcast"}
  };
  const emptyState=()=>({currentByTopic:{},recentByTopic:{},favourites:[],lastTopic:""});
  function normaliseEpisodes(entries){
    if(!Array.isArray(entries)) return [];
    const seen=new Set();
    return entries.filter(ep=>{
      if(!ep||typeof ep.id!=="string"||!/^[A-Za-z0-9]{22}$/.test(ep.id)) return false;
      if(!ep.title||!ep.show||seen.has(ep.id)) return false;
      seen.add(ep.id); return true;
    });
  }
  function contextTerms(pathname){return String(pathname||"").toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2);}
  function pickNext(entries,currentId,recentIds,terms,randomFn){
    const valid=normaliseEpisodes(entries); if(!valid.length) return null;
    const recent=new Set(Array.isArray(recentIds)?recentIds:[]);
    let pool=valid.filter(ep=>ep.id!==currentId&&!recent.has(ep.id));
    if(!pool.length) pool=valid.filter(ep=>ep.id!==currentId);
    if(!pool.length) pool=valid;
    const wanted=Array.isArray(terms)?terms:[];
    const scored=pool.map(ep=>({ep,score:wanted.reduce((n,t)=>n+([ep.title,ep.show].concat(ep.tags||[]).join(" ").toLowerCase().includes(t)?1:0),0)}));
    const max=Math.max(0,...scored.map(x=>x.score));
    const best=max>0?scored.filter(x=>x.score===max).map(x=>x.ep):pool;
    const r=typeof randomFn==="function"?randomFn():Math.random();
    return best[Math.min(best.length-1,Math.floor(Math.max(0,Math.min(.999999,r))*best.length))];
  }
  function readState(storage){
    try{
      const raw=storage&&storage.getItem(STORAGE_KEY); if(!raw) return emptyState();
      const p=JSON.parse(raw);
      return {currentByTopic:p&&typeof p.currentByTopic==="object"?p.currentByTopic:{},recentByTopic:p&&typeof p.recentByTopic==="object"?p.recentByTopic:{},favourites:Array.isArray(p&&p.favourites)?p.favourites:[],lastTopic:typeof(p&&p.lastTopic)==="string"?p.lastTopic:""};
    }catch(_){return emptyState();}
  }
  function writeState(storage,state){try{if(!storage)return false;storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(_){return false;}}
  root.JoshPodcastDockCore={normaliseEpisodes,pickNext,readState,writeState,contextTerms};
  if(typeof document==="undefined"){if(typeof module!=="undefined"&&module.exports)module.exports=root.JoshPodcastDockCore;return;}

  const s=document.currentScript, cfg=s?s.dataset:{};
  const requested=String(cfg.topics||"it").split(",").map(x=>x.trim()).filter(x=>TOPICS[x]);
  if(!requested.length) return;
  const base=new URL(".",s&&s.src?s.src:document.baseURI);
  const state=readState(root.localStorage);
  const catalogue={};
  let topic=requested.includes(cfg.defaultTopic)?cfg.defaultTopic:(requested.includes(state.lastTopic)?state.lastTopic:requested[0]);
  let expanded=false, explicitlyHidden=false;

  const style=document.createElement("style");
  style.textContent=`#josh-podcast-dock{position:fixed;z-index:2147482000;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100vw - 24px));font:14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f8fafc}#josh-podcast-dock *{box-sizing:border-box}#jpd-bar,#jpd-panel{background:rgba(15,23,42,.96);border:1px solid rgba(148,163,184,.32);box-shadow:0 12px 40px rgba(2,6,23,.35);backdrop-filter:blur(14px)}#jpd-bar{display:flex;align-items:center;gap:8px;border-radius:999px;padding:8px}#jpd-main{flex:1;min-width:0;border:0;border-radius:999px;padding:10px 14px;background:#f8fafc;color:#0f172a;font-weight:700;cursor:pointer;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#jpd-toggle{width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;font-size:18px}#jpd-panel{display:none;margin-bottom:8px;border-radius:20px;padding:14px}#josh-podcast-dock[data-expanded=true] #jpd-panel{display:block}#jpd-head{display:flex;gap:8px;align-items:center;margin-bottom:10px}#jpd-topic{max-width:190px;background:#0b1220;color:#fff;border:1px solid #475569;border-radius:10px;padding:8px}#jpd-favourite{margin-left:auto;background:transparent;color:#fff;border:1px solid #475569;border-radius:10px;padding:8px 10px;cursor:pointer}#jpd-title{margin:2px 0 4px;font-size:16px;line-height:1.3}#jpd-meta{margin:0 0 10px;color:#cbd5e1;font-size:12px}#jpd-iframe{width:100%;height:152px;border:0;border-radius:12px;background:#0b1220}#jpd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#jpd-actions button,#jpd-actions a{border:1px solid #475569;border-radius:10px;padding:8px 10px;background:#1e293b;color:#fff;text-decoration:none;cursor:pointer;font:inherit}#jpd-actions button:focus-visible,#jpd-actions a:focus-visible,#jpd-main:focus-visible,#jpd-toggle:focus-visible,#jpd-topic:focus-visible,#jpd-favourite:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}#josh-podcast-dock[data-quiet=true] #jpd-panel{display:none}#josh-podcast-dock[data-hidden=true]{display:none}@media(max-width:640px){#josh-podcast-dock{width:calc(100vw - 12px);bottom:max(6px,env(safe-area-inset-bottom))}#jpd-panel{border-radius:16px;padding:12px}#jpd-main{font-size:13px}}@media(prefers-reduced-motion:reduce){#josh-podcast-dock *{transition:none!important}}`;
  document.head.appendChild(style);
  const dock=document.createElement("section");
  dock.id="josh-podcast-dock"; dock.setAttribute("aria-label","Podcast player"); dock.dataset.expanded="false";
  dock.innerHTML=`<div id="jpd-panel" role="region" aria-label="Podcast details"><div id="jpd-head"><select id="jpd-topic" aria-label="Podcast topic"></select><button id="jpd-favourite" type="button" aria-label="Favourite current episode">☆ Favourite</button></div><h2 id="jpd-title">Loading podcasts…</h2><p id="jpd-meta">Spotify playback starts only when you press play in the Spotify player.</p><iframe id="jpd-iframe" title="Spotify podcast episode" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><div id="jpd-actions"><button id="jpd-next" type="button">Different podcast</button><a id="jpd-open" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a></div></div><div id="jpd-bar"><button id="jpd-main" type="button" aria-expanded="false" aria-controls="jpd-panel">Loading podcasts…</button><button id="jpd-toggle" type="button" aria-label="Expand podcast player" aria-expanded="false">⌃</button></div>`;
  document.body.appendChild(dock);
  const $=id=>dock.querySelector("#"+id),main=$("jpd-main"),toggle=$("jpd-toggle"),select=$("jpd-topic"),fav=$("jpd-favourite"),title=$("jpd-title"),meta=$("jpd-meta"),iframe=$("jpd-iframe"),open=$("jpd-open"),next=$("jpd-next");
  requested.forEach(k=>{const o=document.createElement("option");o.value=k;o.textContent=TOPICS[k].name;select.appendChild(o);});
  select.value=topic; select.hidden=requested.length===1;
  function current(){const id=state.currentByTopic[topic];return normaliseEpisodes(catalogue[topic]).find(ep=>ep.id===id)||null;}
  function label(){return cfg.label||TOPICS[topic].label;}
  function setExpanded(v){expanded=Boolean(v);dock.dataset.expanded=expanded?"true":"false";main.setAttribute("aria-expanded",String(expanded));toggle.setAttribute("aria-expanded",String(expanded));toggle.setAttribute("aria-label",expanded?"Collapse podcast player":"Expand podcast player");toggle.textContent=expanded?"⌄":"⌃";}
  function render(ep){
    main.textContent=label(); main.disabled=!normaliseEpisodes(catalogue[topic]).length;
    if(!ep){title.textContent=main.disabled?"Podcast bank unavailable":"Choose an episode";meta.textContent=main.disabled?"The curated catalogue could not be loaded.":"Press the main button for a curated Spotify episode.";iframe.removeAttribute("src");open.href="https://open.spotify.com/";fav.textContent="☆ Favourite";return;}
    title.textContent=ep.title;meta.textContent=[ep.show,ep.duration,(ep.tags||[]).join(" · ")].filter(Boolean).join(" · ");
    iframe.title="Spotify episode: "+ep.title;iframe.src="https://open.spotify.com/embed/episode/"+ep.id+"?theme=0";open.href="https://open.spotify.com/episode/"+ep.id;fav.textContent=state.favourites.includes(ep.id)?"★ Favourited":"☆ Favourite";
  }
  function choose(){
    const ep=pickNext(catalogue[topic],state.currentByTopic[topic],state.recentByTopic[topic]||[],contextTerms(root.location&&root.location.pathname),Math.random);if(!ep){render(null);return null;}
    state.currentByTopic[topic]=ep.id;state.recentByTopic[topic]=[ep.id].concat(state.recentByTopic[topic]||[]).filter((id,i,a)=>a.indexOf(id)===i).slice(0,6);state.lastTopic=topic;writeState(root.localStorage,state);render(ep);return ep;
  }
  main.addEventListener("click",()=>{choose();setExpanded(true);});next.addEventListener("click",()=>{choose();setExpanded(true);});toggle.addEventListener("click",()=>{if(!current()&&!expanded)choose();setExpanded(!expanded);});
  select.addEventListener("change",()=>{topic=select.value;state.lastTopic=topic;writeState(root.localStorage,state);render(current());});
  fav.addEventListener("click",()=>{const ep=current();if(!ep)return;state.favourites=state.favourites.includes(ep.id)?state.favourites.filter(id=>id!==ep.id):state.favourites.concat(ep.id);writeState(root.localStorage,state);render(ep);});
  function refreshVisibility(){
    const selectors=String(cfg.quietSelectors||"").split(",").map(x=>x.trim()).filter(Boolean);
    const quiet=selectors.some(q=>{try{return Boolean(document.querySelector(q));}catch(_){return false;}});
    dock.dataset.hidden=(explicitlyHidden||(document.body&&document.body.dataset.podcastHidden==="true"))?"true":"false";
    if(quiet){dock.dataset.quiet="true";setExpanded(false);}else if(!dock.dataset.inputQuiet)dock.dataset.quiet="false";
  }
  if(cfg.quietOnInput==="true"){
    document.addEventListener("focusin",e=>{const el=e.target;if(el&&el.matches&&el.matches("textarea,[contenteditable=true],input:not([type=button]):not([type=checkbox]):not([type=radio])")){dock.dataset.inputQuiet="true";dock.dataset.quiet="true";setExpanded(false);}});
    document.addEventListener("focusout",()=>root.setTimeout(()=>{dock.dataset.inputQuiet="";dock.dataset.quiet="false";refreshVisibility();},0));
  }
  document.addEventListener("play",e=>{if(e.target&&/^(AUDIO|VIDEO)$/.test(e.target.tagName||""))setExpanded(false);},true);
  document.addEventListener("josh-podcast:hide",()=>{explicitlyHidden=true;refreshVisibility();});document.addEventListener("josh-podcast:show",()=>{explicitlyHidden=false;refreshVisibility();});
  document.addEventListener("josh-podcast:set-topic",e=>{const k=e&&e.detail&&e.detail.topic;if(requested.includes(k)){topic=k;select.value=k;state.lastTopic=k;writeState(root.localStorage,state);render(current());}});
  if(root.MutationObserver)new MutationObserver(refreshVisibility).observe(document.body,{attributes:true,subtree:true,attributeFilter:["data-podcast-hidden","class"]});
  Promise.all(requested.map(async k=>{try{const r=await fetch(new URL("podcasts/"+k+".json",base));if(!r.ok)throw new Error(String(r.status));catalogue[k]=normaliseEpisodes(await r.json());}catch(_){catalogue[k]=[];}})).then(()=>{render(current());refreshVisibility();});
})(typeof globalThis!=="undefined"?globalThis:window);

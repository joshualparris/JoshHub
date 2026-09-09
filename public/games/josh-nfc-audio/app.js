// app.js — main application logic: NFC, UI, playback
// Heavily commented for clarity.
(function(){
  // Elements
  const fileInput = document.getElementById('fileInput');
  const filePickBtn = document.getElementById('filePickBtn');
  const dropZone = document.getElementById('dropZone');
  const tracksList = document.getElementById('tracksList');
  const createCardBtn = document.getElementById('createCardBtn');
  const cardNameInput = document.getElementById('cardName');
  const cardsList = document.getElementById('cardsList');
  const writeCardSelect = document.getElementById('writeCardSelect');
  const startWriteBtn = document.getElementById('startWriteBtn');
  const writeStatus = document.getElementById('writeStatus');
  const scanBtn = document.getElementById('scanBtn');
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const playerTitle = document.getElementById('playerTitle');
  const playerTrack = document.getElementById('playerTrack');
  const playerCover = document.getElementById('playerCover');
  const audio = document.getElementById('audio');
  const seek = document.getElementById('seek');
  const volume = document.getElementById('volume');
  const keepPlaying = document.getElementById('keepPlaying');
  const darkToggle = document.getElementById('darkToggle');

  // App state
  let tracks = []; // list of track metadata from DB
  let cards = []; // list of cards from DB
  let activeCard = null; // currently playing card object
  let activeIndex = 0; // track index
  let isPlaying = false;
  let ndef = null; // NDEFReader instance
  // Base URL for deep links (works under GH Pages subpath)
  // Use an absolute base derived from the current location and write a query param
  const APP_BASE = new URL('./', location.href).href; // includes trailing slash
  function buildCardUrl(cardId){ return `${APP_BASE}?card=${encodeURIComponent(cardId)}`; }

  // Init UI
  (async function init(){
    attachUI();
    await refreshAll();
    // Try register service worker (use relative path & scope so it works under repo subpath)
    if('serviceWorker' in navigator){
      try{ await navigator.serviceWorker.register('./sw.js', { scope: './' }); console.log('sw registered'); }
      catch(e){console.warn('sw failed',e)}
    }
    // If opened via deep-link (hash or ?card=), attempt playback
    try{ handleDeepLinkIfPresent(); }catch(e){}
    // Setup NDEFReader instance when available and surface diagnostics if not
    const supportArea = document.getElementById('nfcHint');
    if('NDEFReader' in window){
      try{
        ndef = new NDEFReader();
        if(supportArea) supportArea.textContent = 'Web NFC available — Chrome on Android supported. Use Scan/Write buttons.';
      }catch(e){
        ndef = null;
        if(supportArea) supportArea.textContent = 'Web NFC present but NDEFReader construction failed: '+(e && e.message);
      }
    } else {
      if(supportArea) supportArea.innerHTML = `Web NFC not detected. Debug: <br><strong>userAgent:</strong> ${escapeHtml(navigator.userAgent)}<br><strong>isSecureContext:</strong> ${!!window.isSecureContext}<br><strong>location:</strong> ${escapeHtml(location.href)}<br><br>Web NFC requires Chrome on Android (not iOS) and the page must be served over HTTPS or localhost.`;
      document.getElementById('scanBtn').disabled = true;
    }
  })();

  function attachUI(){
    try{
      if(filePickBtn) filePickBtn.addEventListener('click',()=>fileInput && fileInput.click());
      if(fileInput) fileInput.addEventListener('change',handleFiles);
      if(dropZone){ ['dragenter','dragover'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.add('drag')})); ['dragleave','drop'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.remove('drag')})); dropZone.addEventListener('drop',e=>{handleFiles({target:{files:e.dataTransfer.files}})}); }
      if(createCardBtn) createCardBtn.addEventListener('click',createCardFromInput);
      if(startWriteBtn) startWriteBtn.addEventListener('click',startWriteFlow);
      if(scanBtn) scanBtn.addEventListener('click',startScan);
      const testTagBtn = document.getElementById('testTagBtn'); if(testTagBtn) testTagBtn.addEventListener('click',startTestTag);
      if(playBtn) playBtn.addEventListener('click',togglePlay);
      if(prevBtn) prevBtn.addEventListener('click',playPrev);
      if(nextBtn) nextBtn.addEventListener('click',playNext);
      if(audio) { audio.addEventListener('ended',onTrackEnded); audio.addEventListener('timeupdate',updateSeek); }
      if(seek) seek.addEventListener('input',onSeek);
      if(volume) volume.addEventListener('input',onVolumeChange);
      if(darkToggle) darkToggle.addEventListener('click',toggleDark);
      // Deep link overlay play button
      const deepPlayBtn = document.getElementById('deepPlayBtn'); if(deepPlayBtn) deepPlayBtn.addEventListener('click',async ()=>{ try{ await audio.play(); hideDeepPlayOverlay(); }catch(e){ /* user needs to interact */ } });
      // NFC debug UI (open overlay and populate info)
      const nfcDebugBtn = document.getElementById('nfcDebugBtn');
      if(nfcDebugBtn){
        try{
          nfcDebugBtn.addEventListener('click',openNfcDebug);
          // some Android embeders may not trigger click reliably; also listen for pointerdown
          nfcDebugBtn.addEventListener('pointerdown',()=>{});
          nfcDebugBtn.textContent = nfcDebugBtn.textContent + ' (ready)';
          console.log('NFC Debug listener attached');
        }catch(e){
          console.warn('failed attach nfcDebugBtn',e);
          nfcDebugBtn.textContent = nfcDebugBtn.textContent + ' (no-listener)';
        }
      }
      const closeDebug = document.getElementById('closeNfcDebug'); if(closeDebug) closeDebug.addEventListener('click',closeNfcDebug);
      const tryConstruct = document.getElementById('tryConstructNdef'); if(tryConstruct) tryConstruct.addEventListener('click',tryConstructNdef);
      // Export / Import handlers
      const exportBtn = document.getElementById('exportBtn'); if(exportBtn) exportBtn.addEventListener('click',onExportAll);
      const importBtn = document.getElementById('importBtn'); if(importBtn) importBtn.addEventListener('click',()=>{ const f = document.getElementById('importFile'); if(f) f.click(); });
      const importFile = document.getElementById('importFile'); if(importFile) importFile.addEventListener('change',onImportFile);
    }catch(err){ console.warn('attachUI failed',err); }
  }

  // Deep-link handling: if app opened with #card=<id> or ?card=<id>, load and attempt playback
  async function handleDeepLinkIfPresent(){
    // Prefer query param ?card= for cross-platform URL-on-tag behavior, fall back to #card=
    const qp = new URLSearchParams(location.search);
    let id = null;
    if(qp.has('card')) id = qp.get('card');
    if(!id){ const hash = location.hash || ''; if(hash.startsWith('#card=')) id = decodeURIComponent(hash.slice(6)); }
    if(!id) return;
    const c = await DB.getCard(id);
    if(!c) return;
    // try to auto-play (user gesture may be required)
    await startCardPlayback(c);
    // if autoplay blocked, show big play overlay
    if(!isPlaying){ showDeepPlayOverlay(); }
  }

  // NFC debug overlay helpers
  function openNfcDebug(){
    const ov = document.getElementById('nfcDebugOverlay'); if(!ov) return; ov.style.display='flex';
    // Also populate the inline quick status immediately so users in mirrored/remote sessions see output
    try{ quickNfcReport(); }catch(e){}
    const info = document.getElementById('nfcDebugInfo');
    const lines = [];
    lines.push(`userAgent: ${navigator.userAgent}`);
    lines.push(`vendor: ${navigator.vendor}`);
    lines.push(`platform: ${navigator.platform}`);
    lines.push(`isSecureContext: ${!!window.isSecureContext}`);
    lines.push(`location: ${location.href}`);
    lines.push(`NDEFReader in window: ${'NDEFReader' in window}`);
    if(typeof navigator.permissions !== 'undefined' && navigator.permissions.query){
      // show permission state for nfc if available
      try{ navigator.permissions.query({name:'nfc'}).then(s=>{ const p = `permission (nfc): ${s.state}`; const el=document.getElementById('nfcDebugInfo'); if(el) el.textContent = lines.join('\n') + '\n' + p; }).catch(()=>{}); }
      catch(e){}
    }
    if(info) info.textContent = lines.join('\n');
    const result = document.getElementById('nfcDebugResult'); if(result) result.textContent='';
  }
  function closeNfcDebug(){ const ov=document.getElementById('nfcDebugOverlay'); if(ov) ov.style.display='none'; }
  async function tryConstructNdef(){
    const res = document.getElementById('nfcDebugResult'); if(!res) return;
    try{
      const obj = new NDEFReader();
      res.textContent = 'NDEFReader constructed successfully.\nAttempting scan() may require user gesture and foreground tab.';
      // cleanup if possible
      try{ if(obj && obj.scan) { /* do not start scan automatically */ } }catch(e){}
    }catch(err){
      res.textContent = `Failed to construct NDEFReader: ${err && err.name}: ${err && err.message}\n\nStack:\n${err && err.stack || ''}`;
    }
  }

  // Quick inline NFC report (fallback if overlay doesn't appear)
  async function quickNfcReport(){
    const el = document.getElementById('nfcQuickStatus'); if(!el) return;
    el.style.display = 'block';
    const lines = [];
    lines.push(`userAgent: ${navigator.userAgent}`);
    lines.push(`isSecureContext: ${!!window.isSecureContext}`);
    lines.push(`location: ${location.href}`);
    lines.push(`NDEFReader in window: ${'NDEFReader' in window}`);
    el.textContent = lines.join('\n');
    try{
      const obj = new NDEFReader();
      el.textContent += '\n\nNDEFReader constructed OK. Note: scan() requires a user gesture and foreground tab.';
    }catch(err){
      el.textContent += `\n\nNDEFReader construction failed: ${err && err.name}: ${err && err.message}`;
    }
  }

  function showDeepPlayOverlay(){
    const ov = document.getElementById('deepPlayOverlay'); if(!ov) return; ov.style.display='flex';
  }
  function hideDeepPlayOverlay(){ const ov = document.getElementById('deepPlayOverlay'); if(!ov) return; ov.style.display='none'; }

  async function refreshAll(){
    tracks = await DB.listTracks();
    cards = await DB.listCards();
    renderTracks();
    renderCards();
    populateWriteSelect();
  }

  // Handle file uploads
  async function handleFiles(e){
    const files = e.target.files;
    for(const f of files){
      // accept audio files only
      if(!f.type.startsWith('audio')) continue;
      await DB.addTrack(f);
    }
    await refreshAll();
  }

  function renderTracks(){
    tracksList.innerHTML = '';
    if(tracks.length===0){ tracksList.textContent='No tracks uploaded yet.'; return }
    tracks.forEach(t=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<div><strong>${escapeHtml(t.name)}</strong></div>
        <div class="small">${Math.round(t.size/1024)} KB</div>
        <div class="row"><button data-id="${t.id}" class="btn addTrack">Add to Card</button>
        <button data-id="${t.id}" class="btn small delTrack">Delete</button></div>`;
      tracksList.appendChild(el);
    });
    // attach add/delete handlers
    tracksList.querySelectorAll('.addTrack').forEach(b=>b.addEventListener('click',onAddTrackToCard));
    tracksList.querySelectorAll('.delTrack').forEach(b=>b.addEventListener('click',async ev=>{await DB.deleteTrack(ev.target.dataset.id);await refreshAll()}));
  }

  function renderCards(){
    cardsList.innerHTML='';
    if(cards.length===0){cardsList.textContent='No cards yet.';return}
    cards.forEach(c=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${escapeHtml(c.name)}</strong>
        <div><button data-id="${c.id}" class="btn small playCard">▶</button>
        <button data-id="${c.id}" class="btn small editCard">✏️</button>
        <button data-id="${c.id}" class="btn small copyLink">🔗</button>
        <button data-id="${c.id}" class="btn small delCard">🗑</button></div></div>
        <div class="small">${c.tracks.length} tracks</div>`;
      cardsList.appendChild(el);
    });
    // handlers
    cardsList.querySelectorAll('.playCard').forEach(b=>b.addEventListener('click',async ev=>{const cid=ev.target.dataset.id;const c=await DB.getCard(cid);startCardPlayback(c);}));
    cardsList.querySelectorAll('.delCard').forEach(b=>b.addEventListener('click',async ev=>{if(confirm('Delete card?')){await DB.deleteCard(ev.target.dataset.id);await refreshAll();}}));
    cardsList.querySelectorAll('.editCard').forEach(b=>b.addEventListener('click',ev=>editCard(ev.target.dataset.id)));
    // copy link handlers
    cardsList.querySelectorAll('.copyLink').forEach(b=>b.addEventListener('click',async ev=>{
      const id = ev.target.dataset.id;
      const url = buildCardUrl(id);
      try{ await navigator.clipboard.writeText(url); alert('Link copied to clipboard'); }
      catch(e){ prompt('Copy this link', url); }
    }));
  }

  function populateWriteSelect(){
    writeCardSelect.innerHTML='';
    cards.forEach(c=>{
      const opt = document.createElement('option'); opt.value=c.id; opt.textContent=c.name; writeCardSelect.appendChild(opt);
    });
  }

  async function createCardFromInput(){
    const name = cardNameInput.value.trim()||`Card ${new Date().toLocaleString()}`;
    const rec = await DB.createCard({name,trackIds:[]});
    cardNameInput.value='';
    await refreshAll();
    alert('Card created: '+rec.name);
  }

  async function onAddTrackToCard(ev){
    const tid = ev.target.dataset.id;
    // choose card - simple prompt (could be a better UI)
    if(cards.length===0){ alert('Create a card first'); return }
    const choice = prompt('Enter card name (or blank to add to first):','');
    let card = cards[0];
    if(choice){ card = cards.find(c=>c.name===choice) || card }
    card.tracks.push(tid);
    await DB.createCard({id:card.id,name:card.name,coverDataUrl:card.cover,trackIds:card.tracks});
    await refreshAll();
    alert('Added to '+card.name);
  }

  async function startWriteFlow(){
    if(!ndef){ writeStatus.textContent='Web NFC not supported on this device/browser.'; return }
    const cardId = writeCardSelect.value;
    if(!cardId){ writeStatus.textContent='Select a card to write.'; return }
    writeStatus.textContent='Tap a blank card to write...';
    try{
      // Compose payload: default to URL deep-link for best cross-platform behaviour
      const writeType = (document.getElementById('writeTypeSelect')||{}).value || 'url';
      let appUrl = '';
      if(writeType === 'url'){
        appUrl = buildCardUrl(cardId);
        await ndef.write({records:[{recordType:'url',data:appUrl}]});
      }else{
        await ndef.write({records:[{recordType:'text',data:cardId}]});
        appUrl = buildCardUrl(cardId);
      }
      writeStatus.innerHTML = `Write successful ✅ <span class="small">${escapeHtml(cardId)}</span> <button id="copyAfterWrite" class="btn small">Copy Link</button>`;
      // attach copy handler
      setTimeout(()=>{
        const b = document.getElementById('copyAfterWrite');
        if(b) b.addEventListener('click',async ()=>{ try{ await navigator.clipboard.writeText(appUrl); alert('Link copied'); }catch(e){ prompt('Copy this link', appUrl);} });
      },100);
      // Try to verify the write by scanning briefly and capture tag UID for fallback
      try{
        const verify = await tryVerifyWrite(appUrl, cardId);
        if(verify && verify.ok){
          writeStatus.innerHTML += ` <span class="small">✅ verified</span>`;
        }else{
          writeStatus.innerHTML += ` <span class="small" style="color:orange">(not verified)</span>`;
        }
      }catch(e){ console.warn('verify failed',e); }
      // small success animation - clear after a short delay
      setTimeout(()=>{ if(writeStatus) writeStatus.textContent=''; },4000);
    }catch(err){
      writeStatus.textContent='Write failed: '+err.message;
    }
  }

  // Attempt a short scan to verify a recently-written NDEF URL and map tag UID to card
  async function tryVerifyWrite(expectedUrl, cardId){
    if(!ndef) return {ok:false,reason:'no-ndef'};
    let controller = null;
    try{
      controller = new AbortController();
      await ndef.scan({signal: controller.signal});
    }catch(e){
      return {ok:false,reason:'scan-start-failed',error:e};
    }
    return new Promise((resolve)=>{
      let done = false;
      const timeout = setTimeout(()=>{ if(!done){ done=true; try{ controller.abort(); }catch(e){} resolve({ok:false,reason:'timeout'}); } }, 3000);
      ndef.onreading = async (ev)=>{
        try{
          const uid = ev.serialNumber || null;
          const recs = ev.message && ev.message.records || [];
          for(const r of recs){
            let text = '';
            if(r.recordType === 'url' || r.recordType === 'text'){
              try{ text = new TextDecoder('utf-8').decode(r.data); }catch(e){}
            }
            if(text && (text === expectedUrl || text.includes(cardId))){
              done = true; clearTimeout(timeout);
              try{ controller.abort(); }catch(e){}
              if(uid) await DB.mapUidToCard(uid, cardId);
              resolve({ok:true,uid});
              return;
            }
          }
        }catch(e){/* ignore read errors */}
      };
      ndef.onreadingerror = ()=>{};
    });
  }

  async function startScan(){
    if(!ndef){ alert('Web NFC not supported in this browser. Chrome on Android required.'); return }
    try{
      await ndef.scan();
      ndef.onreadingerror = () => console.log('NFC read error');
      ndef.onreading = async (ev)=>{
        // read NDEF message
        const msgs = ev.message.records;
        let foundAny = false;
        for(const r of msgs){
          try{
            let text='';
            if(r.recordType==='text'){
              const decoder = new TextDecoder(r.encoding||'utf-8');
              text = decoder.decode(r.data);
            }else if(r.recordType==='url'){
              const decoder = new TextDecoder('utf-8'); text = decoder.decode(r.data);
            }
            console.log('NFC read',text);
            foundAny = true;
            const handled = await handleCardTap(text);
            if(handled) return; // stop if handled
          }catch(e){console.warn('read record failed',e)}
        }
        // If no records matched or message empty, try UID fallback
        if(!foundAny){
          const uid = ev.serialNumber || null;
          if(uid){
            const cid = await DB.getCardIdByUid(uid);
            if(cid){ const c = await DB.getCard(cid); if(c){ startCardPlayback(c); return; } }
          }
          alert('Card not recognized (empty payload)');
        }
      };
      scanBtn.textContent='Scanning… Tap a card';
    }catch(err){
      alert('NFC scan failed: '+err.message);
    }
  }

  async function handleCardTap(text){
    // Accept various payload formats: card://id, plain id, or a URL containing #card= or ?card=
    let id = null;
    if(!text) return;
    const t = text.trim();
    if(t.startsWith('card://')) id = t.slice(7);
    else if(t.startsWith('http://') || t.startsWith('https://')){
      try{
        const u = new URL(t);
        const qp = new URLSearchParams(u.search);
        if(qp.has('card')) id = qp.get('card');
        else if(u.hash && u.hash.includes('card=')){ const hp = new URLSearchParams(u.hash.replace(/^#/,'')); if(hp.has('card')) id = hp.get('card'); }
        else {
          const parts = u.pathname.split('/').filter(Boolean);
          if(parts.length) id = parts[parts.length-1];
        }
      }catch(e){ /* not a URL */ }
    } else {
      id = t;
    }

    if(!id){
      // not parsed — return false so caller may try UID fallback
      return false;
    }
    // find card
    const c = await DB.getCard(id);
    if(!c){
      // not found by id
      return false;
    }
    // If a card tapped, start playback immediately, stopping any existing
    startCardPlayback(c);
    return true;
  }

  async function startCardPlayback(card){
    activeCard = card;
    activeIndex = 0;
    updatePlayerMeta();
    await loadAndPlayIndex(activeIndex);
  }

  async function loadAndPlayIndex(idx){
    if(!activeCard) return;
    const tid = activeCard.tracks[idx];
    if(!tid){ console.log('no track at index',idx); stopPlayback(); return }
    const t = await DB.getTrack(tid);
    if(!t){ console.warn('track missing',tid); return }
    const url = URL.createObjectURL(t.blob);
    audio.src = url;
    audio.volume = Math.min(0.7, parseFloat(volume.value)); // safe cap ~70%
    try{ await audio.play(); isPlaying=true; playBtn.textContent='⏸'; }
    catch(e){console.warn('autoplay prevented',e); isPlaying=false; playBtn.textContent='▶️';}
    updatePlayerMeta();
  }

  function updatePlayerMeta(){
    if(!activeCard){ playerTitle.textContent='No card tapped'; playerTrack.textContent='—'; playerCover.src=''; return }
    playerTitle.textContent = activeCard.name;
    playerTrack.textContent = (activeCard.tracks[activeIndex]||'') ? `Track ${activeIndex+1} of ${activeCard.tracks.length}` : '—';
    if(activeCard.cover) playerCover.src = activeCard.cover; else playerCover.src='';
  }

  function onTrackEnded(){
    if(activeCard && activeIndex < activeCard.tracks.length-1){ activeIndex++; loadAndPlayIndex(activeIndex); }
    else{ stopPlayback(); }
  }

  function stopPlayback(){ audio.pause(); isPlaying=false; playBtn.textContent='▶️'; }

  function togglePlay(){ if(isPlaying){ audio.pause(); isPlaying=false; playBtn.textContent='▶️'; } else { audio.play(); isPlaying=true; playBtn.textContent='⏸'; } }
  function playPrev(){ if(!activeCard) return; activeIndex = Math.max(0,activeIndex-1); loadAndPlayIndex(activeIndex); }
  function playNext(){ if(!activeCard) return; activeIndex = Math.min(activeCard.tracks.length-1, activeIndex+1); loadAndPlayIndex(activeIndex); }

  function updateSeek(){ if(!audio.duration || isNaN(audio.duration)) return; seek.max = Math.floor(audio.duration); seek.value = Math.floor(audio.currentTime); }
  function onSeek(e){ audio.currentTime = e.target.value; }
  function onVolumeChange(e){ audio.volume = Math.min(0.7, parseFloat(e.target.value)); }

  function toggleDark(){ document.body.classList.toggle('light'); }

  // Export/import handlers
  async function onExportAll(){
    try{
      const json = await DB.exportAll();
      // include uid mappings
      const uids = await (async ()=>{ try{ return await withStoreGetAll('uids'); }catch(e){return[];} })();
      const obj = JSON.parse(json);
      obj.uids = uids || [];
      const blob = new Blob([JSON.stringify(obj)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'josh-nfcaudio-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch(e){ alert('Export failed: '+(e&&e.message)); }
  }
  async function onImportFile(e){
    const f = e.target.files && e.target.files[0]; if(!f) return; const txt = await f.text(); try{ await DB.importAll(txt); await refreshAll(); alert('Import complete'); }catch(err){ alert('Import failed: '+err.message); }
    e.target.value = '';
  }

  // Helper to read all entries from a store (used for export uids)
  async function withStoreGetAll(storeName){
    const db = await (async()=>{return new Promise((res,rej)=>{const r=indexedDB.open('nfc-audio-db'); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);})();})();
    return new Promise((resolve,reject)=>{ const tx = db.transaction(storeName); const req = tx.objectStore(storeName).getAll(); req.onsuccess = ()=>resolve(req.result||[]); req.onerror = ()=>reject(req.error); });
  }

  // small edit card UI (rudimentary)
  async function editCard(id){
    const c = await DB.getCard(id);
    if(!c) return;
    const newName = prompt('Card name', c.name);
    if(newName===null) return;
    c.name = newName;
    await DB.createCard({id:c.id,name:c.name,coverDataUrl:c.cover,trackIds:c.tracks});
    await refreshAll();
  }

  // Utility
  function escapeHtml(s){ return s.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch])) }

})();

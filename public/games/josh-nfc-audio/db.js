// db.js — small IndexedDB helper for tracks and cards
// Stores audio blobs and card definitions. Uses Promises for convenience.
(function(){
  const DB_NAME = 'nfc-audio-db';
  const DB_VERSION = 2;
  let dbPromise = null;

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded = (ev)=>{
        const db = ev.target.result;
        if(!db.objectStoreNames.contains('tracks')){
          const s = db.createObjectStore('tracks',{keyPath:'id'});
          s.createIndex('by-name','name',{unique:false});
        }
        if(!db.objectStoreNames.contains('cards')){
          const s = db.createObjectStore('cards',{keyPath:'id'});
          s.createIndex('by-name','name',{unique:false});
        }
        // New store to map NFC tag serialNumber (UID) to card id for fallback lookups
        if(!db.objectStoreNames.contains('uids')){
          const s = db.createObjectStore('uids',{keyPath:'uid'});
          s.createIndex('by-uid','uid',{unique:true});
        }
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error);
    });
    return dbPromise;
  }

  async function withStore(storeName, mode, cb){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result;
      try{
        result = cb(store);
      }catch(err){reject(err)}
      tx.oncomplete = ()=>resolve(result);
      tx.onerror = ()=>reject(tx.error);
    });
  }

  // Helpers
  function genId(prefix='id'){return `${prefix}-${Date.now()}-${Math.floor(Math.random()*1e6)}`}

  window.DB = {
    // add a track file (File/Blob). Returns metadata including id
    async addTrack(file){
      const id = genId('track');
      const record = {id, name:file.name, type:file.type, size:file.size, created:Date.now(), blob:file};
      await withStore('tracks','readwrite',s=>s.add(record));
      return record;
    },
    async getTrack(id){
      const db = await openDB();
      return new Promise((resolve,reject)=>{
        const tx = db.transaction('tracks');
        const req = tx.objectStore('tracks').get(id);
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
      });
    },
    async listTracks(){
      const db = await openDB();
      return new Promise((resolve,reject)=>{
        const tx = db.transaction('tracks');
        const req = tx.objectStore('tracks').getAll();
        req.onsuccess = ()=>resolve(req.result||[]);
        req.onerror = ()=>reject(req.error);
      });
    },
    async deleteTrack(id){
      await withStore('tracks','readwrite',s=>s.delete(id));
    },
    async createCard({id, name, coverDataUrl, trackIds}){
      const cardId = id || genId('card');
      const rec = {id:cardId,name:name||'Untitled',cover:coverDataUrl||'',tracks:trackIds||[],created:Date.now()};
      await withStore('cards','readwrite',s=>s.put(rec));
      return rec;
    },
    async getCard(id){
      const db = await openDB();
      return new Promise((resolve,reject)=>{
        const req = db.transaction('cards').objectStore('cards').get(id);
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
      });
    },
    async listCards(){
      const db = await openDB();
      return new Promise((resolve,reject)=>{
        const req = db.transaction('cards').objectStore('cards').getAll();
        req.onsuccess = ()=>resolve(req.result||[]);
        req.onerror = ()=>reject(req.error);
      });
    },
    async deleteCard(id){
      await withStore('cards','readwrite',s=>s.delete(id));
    },
    async exportAll(){
      const [cards,tracks] = await Promise.all([this.listCards(),this.listTracks()]);
      // Convert blobs to base64 to produce JSON that can be re-imported
      const tracksData = await Promise.all(tracks.map(async t=>{
        const base = await blobToBase64(t.blob);
        return {...t, blob:base};
      }));
      return JSON.stringify({cards,tracks:tracksData});
    },
    async importAll(json){
      const data = typeof json==='string'?JSON.parse(json):json;
      // Import tracks then cards
      for(const t of data.tracks||[]){
        const blob = base64ToBlob(t.blob, t.type||'audio/mpeg');
        await withStore('tracks','readwrite',s=>s.put({...t, blob}));
      }
      for(const c of data.cards||[]){
        await withStore('cards','readwrite',s=>s.put(c));
      }
      // Optionally import uid mappings if present
      if(data.uids && Array.isArray(data.uids)){
        for(const m of data.uids){
          await withStore('uids','readwrite',s=>s.put(m));
        }
      }
    }
    // Map a tag UID to a card id
    async mapUidToCard(uid, cardId){
      if(!uid) return;
      await withStore('uids','readwrite',s=>s.put({uid,cardId,created:Date.now()}));
    },
    async getCardIdByUid(uid){
      if(!uid) return null;
      const db = await openDB();
      return new Promise((resolve,reject)=>{
        const req = db.transaction('uids').objectStore('uids').get(uid);
        req.onsuccess = ()=>resolve(req.result?req.result.cardId:null);
        req.onerror = ()=>reject(req.error);
      });
    },
  };

  // Helpers to convert blob/base64
  function blobToBase64(blob){
    return new Promise((res)=>{
      const r = new FileReader();
      r.onload = ()=>res(r.result);
      r.readAsDataURL(blob);
    });
  }
  function base64ToBlob(dataurl, mime){
    const parts = dataurl.split(',');
    const bstr = atob(parts[1]);
    let n = bstr.length; const u8 = new Uint8Array(n);
    while(n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8],{type:mime});
  }

  // Try to request persistent storage (user gesture may be required)
  (async function tryPersistent(){
    if(navigator.storage && navigator.storage.persist){
      try{ await navigator.storage.persist(); }catch(e){}
    }
  })();

})();

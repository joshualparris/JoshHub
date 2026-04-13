/* portal-adapter.js — Parris Multiverse v1.0 */
const PortalAdapter=(()=>{
  const HUB="https://josh-hub-96no.vercel.app/portal.html";
  const LABELS={"whispering-wilds":"Whispering Wilds","null":"Null","mystery-depths":"Mystery Depths","infinite-office":"The Infinite Office","wastes-courier":"Wastes Courier","simple-rpg":"Simple RPG","midnight-line":"The Midnight Line","starhaven":"Starhaven","whirring-wilderness":"Whirring Wilderness","dark-realms":"Dark Realms","classic-dnd":"Classic D&D","dnd-dungeon":"D&D RPG Dungeon"};
  let GAME_ID="unknown";
  function setGame(id){GAME_ID=id;}
  function checkArrival(){
    const p=new URLSearchParams(window.location.search);
    if(!p.get("portal"))return;
    const from=p.get("from")||"";
    const label=LABELS[from]||from.replace(/-/g," ")||"another world";
    showBanner(label);
    window.history.replaceState({},"",window.location.pathname+window.location.hash);
  }
  function showBanner(from){
    const el=document.createElement("div");el.id="portal-arrival";
    el.innerHTML=`<span style="color:#7c5cfc">⬡</span> <span>You arrived from <em style="color:#c084fc;font-style:normal">${from}</em></span> <button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(124,92,252,.6);cursor:pointer;font-size:.8rem;margin-left:.5rem">✕</button>`;
    Object.assign(el.style,{position:"fixed",top:"1rem",left:"50%",transform:"translateX(-50%)",zIndex:"9999",display:"flex",alignItems:"center",gap:".5rem",background:"rgba(10,5,25,0.92)",border:"1px solid rgba(124,92,252,0.5)",color:"#e8e0ff",fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:".9rem",padding:".6rem 1rem",borderRadius:"4px",boxShadow:"0 0 20px rgba(124,92,252,.3)",maxWidth:"90vw"});
    document.body.appendChild(el);
    setTimeout(()=>el?.remove(),5000);
  }
  function trigger(dest){
    const url=`${HUB}?from=${encodeURIComponent(GAME_ID)}&to=${encodeURIComponent(dest)}`;
    const flash=document.createElement("div");
    Object.assign(flash.style,{position:"fixed",inset:"0",zIndex:"99999",background:"radial-gradient(circle at center,#7c5cfc,#03020a)",opacity:"0",transition:"opacity .4s ease",pointerEvents:"none"});
    document.body.appendChild(flash);
    requestAnimationFrame(()=>{flash.style.opacity="1";setTimeout(()=>{window.location.href=url;},400);});
  }
  function renderLink(dest,container){
    const label=LABELS[dest]||dest.replace(/-/g," ");
    const btn=document.createElement("button");
    btn.innerHTML=`⬡ Portal to <em style="color:#e8e0ff;font-style:normal">${label}</em>`;
    Object.assign(btn.style,{display:"inline-flex",alignItems:"center",gap:".4rem",background:"rgba(10,5,25,0.8)",border:"1px solid rgba(124,92,252,0.4)",color:"#c084fc",fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:".9rem",padding:".5rem 1rem",borderRadius:"3px",cursor:"pointer",margin:".25rem"});
    btn.onclick=()=>trigger(dest);
    container?.appendChild(btn);
    return btn;
  }
  function init(gameId){
    if(gameId)GAME_ID=gameId;
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",checkArrival);
    else checkArrival();
  }
  return{init,trigger,renderLink,setGame};
})();
PortalAdapter.init();
/* global document, window */
// JoshHub global header injector
(function(){
  function createHeader(){
    if(document.getElementById('joshhub-header')) return;
    const header = document.createElement('div');
    header.id = 'joshhub-header';
    header.innerHTML = `<div class="inner"><a class="home" href="/">JoshHub Home</a><button id="jh-instructions-toggle" class="jh-btn">Instructions</button><a class="back" href="/">Back to Hub</a></div>`;
    document.body.prepend(header);

    const toggle = document.getElementById('jh-instructions-toggle');
    toggle.addEventListener('click', ()=> document.body.classList.toggle('show-instructions'));
  }

  // Expose a small API for apps to add a demo button in the header
  window.JoshHubHeader = {
    ensure: createHeader,
    addDemoButton(label, onClick){
      createHeader();
      const btn = document.createElement('button');
      btn.className = 'jh-btn demo';
      btn.textContent = label || 'Demo Mode';
      btn.addEventListener('click', onClick);
      document.getElementById('joshhub-header').querySelector('.inner').appendChild(btn);
      return btn;
    }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createHeader);
  else createHeader();
})();

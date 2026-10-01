(() => {
  'use strict';

  const ROOT_ID = 'dbo1-sim-root';
  const MAX_SUSPICION = 100;
  const START_MTTD = 1200;
  const SAFE_NETWORKS = {
    pacs: '10.99.22.0/24',
    hvac: '10.99.80.0/24',
    vendor: '10.99.40.0/24',
    restricted: '10.99.250.0/24'
  };

  const state = {
    phase: 'briefing',
    suspicion: 8,
    mttd: START_MTTD,
    score: 0,
    indexCalled: false,
    gameOver: false,
    team: [
      { id: 'op1', name: 'Operator One', speciality: 'Social' },
      { id: 'op2', name: 'Operator Two', speciality: 'Systems' },
      { id: 'op3', name: 'Operator Three', speciality: 'Physical' }
    ],
    log: [],
    flags: {
      perimeter: false,
      foothold: false,
      pacsMapped: false,
      hvacObserved: false,
      timezoneSolved: false
    }
  };

  const phases = {
    briefing: {
      title: 'Mission Briefing',
      text: 'This is a fictionalised training environment. Learn how prevention, detection and response interact without touching live LEDC systems.'
    },
    perimeter: {
      title: 'Phase 1 · Perimeter',
      text: 'Choose one abstract entry scenario. Each option trades time, suspicion and detection pressure.'
    },
    foothold: {
      title: 'Phase 2 · Foothold',
      text: 'Select a fictional training port and device profile. No real network actions occur.'
    },
    lateral: {
      title: 'Phase 3 · PACS & HVAC',
      text: 'Validate simulated boundaries. HVAC remains read-only; destructive actions trigger INDEX.'
    },
    timezone: {
      title: 'Log Correlation Challenge',
      text: 'Correlate AEST/AEDT timestamps correctly. This teaches incident reconstruction, not evasion.'
    },
    debrief: {
      title: 'Debrief',
      text: 'Review what the exercise says about preventive controls, MTTD and response quality.'
    }
  };

  const actions = {
    perimeter: [
      {
        id: 'delivery',
        label: 'Delivery pretext simulation',
        detail: 'A staff-facing social scenario with moderate challenge risk.',
        suspicion: 20,
        mttd: 25,
        score: 120
      },
      {
        id: 'credential',
        label: 'Credential-copy simulation',
        detail: 'A fictional credential scenario. No badge technology or cloning method is modelled.',
        suspicion: 32,
        mttd: 40,
        score: 170
      },
      {
        id: 'tailgate',
        label: 'Tailgating simulation',
        detail: 'Tests challenge culture at a fictional access boundary.',
        suspicion: 26,
        mttd: 35,
        score: 150
      }
    ],
    foothold: [
      {
        id: 'approved',
        label: 'VENDOR-09 · registered maintenance profile',
        detail: 'Use the fictional registered device identity SIM-DBO1-ALPHA.',
        suspicion: 8,
        mttd: 45,
        score: 160,
        success: true
      },
      {
        id: 'unknown',
        label: 'EDGE-17 · unknown device profile',
        detail: 'The fictional switch sees an unregistered identity.',
        suspicion: 24,
        mttd: 120,
        score: 70,
        success: true
      },
      {
        id: 'honeypot',
        label: 'HONEY-04 · decoy port',
        detail: 'A deliberately instrumented training port.',
        suspicion: 38,
        mttd: 240,
        score: 20,
        success: false
      }
    ],
    lateral: [
      {
        id: 'pacs-read',
        label: 'PACS · passive inventory',
        detail: 'Observe fictional metadata in ' + SAFE_NETWORKS.pacs + '.',
        suspicion: 8,
        mttd: 50,
        score: 180
      },
      {
        id: 'pacs-noisy',
        label: 'PACS · noisy discovery',
        detail: 'Simulates a broad, easily detected discovery action without performing one.',
        suspicion: 30,
        mttd: 220,
        score: 50
      },
      {
        id: 'hvac-read',
        label: 'HVAC · read telemetry',
        detail: 'Read-only fictional telemetry in ' + SAFE_NETWORKS.hvac + '.',
        suspicion: 7,
        mttd: 45,
        score: 200
      },
      {
        id: 'hvac-write',
        label: 'HVAC · attempt state change',
        detail: 'Prohibited by the simulation RoE. Selecting this invokes INDEX immediately.',
        suspicion: 100,
        mttd: 9999,
        score: -500,
        index: true
      }
    ]
  };

  let timerId = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function fmtTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const m = String(Math.floor(safe / 60)).padStart(2, '0');
    const s = String(safe % 60).padStart(2, '0');
    return m + ':' + s;
  }

  function addLog(message, tone = 'info') {
    state.log.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      tone
    });
    state.log = state.log.slice(0, 8);
  }

  function applyNoise(suspicion, mttd) {
    state.suspicion = clamp(state.suspicion + suspicion, 0, MAX_SUSPICION);
    state.mttd = clamp(state.mttd - mttd, 0, START_MTTD);
    if (state.suspicion >= MAX_SUSPICION) {
      endGame('Suspicion reached 100%. Security challenged the team and the exercise reset.', 'failure');
    } else if (state.mttd <= 0) {
      endGame('SOC detection window expired. The simulated foothold was isolated.', 'failure');
    }
  }

  function moveTo(phase) {
    state.phase = phase;
    render();
  }

  function endGame(message, result) {
    state.gameOver = true;
    addLog(message, result === 'success' ? 'good' : 'bad');
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    render();
  }

  function callIndex(reason = 'Operator invoked INDEX.') {
    state.indexCalled = true;
    state.gameOver = true;
    addLog(reason + ' All simulated activity stopped immediately.', 'bad');
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    render();
  }

  function startGame() {
    state.phase = 'perimeter';
    state.suspicion = 8;
    state.mttd = START_MTTD;
    state.score = 0;
    state.indexCalled = false;
    state.gameOver = false;
    state.log = [];
    state.flags = {
      perimeter: false,
      foothold: false,
      pacsMapped: false,
      hvacObserved: false,
      timezoneSolved: false
    };
    addLog('Simulation started. Sanitised training environment loaded.', 'good');
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (!state.gameOver && state.phase !== 'briefing' && state.phase !== 'debrief') {
        state.mttd = clamp(state.mttd - 1, 0, START_MTTD);
        if (state.mttd === 0) {
          endGame('SOC detection window expired. The simulated foothold was isolated.', 'failure');
        } else {
          updateMeters();
        }
      }
    }, 1000);
    render();
  }

  function handlePerimeter(action) {
    applyNoise(action.suspicion, action.mttd);
    if (state.gameOver) return;
    state.score += action.score;
    state.flags.perimeter = true;
    addLog(action.label + ' completed as a fictional control test.', 'info');
    moveTo('foothold');
  }

  function handleFoothold(action) {
    applyNoise(action.suspicion, action.mttd);
    if (state.gameOver) return;
    state.score += action.score;
    if (!action.success) {
      addLog('Decoy port triggered a training alert. SOC pressure increased.', 'bad');
      return render();
    }
    state.flags.foothold = true;
    addLog('Fictional test appliance admitted to the sanitised vendor zone ' + SAFE_NETWORKS.vendor + '.', 'good');
    moveTo('lateral');
  }

  function handleLateral(action) {
    if (action.index) {
      callIndex('A prohibited HVAC state-change was selected.');
      return;
    }

    applyNoise(action.suspicion, action.mttd);
    if (state.gameOver) return;
    state.score += action.score;

    if (action.id.startsWith('pacs')) state.flags.pacsMapped = true;
    if (action.id === 'hvac-read') state.flags.hvacObserved = true;

    addLog(action.label + ' recorded in the simulated SOC timeline.', action.id.includes('noisy') ? 'bad' : 'good');

    if (state.flags.pacsMapped && state.flags.hvacObserved) {
      moveTo('timezone');
    } else {
      render();
    }
  }

  function solveTimezone(value) {
    if (value === '10') {
      state.flags.timezoneSolved = true;
      state.score += 250;
      addLog('Correct: the daylight-saving jump means only 10 minutes elapsed.', 'good');
      moveTo('debrief');
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    } else {
      applyNoise(8, 90);
      addLog('Incorrect log correlation. Detection pressure increased.', 'bad');
      render();
    }
  }

  function updateMeters() {
    const suspicionEl = document.querySelector('[data-meter="suspicion"]');
    const mttdEl = document.querySelector('[data-meter="mttd"]');
    const suspicionBar = document.querySelector('[data-bar="suspicion"]');
    const mttdBar = document.querySelector('[data-bar="mttd"]');

    if (suspicionEl) suspicionEl.textContent = state.suspicion + '%';
    if (mttdEl) mttdEl.textContent = fmtTime(state.mttd);
    if (suspicionBar) suspicionBar.style.width = state.suspicion + '%';
    if (mttdBar) mttdBar.style.width = Math.round((state.mttd / START_MTTD) * 100) + '%';
  }

  function hud() {
    return `
      <section class="dbo1-hud">
        <div class="dbo1-brand">
          <span class="dbo1-kicker">LEDC INTERNAL TRAINING</span>
          <strong>PROJECT DBO1-SIM</strong>
          <span class="dbo1-sub">Fictionalised architecture · client-side only</span>
        </div>
        <div class="dbo1-meters">
          <div class="dbo1-meter">
            <div class="dbo1-meter-head"><span>Suspicion</span><b data-meter="suspicion">${state.suspicion}%</b></div>
            <div class="dbo1-track"><span class="dbo1-fill" data-bar="suspicion" style="width:${state.suspicion}%"></span></div>
          </div>
          <div class="dbo1-meter">
            <div class="dbo1-meter-head"><span>SOC MTTD window</span><b data-meter="mttd">${fmtTime(state.mttd)}</b></div>
            <div class="dbo1-track"><span class="dbo1-fill" data-bar="mttd" style="width:${Math.round((state.mttd / START_MTTD) * 100)}%"></span></div>
          </div>
          <div class="dbo1-score">Score <b>${state.score}</b></div>
          <button class="dbo1-index" type="button" data-action="index">CALL INDEX</button>
        </div>
      </section>
    `;
  }

  function teamPanel() {
    return `
      <aside class="dbo1-team">
        <h3>Three-person team</h3>
        ${state.team.map(member => `
          <div class="dbo1-operator">
            <span class="dbo1-avatar">${member.name.slice(-3)}</span>
            <div><strong>${member.name}</strong><small>${member.speciality}</small></div>
          </div>
        `).join('')}
        <div class="dbo1-scope">
          <h4>Simulation networks</h4>
          <code>PACS ${SAFE_NETWORKS.pacs}</code>
          <code>HVAC ${SAFE_NETWORKS.hvac}</code>
          <code>VENDOR ${SAFE_NETWORKS.vendor}</code>
          <code class="dbo1-danger">RESTRICTED ${SAFE_NETWORKS.restricted}</code>
        </div>
      </aside>
    `;
  }

  function actionCards(list, type) {
    return `
      <div class="dbo1-actions">
        ${list.map(action => `
          <button class="dbo1-card" type="button" data-choice-type="${type}" data-choice="${action.id}">
            <strong>${action.label}</strong>
            <span>${action.detail}</span>
            <small>Suspicion +${action.suspicion} · detection pressure +${action.mttd}s</small>
          </button>
        `).join('')}
      </div>
    `;
  }

  function phaseBody() {
    const phase = phases[state.phase];

    if (state.gameOver) {
      return `
        <div class="dbo1-screen dbo1-result">
          <span class="dbo1-kicker">${state.indexCalled ? 'INDEX CALLED' : 'EXERCISE ENDED'}</span>
          <h1>${state.indexCalled ? 'Safety halt' : 'SOC response'}</h1>
          <p>${state.log[0] ? state.log[0].message : 'Simulation ended.'}</p>
          <button class="dbo1-primary" type="button" data-action="restart">Reset simulation</button>
        </div>
      `;
    }

    if (state.phase === 'briefing') {
      return `
        <div class="dbo1-screen">
          <span class="dbo1-kicker">SERIOUS GAME · 15–20 MIN</span>
          <h1>${phase.title}</h1>
          <p>${phase.text}</p>
          <div class="dbo1-brief-grid">
            <article><b>Objective</b><span>Reach the debrief while keeping suspicion and detection pressure under control.</span></article>
            <article><b>Safety</b><span>HVAC is read-only. Any simulated state-change invokes INDEX.</span></article>
            <article><b>Privacy</b><span>No live LEDC addresses, credentials, topology or customer data are present.</span></article>
          </div>
          <button class="dbo1-primary" type="button" data-action="start">Begin exercise</button>
        </div>
      `;
    }

    if (state.phase === 'perimeter') {
      return `<div class="dbo1-screen"><span class="dbo1-kicker">CONTROL TEST</span><h1>${phase.title}</h1><p>${phase.text}</p>${actionCards(actions.perimeter, 'perimeter')}</div>`;
    }

    if (state.phase === 'foothold') {
      return `<div class="dbo1-screen"><span class="dbo1-kicker">SANITISED DEVICE-ADMISSION PUZZLE</span><h1>${phase.title}</h1><p>${phase.text}</p>${actionCards(actions.foothold, 'foothold')}</div>`;
    }

    if (state.phase === 'lateral') {
      return `
        <div class="dbo1-screen">
          <span class="dbo1-kicker">SEGMENTATION PUZZLE</span>
          <h1>${phase.title}</h1>
          <p>${phase.text}</p>
          <div class="dbo1-objectives">
            <span class="${state.flags.pacsMapped ? 'done' : ''}">PACS observation</span>
            <span class="${state.flags.hvacObserved ? 'done' : ''}">HVAC read-only observation</span>
          </div>
          ${actionCards(actions.lateral, 'lateral')}
        </div>
      `;
    }

    if (state.phase === 'timezone') {
      return `
        <div class="dbo1-screen">
          <span class="dbo1-kicker">INCIDENT RECONSTRUCTION</span>
          <h1>${phase.title}</h1>
          <p>${phase.text}</p>
          <div class="dbo1-log-puzzle">
            <code>Event A · 04 Oct 2026 · 01:55 AEST</code>
            <code>Event B · 04 Oct 2026 · 03:05 AEDT</code>
            <p>How much real time elapsed between the two events?</p>
            <div class="dbo1-puzzle-options">
              <button type="button" data-timezone="10">10 minutes</button>
              <button type="button" data-timezone="70">70 minutes</button>
              <button type="button" data-timezone="130">130 minutes</button>
            </div>
          </div>
        </div>
      `;
    }

    if (state.phase === 'debrief') {
      const rating = state.score >= 800 ? 'Excellent control awareness' : state.score >= 550 ? 'Strong result' : 'Review detection trade-offs';
      return `
        <div class="dbo1-screen dbo1-result">
          <span class="dbo1-kicker">EXERCISE COMPLETE</span>
          <h1>${rating}</h1>
          <p>You completed the sanitised assumed-breach exercise with a score of <strong>${state.score}</strong>.</p>
          <div class="dbo1-brief-grid">
            <article><b>Final suspicion</b><span>${state.suspicion}%</span></article>
            <article><b>MTTD budget remaining</b><span>${fmtTime(state.mttd)}</span></article>
            <article><b>Safety outcome</b><span>HVAC write actions were avoided and no live system was touched.</span></article>
          </div>
          <p class="dbo1-learning">Training takeaway: good security depends on layered prevention, segmentation, observable events and fast human response—not on any single control.</p>
          <button class="dbo1-primary" type="button" data-action="restart">Play again</button>
        </div>
      `;
    }

    return '';
  }

  function eventLog() {
    return `
      <aside class="dbo1-log">
        <h3>Simulated SOC timeline</h3>
        ${state.log.length ? state.log.map(item => `
          <div class="dbo1-log-row ${item.tone}">
            <time>${item.time}</time>
            <span>${item.message}</span>
          </div>
        `).join('') : '<p>No events yet.</p>'}
      </aside>
    `;
  }

  function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    root.innerHTML = `
      <div class="dbo1-shell">
        ${hud()}
        <div class="dbo1-main">
          ${teamPanel()}
          <main class="dbo1-stage">${phaseBody()}</main>
          ${eventLog()}
        </div>
        <footer class="dbo1-footer">
          <span>PROJECT DBO1-SIM · fictional training environment</span>
          <span>No live LEDC systems, credentials or network operations</span>
        </footer>
      </div>
    `;

    root.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'start' || action === 'restart') startGame();
        if (action === 'index') callIndex();
      });
    });

    root.querySelectorAll('[data-choice-type]').forEach(button => {
      button.addEventListener('click', () => {
        const type = button.dataset.choiceType;
        const choice = button.dataset.choice;
        const action = actions[type].find(item => item.id === choice);
        if (!action) return;
        if (type === 'perimeter') handlePerimeter(action);
        if (type === 'foothold') handleFoothold(action);
        if (type === 'lateral') handleLateral(action);
      });
    });

    root.querySelectorAll('[data-timezone]').forEach(button => {
      button.addEventListener('click', () => solveTimezone(button.dataset.timezone));
    });

    updateMeters();
  }

  document.addEventListener('DOMContentLoaded', render);
})();

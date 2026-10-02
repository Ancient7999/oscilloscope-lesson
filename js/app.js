(function () {
  'use strict';

  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, practicalMode = false;
  const wells = [], specks = [];
  const paletteStudy = ['#3d5a80', '#5c7a9e', '#c4a574', '#8aa0b4'];
  const paletteLive = ['#7ec8a8', '#d4b06a', '#5ac8aa', '#e8c078', '#6a9ec8', '#c4786a'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function seedParticles() {
    wells.length = 0;
    specks.length = 0;
    const pal = practicalMode ? paletteLive : paletteStudy;
    const nW = practicalMode ? 14 : 8;
    const nS = practicalMode ? 55 : 28;
    for (let i = 0; i < nW; i++) {
      wells.push({
        x: Math.random() * W, y: Math.random() * H,
        r: (practicalMode ? 50 : 35) + Math.random() * (practicalMode ? 120 : 80),
        a: (practicalMode ? 0.04 : 0.02) + Math.random() * (practicalMode ? 0.07 : 0.04),
        color: pal[Math.floor(Math.random() * pal.length)],
        pulse: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * (practicalMode ? 0.14 : 0.05)
      });
    }
    for (let i = 0; i < nS; i++) {
      specks.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.8 + Math.random() * (practicalMode ? 2.4 : 1.6),
        vx: (Math.random() - 0.5) * (practicalMode ? 0.22 : 0.08),
        vy: (Math.random() - 0.5) * (practicalMode ? 0.18 : 0.06),
        a: (practicalMode ? 0.2 : 0.1) + Math.random() * 0.25,
        color: pal[Math.floor(Math.random() * pal.length)]
      });
    }
  }
  seedParticles();

  function drawFx() {
    ctx.clearRect(0, 0, W, H);
    if (practicalMode) {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
      g.addColorStop(0, 'rgba(30,50,55,0.5)');
      g.addColorStop(1, 'rgba(12,18,24,0.2)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else {
      const g = ctx.createRadialGradient(W * 0.2, H * 0.05, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.9);
      g.addColorStop(0, 'rgba(255,255,255,0.3)');
      g.addColorStop(1, 'rgba(235,232,225,0.1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    wells.forEach(w => {
      w.x += w.drift; w.pulse += practicalMode ? 0.014 : 0.007;
      if (w.x < -100) w.x = W + 100;
      if (w.x > W + 100) w.x = -100;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r * (0.88 + 0.12 * Math.sin(w.pulse)), 0, Math.PI * 2);
      ctx.fillStyle = w.color;
      ctx.globalAlpha = w.a * (0.7 + 0.3 * Math.sin(w.pulse));
      ctx.fill();
    });
    specks.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < -10) s.x = W + 10; if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10; if (s.y > H + 10) s.y = -10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawFx);
  }
  drawFx();

  const VIEWS = [
    { id: 'aim', label: 'Aim' },
    { id: 'outcomes', label: 'Outcomes' },
    { id: 'basics', label: 'What is a CRO?' },
    { id: 'medical', label: 'Medical' },
    { id: 'method', label: 'Method' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'results', label: 'Results' },
    { id: 'trace', label: 'Trace' },
    { id: 'practical', label: 'Practical', practical: true }
  ];

  const nav = document.getElementById('nav');
  const progressFill = document.getElementById('progress-fill');
  const whereEl = document.getElementById('where');
  const btnPrev = document.getElementById('btn-page-prev');
  let viewIndex = 0;
  const visited = new Set();

  VIEWS.forEach((v, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item' + (v.practical ? ' practical-tag' : '');
    btn.dataset.view = v.id;
    btn.innerHTML = '<span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="label">' + v.label + '</span>';
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);
  });

  function goTo(i, pushHash) {
    if (i < 0 || i >= VIEWS.length) return;
    viewIndex = i;
    visited.add(VIEWS[i].id);
    document.querySelectorAll('.view').forEach(el => {
      el.classList.toggle('active', el.id === 'view-' + VIEWS[i].id);
    });
    document.querySelectorAll('.nav-item').forEach((el, idx) => {
      el.classList.toggle('active', idx === i);
      el.classList.toggle('done', visited.has(VIEWS[idx].id) && idx !== i);
    });
    const pct = Math.round(((i + 1) / VIEWS.length) * 100);
    progressFill.style.width = pct + '%';
    whereEl.innerHTML = '<strong>' + (i + 1) + '</strong> / ' + VIEWS.length + ' · ' + VIEWS[i].label;
    btnPrev.disabled = i === 0;

    const isPrac = !!VIEWS[i].practical;
    if (isPrac !== practicalMode) {
      practicalMode = isPrac;
      document.body.classList.toggle('mode-practical', isPrac);
      seedParticles();
    }

    if (pushHash !== false) {
      history.replaceState(null, '', '#' + VIEWS[i].id);
    }
    tryRenderMath();
    const active = document.querySelector('.view.active');
    if (active) active.scrollTop = 0;
  }

  function tryRenderMath() {
    if (typeof renderMathInElement === 'function') {
      const active = document.querySelector('.view.active');
      if (active) renderMathInElement(active, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  btnPrev.addEventListener('click', () => goTo(viewIndex - 1));
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goTo(viewIndex + 1));
  });

  function hashToIndex() {
    const h = (location.hash || '#aim').replace('#', '');
    const idx = VIEWS.findIndex(v => v.id === h);
    return idx >= 0 ? idx : 0;
  }
  window.addEventListener('hashchange', () => goTo(hashToIndex(), false));
  goTo(hashToIndex(), false);

  document.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(viewIndex + 1);
    if (e.key === 'ArrowLeft') goTo(viewIndex - 1);
  });

  /* Basics chart — alive regions */
  const REGION_COPY = {
    vaxis: {
      title: 'Voltage axis',
      text: 'Vertical axis. Each square is one division of volts (set by volts/div on the front panel).'
    },
    taxis: {
      title: 'Time axis',
      text: 'Horizontal axis. Each square is one division of time (set by time/div).'
    },
    peak: {
      title: 'Peak-to-peak',
      text: 'Distance from the lowest point of the wave to the highest. Count those vertical divisions for Y.'
    },
    period: {
      title: 'One period (T)',
      text: 'Width of one complete cycle — crest to next matching crest. Count those horizontal divisions for X.'
    },
    division: {
      title: 'One division',
      text: 'A single graticule square. Scale it with volts/div (vertical) or time/div (horizontal).'
    }
  };
  const explainEl = document.getElementById('basics-explain');
  const basicsDefault = explainEl ? explainEl.textContent : '';

  document.querySelectorAll('#basics-chart .region-hit').forEach(hit => {
    const key = hit.getAttribute('data-region');
    hit.addEventListener('mouseenter', () => {
      document.querySelectorAll('#basics-chart .region-mark').forEach(m => {
        m.classList.toggle('on', m.getAttribute('data-mark') === key);
      });
      const c = REGION_COPY[key];
      if (c && explainEl) {
        explainEl.innerHTML = '<strong>' + c.title + '</strong> — ' + c.text;
      }
    });
    hit.addEventListener('mouseleave', () => {
      document.querySelectorAll('#basics-chart .region-mark').forEach(m => m.classList.remove('on'));
      if (explainEl) explainEl.textContent = basicsDefault;
    });
  });

  /* Practical — chart-first inspection */
  const INSPECT = {
    vdiv: {
      title: 'Volts / div',
      body: 'Vertical scale for this worked example.',
      formula: 'volts/div = 2 V/div',
      mark: 'vdiv',
      highlightField: 'vpp'
    },
    tdiv: {
      title: 'Time / div',
      body: 'Horizontal scale for this worked example.',
      formula: 'time/div = 1 ms/div',
      mark: 'tdiv',
      highlightField: 'tms'
    },
    ydiv: {
      title: 'Y divisions (peak-to-peak)',
      body: 'Count vertical squares from trough to crest.',
      formula: 'Y = 3.0 div → Vpp = 3.0 × 2 = 6.0 V',
      mark: 'ydiv',
      highlightField: 'vpp'
    },
    xdiv: {
      title: 'X divisions (one period)',
      body: 'Count horizontal squares spanning one full cycle.',
      formula: 'X = 4.0 div → T = 4.0 × 1 ms = 4.0 ms',
      mark: 'xdiv',
      highlightField: 'tms'
    },
    peak: {
      title: 'Peak',
      body: 'Highest (or lowest) point of the trace. Peak-to-peak spans both extremes.',
      formula: 'A = Vpp / 2 = 3.0 V',
      mark: 'peak',
      highlightField: 'a'
    },
    wave: {
      title: 'Waveform',
      body: 'Voltage versus time. Use Y for amplitude and X for period.',
      formula: 'f = 1/T = 1 / 0.004 s = 250 Hz',
      mark: 'wave',
      highlightField: 'f'
    },
    calc: {
      title: 'Worked values',
      body: 'All four results from the counts and scales on this screen.',
      formula: 'Vpp 6 V · A 3 V · T 4 ms · f 250 Hz',
      mark: 'calc',
      highlightField: null
    }
  };

  const vrTitle = document.getElementById('vr-title');
  const vrBody = document.getElementById('vr-body');
  const vrFormula = document.getElementById('vr-formula');
  const bubble = document.getElementById('inspect-bubble');

  function clearInspect() {
    document.querySelectorAll('#cro-stage .inspect-mark').forEach(m => m.classList.remove('on'));
    document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('awake'));
    if (vrTitle) vrTitle.textContent = 'CRO screen';
    if (vrBody) vrBody.textContent = 'Move over the wave, peaks, Y/X brackets, volts/div or time/div knobs on the display.';
    if (vrFormula) vrFormula.textContent = '';
    if (bubble) bubble.hidden = true;
  }

  function showInspect(key, clientX, clientY) {
    const info = INSPECT[key];
    if (!info) return;
    document.querySelectorAll('#cro-stage .inspect-mark').forEach(m => {
      m.classList.toggle('on', m.getAttribute('data-mark') === info.mark);
    });
    if (vrTitle) vrTitle.textContent = info.title;
    if (vrBody) vrBody.textContent = info.body;
    if (vrFormula) vrFormula.textContent = info.formula;
    document.querySelectorAll('.calc-field').forEach(f => {
      f.classList.toggle('awake', info.highlightField && f.getAttribute('data-key') === info.highlightField);
    });
    if (bubble) {
      bubble.hidden = false;
      bubble.textContent = info.title + ' · ' + info.formula;
      const stage = document.getElementById('cro-stage');
      const r = stage.getBoundingClientRect();
      let x = clientX - r.left + 14;
      let y = clientY - r.top - 40;
      if (x + 200 > r.width) x = clientX - r.left - 210;
      if (y < 8) y = clientY - r.top + 18;
      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';
    }
  }

  const croStage = document.getElementById('cro-stage');
  if (croStage) {
    croStage.addEventListener('mousemove', e => {
      const hit = e.target.closest('[data-inspect]');
      if (hit) showInspect(hit.getAttribute('data-inspect'), e.clientX, e.clientY);
      else clearInspect();
    });
    croStage.addEventListener('mouseleave', clearInspect);
  }

  /* Answer checking — always available */
  const answers = {
    vpp: { value: 6, tol: 0.15 },
    a: { value: 3, tol: 0.15 },
    tms: { value: 4, tol: 0.15 },
    f: { value: 250, tol: 5 }
  };
  function near(v, target, tol) {
    return typeof v === 'number' && !isNaN(v) && Math.abs(v - target) <= tol;
  }
  function check() {
    let ok = 0, total = 0;
    Object.keys(answers).forEach(key => {
      total++;
      const field = document.querySelector('.calc-field[data-key="' + key + '"]');
      const input = field.querySelector('input');
      let v = parseFloat(input.value);
      let good = near(v, answers[key].value, answers[key].tol);
      if (key === 'tms' && near(v, 0.004, 0.0003)) good = true;
      field.classList.toggle('ok', good);
      field.classList.toggle('bad', input.value !== '' && !good);
      if (good) ok++;
    });
    const fb = document.getElementById('fb-calc');
    if (ok === total) {
      fb.className = 'calc-feedback ok';
      fb.textContent = 'Match · Vpp = 6 V, A = 3 V, T = 4 ms, f = 250 Hz.';
    } else {
      fb.className = 'calc-feedback bad';
      fb.textContent = ok + ' of ' + total + ' correct.';
    }
  }
  const btnCheck = document.getElementById('btn-check');
  const btnReveal = document.getElementById('btn-reveal');
  if (btnCheck) btnCheck.addEventListener('click', check);
  if (btnReveal) btnReveal.addEventListener('click', () => {
    document.getElementById('in-vpp').value = '6';
    document.getElementById('in-a').value = '3';
    document.getElementById('in-tms').value = '4';
    document.getElementById('in-f').value = '250';
    check();
  });
  document.querySelectorAll('#calc-panel input').forEach(inp => {
    inp.addEventListener('change', () => {
      const filled = [...document.querySelectorAll('#calc-panel input')].filter(i => i.value !== '').length;
      if (filled >= 2) check();
    });
  });

  /* Chart handwriting toggle */
  const chartCanvas = document.getElementById('chart-canvas');
  const btnOn = document.getElementById('btn-hand-on');
  const btnOff = document.getElementById('btn-hand-off');
  function setHand(show) {
    if (!chartCanvas) return;
    chartCanvas.classList.toggle('hand-hidden', !show);
    btnOn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btnOff.setAttribute('aria-pressed', show ? 'false' : 'true');
  }
  if (btnOn) btnOn.addEventListener('click', () => setHand(true));
  if (btnOff) btnOff.addEventListener('click', () => setHand(false));

  /* Optional extras */
  const extras = document.getElementById('end-extras');
  const extrasToggle = document.getElementById('end-extras-toggle');
  if (extras && extrasToggle) {
    extrasToggle.addEventListener('click', () => {
      const open = extras.classList.toggle('open');
      extrasToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      extrasToggle.textContent = open ? 'Hide optional extras' : 'Optional extras';
    });
  }

})();

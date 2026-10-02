(function () {
  'use strict';

  /* —— Custom cursor (characterful dual-ring) —— */
  const cursorRing = document.createElement('div');
  cursorRing.id = 'cursor';
  const cursorCore = document.createElement('div');
  cursorCore.id = 'cursor';
  cursorCore.className = 'core';
  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorCore);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorRing.style.left = mouseX + 'px';
    cursorRing.style.top = mouseY + 'px';
    cursorCore.style.left = mouseX + 'px';
    cursorCore.style.top = mouseY + 'px';
  });
  document.addEventListener('mousedown', () => cursorRing.classList.add('active'));
  document.addEventListener('mouseup', () => cursorRing.classList.remove('active'));

  /* —— FX canvas —— */
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, practicalMode = false, t0 = performance.now();
  const wells = [], specks = [];
  const beams = [], phosphor = [];
  const paletteStudy = ['#3d5a80', '#5c7a9e', '#c4a574', '#8aa0b4', '#d4a07a'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function seedStudy() {
    wells.length = 0;
    specks.length = 0;
    for (let i = 0; i < 11; i++) {
      wells.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 16 + Math.random() * 42,
        a: 0.035 + Math.random() * 0.07,
        color: paletteStudy[Math.floor(Math.random() * paletteStudy.length)],
        pulse: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.07
      });
    }
    for (let i = 0; i < 32; i++) {
      specks.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 1 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.11,
        vy: (Math.random() - 0.5) * 0.09,
        a: 0.1 + Math.random() * 0.22,
        color: paletteStudy[Math.floor(Math.random() * paletteStudy.length)]
      });
    }
  }

  function seedPractical() {
    beams.length = 0;
    phosphor.length = 0;
    for (let i = 0; i < 5; i++) {
      beams.push({
        y: (0.12 + Math.random() * 0.76) * H,
        amp: 18 + Math.random() * 48,
        freq: 0.008 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        color: ['#7ec8a8', '#5ac8aa', '#6a9ec8', '#d4b06a'][i % 4],
        alpha: 0.08 + Math.random() * 0.12,
        width: 1.2 + Math.random() * 1.8
      });
    }
    for (let i = 0; i < 90; i++) {
      phosphor.push({
        x: Math.random() * W,
        y: Math.random() * H,
        life: Math.random(),
        decay: 0.002 + Math.random() * 0.006,
        r: 0.6 + Math.random() * 1.8,
        color: Math.random() > 0.55 ? '#7ec8a8' : '#d4b06a'
      });
    }
  }

  function seedParticles() {
    if (practicalMode) seedPractical();
    else seedStudy();
  }
  seedParticles();

  function drawStudy() {
    const g = ctx.createRadialGradient(W * 0.25, H * 0.08, 0, W * 0.5, H * 0.6, Math.max(W, H) * 0.85);
    g.addColorStop(0, 'rgba(255,255,255,0.28)');
    g.addColorStop(1, 'rgba(235,232,225,0.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    wells.forEach(w => {
      w.x += w.drift; w.pulse += 0.01;
      if (w.x < -60) w.x = W + 60;
      if (w.x > W + 60) w.x = -60;
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
  }

  function drawPractical(now) {
    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.9);
    g.addColorStop(0, 'rgba(18, 36, 40, 0.55)');
    g.addColorStop(1, 'rgba(8, 14, 18, 0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Soft scanlines (not orbs)
    ctx.globalAlpha = 0.035;
    ctx.strokeStyle = '#7ec8a8';
    ctx.lineWidth = 1;
    const scanOff = ((now * 0.04) % 8);
    for (let y = -8; y < H + 8; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y + scanOff);
      ctx.lineTo(W, y + scanOff);
      ctx.stroke();
    }

    // Faint CRO graticule wash
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#5c7a9e';
    const gs = 48;
    for (let x = (now * 0.01) % gs; x < W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Drifting waveform beams
    beams.forEach(b => {
      b.phase += 0.012 * b.speed;
      ctx.beginPath();
      ctx.lineWidth = b.width;
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = b.alpha;
      const steps = Math.ceil(W / 6);
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const y = b.y + Math.sin(x * b.freq + b.phase) * b.amp
          + Math.sin(x * b.freq * 2.3 + b.phase * 1.4) * (b.amp * 0.22);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Phosphor motes along traces (not pulsing orbs)
    phosphor.forEach(p => {
      p.life -= p.decay;
      if (p.life <= 0) {
        p.life = 1;
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      }
      p.x += Math.sin(now * 0.001 + p.y) * 0.15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.08 + p.life * 0.28;
      ctx.fill();
    });

    // Sweeping beam highlight
    const sweepX = ((now * 0.08) % (W + 120)) - 60;
    const sg = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
    sg.addColorStop(0, 'rgba(126,200,168,0)');
    sg.addColorStop(0.5, 'rgba(126,200,168,0.07)');
    sg.addColorStop(1, 'rgba(126,200,168,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = sg;
    ctx.fillRect(sweepX - 40, 0, 80, H);
  }

  function drawFx(ts) {
    const now = ts || performance.now();
    ctx.clearRect(0, 0, W, H);
    if (practicalMode) drawPractical(now);
    else drawStudy();
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawFx);
  }
  requestAnimationFrame(drawFx);

  /* —— Navigation (no page numbers) —— */
  const VIEWS = [
    { id: 'aim', label: 'Aim & outcomes' },
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

  VIEWS.forEach((v) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item';
    btn.dataset.view = v.id;
    btn.innerHTML = '<span class="label">' + v.label + '</span>';
    btn.addEventListener('click', () => goTo(VIEWS.indexOf(v)));
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
    progressFill.style.width = Math.round(((i + 1) / VIEWS.length) * 100) + '%';
    whereEl.textContent = VIEWS[i].label;
    btnPrev.disabled = i === 0;

    const isPrac = !!VIEWS[i].practical;
    if (isPrac !== practicalMode) {
      practicalMode = isPrac;
      document.body.classList.toggle('mode-practical', isPrac);
      seedParticles();
    }

    if (pushHash !== false) history.replaceState(null, '', '#' + VIEWS[i].id);
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

  /* —— Method step → illustration panel —— */
  const METHOD_STEPS = [
    { img: 'assets/step-01-power.png', cap: 'Power on the CRO and wait for a stable horizontal trace.' },
    { img: 'assets/step-02-connect.png', cap: 'Route the function-generator output into a CRO channel (e.g. CH1).' },
    { img: 'assets/step-03-focus.png', cap: 'Trim Intensity, then Focus, until the line is bright and sharp.' },
    { img: 'assets/step-04-volts.png', cap: 'Pick a triangular wave and set volts/div so the wave fills the screen cleanly.' },
    { img: 'assets/step-05-time.png', cap: 'Set time/div until the sweep locks and the wave stands still.' },
    { img: 'assets/step-06-amplitude.png', cap: 'Count Y (peak-to-peak divisions). Vpp = Y × volts/div; A = Vpp / 2.' },
    { img: 'assets/step-07-period.png', cap: 'Count X (one full cycle). T = X × time/div; f = 1 / T.' },
    { img: 'assets/step-08-repeat.png', cap: 'Repeat for square and sinusoidal waves; trace all three in the workbook.' }
  ];

  const methodSplit = document.getElementById('method-split');
  const methodPanel = document.getElementById('method-panel');
  const methodImg = document.getElementById('method-img');
  const methodCap = document.getElementById('method-cap');

  document.querySelectorAll('.method-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-step'), 10);
      const step = METHOD_STEPS[idx];
      if (!step || !methodSplit) return;
      document.querySelectorAll('.method-step').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      methodSplit.classList.add('open');
      methodImg.src = step.img;
      methodImg.alt = step.cap;
      methodCap.textContent = step.cap;
    });
  });

  /* —— Basics chart: regions + live x/y readout —— */
  const REGION_COPY = {
    vaxis: {
      title: 'Voltage axis',
      text: 'Vertical axis. Each numbered square is one division of volts (set by volts/div).'
    },
    taxis: {
      title: 'Time axis',
      text: 'Horizontal axis. Each numbered square is one division of time (set by time/div).'
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
  const basicsChart = document.getElementById('basics-chart');
  const basicsXy = document.getElementById('basics-xy');
  // Graticule mapping for basics SVG viewBox 0 0 720 280
  // Origin at (60, 130); 70 px/div horizontal; 40 px/div vertical; 1 V/div & 1 ms/div demo
  const BASICS_MAP = {
    ox: 60, oy: 130, divx: 70, divy: 40,
    vPerDiv: 1, tPerDiv: 1, vUnit: 'V', tUnit: 'ms'
  };

  function svgPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  if (basicsChart) {
    const svg = basicsChart.querySelector('svg');
    basicsChart.addEventListener('mousemove', e => {
      if (!svg || !basicsXy) return;
      const p = svgPoint(svg, e.clientX, e.clientY);
      if (!p) return;
      const tDiv = (p.x - BASICS_MAP.ox) / BASICS_MAP.divx;
      const vDiv = (BASICS_MAP.oy - p.y) / BASICS_MAP.divy;
      const t = tDiv * BASICS_MAP.tPerDiv;
      const v = vDiv * BASICS_MAP.vPerDiv;
      if (p.x < 50 || p.x > 680 || p.y < 25 || p.y > 230) {
        basicsXy.classList.remove('on');
        return;
      }
      basicsXy.textContent = 't ' + t.toFixed(2) + ' ' + BASICS_MAP.tUnit + '  ·  V ' + v.toFixed(2) + ' ' + BASICS_MAP.vUnit;
      const rect = basicsChart.getBoundingClientRect();
      basicsXy.style.left = (e.clientX - rect.left) + 'px';
      basicsXy.style.top = (e.clientY - rect.top) + 'px';
      basicsXy.classList.add('on');
    });
    basicsChart.addEventListener('mouseleave', () => {
      if (basicsXy) basicsXy.classList.remove('on');
    });

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
  }

  /* —— Practical — chart inspection + live teaching formulas —— */
  const INSPECT = {
    vdiv: {
      title: 'Volts / div',
      body: 'Vertical scale. Each numbered vertical square is worth this many volts.',
      formula: 'volts/div = 2 V/div',
      mark: 'vdiv',
      highlightField: 'vpp',
      teach: 'vdiv',
      pop: 'volts/div = 2 V/div'
    },
    tdiv: {
      title: 'Time / div',
      body: 'Horizontal scale. Each numbered horizontal square is worth this much time.',
      formula: 'time/div = 1 ms/div',
      mark: 'tdiv',
      highlightField: 'tms',
      teach: 'tdiv',
      pop: 'time/div = 1 ms/div'
    },
    ydiv: {
      title: 'Y divisions (peak-to-peak)',
      body: 'Count vertical squares from trough to crest. That count is Y.',
      formula: 'Y = 3.0 div → Vpp = 3.0 × 2 = 6.0 V',
      mark: 'ydiv',
      highlightField: 'vpp',
      teach: 'vpp',
      pop: 'Y = 3.0 div',
      plug: 'y'
    },
    xdiv: {
      title: 'X divisions (one period)',
      body: 'Count horizontal squares spanning one full cycle. That count is X.',
      formula: 'X = 4.0 div → T = 4.0 × 1 ms = 4.0 ms',
      mark: 'xdiv',
      highlightField: 'tms',
      teach: 't',
      pop: 'X = 4.0 div',
      plug: 'x'
    },
    peak: {
      title: 'Peak',
      body: 'Highest (or lowest) point of the trace. Peak-to-peak spans both extremes.',
      formula: 'A = Vpp / 2 = 3.0 V',
      mark: 'peak',
      highlightField: 'a',
      teach: 'a',
      pop: 'A = Vpp / 2'
    },
    wave: {
      title: 'Waveform',
      body: 'Voltage versus time. Use Y for amplitude and X for period.',
      formula: 'f = 1/T = 250 Hz',
      mark: 'wave',
      highlightField: 'f',
      teach: 'f',
      pop: 'f = 1/T'
    },
    div: {
      title: 'One division',
      body: 'A single graticule square — the unit you count. Vertical divs × volts/div → volts; horizontal divs × time/div → time.',
      formula: '1 div = one grid square',
      mark: 'div',
      highlightField: null,
      teach: null,
      pop: '1 div = 1 grid square'
    }
  };

  const vrTitle = document.getElementById('vr-title');
  const vrBody = document.getElementById('vr-body');
  const vrFormula = document.getElementById('vr-formula');
  const bubble = document.getElementById('inspect-bubble');
  const formulaPop = document.getElementById('formula-pop');
  const teachHint = document.getElementById('teach-hint');
  const slotY = document.getElementById('slot-y');
  const slotX = document.getElementById('slot-x');
  const eqVpp = document.getElementById('eq-vpp');
  const eqT = document.getElementById('eq-t');
  const PRAC_MAP = {
    ox: 336, oy: 178, divx: 56, divy: 32,
    vPerDiv: 2, tPerDiv: 1, vUnit: 'V', tUnit: 'ms'
  };
  const WORKED = { Y: 3.0, X: 4.0, vdiv: 2, tdiv: 1 };

  function resetSlots() {
    if (slotY) {
      slotY.textContent = 'Y';
      slotY.classList.remove('live');
    }
    if (slotX) {
      slotX.textContent = 'X';
      slotX.classList.remove('live');
    }
  }

  function clearTeach() {
    document.querySelectorAll('.teach-row').forEach(r => {
      r.classList.remove('active', 'hot');
    });
    resetSlots();
    if (teachHint) {
      teachHint.textContent = 'Hover the chart — a matching quantity lights its formula. Hover Y or X to plug the live count into the equation.';
    }
  }

  function clearInspect() {
    document.querySelectorAll('#cro-stage .inspect-mark').forEach(m => m.classList.remove('on'));
    document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('awake'));
    if (vrTitle) vrTitle.textContent = 'CRO screen';
    if (vrBody) vrBody.textContent = 'Move over the wave, peaks, Y/X brackets, a single division, or the volts/div and time/div regions.';
    if (vrFormula) vrFormula.textContent = '';
    if (formulaPop) formulaPop.hidden = true;
    clearTeach();
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

    // Under-chart formulas
    document.querySelectorAll('.teach-row').forEach(r => {
      const match = info.teach && r.getAttribute('data-formula') === info.teach;
      r.classList.toggle('active', !!match);
      r.classList.toggle('hot', !!match && !!info.plug);
    });
    // Also light volts/div when Y/Vpp is in play
    if (info.teach === 'vpp') {
      const vrow = document.querySelector('.teach-row[data-formula="vdiv"]');
      if (vrow) vrow.classList.add('active');
    }
    if (info.teach === 't') {
      const trow = document.querySelector('.teach-row[data-formula="tdiv"]');
      if (trow) trow.classList.add('active');
    }

    resetSlots();
    if (info.plug === 'y' && slotY) {
      slotY.textContent = String(WORKED.Y);
      slotY.classList.add('live');
      if (teachHint) {
        teachHint.textContent = 'Y is live in the formula → Vpp = ' + WORKED.Y + ' × ' + WORKED.vdiv + ' = ' + (WORKED.Y * WORKED.vdiv).toFixed(1) + ' V.';
      }
    } else if (info.plug === 'x' && slotX) {
      slotX.textContent = String(WORKED.X);
      slotX.classList.add('live');
      if (teachHint) {
        teachHint.textContent = 'X is live in the formula → T = ' + WORKED.X + ' × ' + WORKED.tdiv + ' ms = ' + (WORKED.X * WORKED.tdiv).toFixed(1) + ' ms.';
      }
    } else if (key === 'div' && teachHint) {
      teachHint.textContent = 'A division is one grid square. Count them: vertical for Y (voltage), horizontal for X (time).';
    } else if (info.teach === 'vdiv' && teachHint) {
      teachHint.textContent = 'volts/div tells you what each vertical square is worth. Here every vertical div = 2 V.';
    } else if (info.teach === 'tdiv' && teachHint) {
      teachHint.textContent = 'time/div tells you what each horizontal square is worth. Here every horizontal div = 1 ms.';
    } else if (teachHint && info.pop) {
      teachHint.textContent = info.body;
    }

    // Pop above live x/y
    if (formulaPop && info.pop) {
      formulaPop.hidden = false;
      formulaPop.textContent = info.pop;
      const stage = document.getElementById('cro-stage');
      const r = stage.getBoundingClientRect();
      formulaPop.style.left = (clientX - r.left) + 'px';
      formulaPop.style.top = (clientY - r.top) + 'px';
    }
  }

  const croStage = document.getElementById('cro-stage');
  if (croStage) {
    const svg = croStage.querySelector('svg');
    croStage.addEventListener('mousemove', e => {
      const hit = e.target.closest('[data-inspect]');
      if (hit) showInspect(hit.getAttribute('data-inspect'), e.clientX, e.clientY);
      else {
        // keep marks cleared but still show x/y
        document.querySelectorAll('#cro-stage .inspect-mark').forEach(m => m.classList.remove('on'));
        document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('awake'));
        if (formulaPop) formulaPop.hidden = true;
        clearTeach();
        if (vrTitle) vrTitle.textContent = 'CRO screen';
        if (vrBody) vrBody.textContent = 'Move over the wave, peaks, Y/X brackets, a single division, or the volts/div and time/div regions.';
        if (vrFormula) vrFormula.textContent = '';
      }

      if (bubble && svg) {
        const p = svgPoint(svg, e.clientX, e.clientY);
        if (!p || p.x < 56 || p.x > 616 || p.y < 50 || p.y > 306) {
          bubble.hidden = true;
          return;
        }
        const tDiv = (p.x - PRAC_MAP.ox) / PRAC_MAP.divx;
        const vDiv = (PRAC_MAP.oy - p.y) / PRAC_MAP.divy;
        const t = tDiv * PRAC_MAP.tPerDiv;
        const v = vDiv * PRAC_MAP.vPerDiv;
        bubble.hidden = false;
        bubble.textContent = 't ' + t.toFixed(2) + ' ' + PRAC_MAP.tUnit + '  ·  V ' + v.toFixed(2) + ' ' + PRAC_MAP.vUnit;
        const r = croStage.getBoundingClientRect();
        // Sit just under the formula-pop when both show
        const yOff = (formulaPop && !formulaPop.hidden) ? 8 : 0;
        bubble.style.left = (e.clientX - r.left) + 'px';
        bubble.style.top = (e.clientY - r.top + yOff) + 'px';
        if (hit && formulaPop && !formulaPop.hidden) {
          // stack: formula-pop higher, xy lower
          formulaPop.style.top = (e.clientY - r.top - 18) + 'px';
          bubble.style.top = (e.clientY - r.top + 10) + 'px';
        }
      }
    });
    croStage.addEventListener('mouseleave', () => {
      clearInspect();
      if (bubble) bubble.hidden = true;
      if (formulaPop) formulaPop.hidden = true;
    });
  }

  /* Answer checking */
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

  /* Optional extras — hover open, auto-close ~500ms after leave */
  const extras = document.getElementById('end-extras');
  const extrasToggle = document.getElementById('end-extras-toggle');
  let extrasTimer = null;
  function openExtras() {
    if (!extras) return;
    clearTimeout(extrasTimer);
    extras.classList.add('open');
    if (extrasToggle) extrasToggle.setAttribute('aria-expanded', 'true');
  }
  function scheduleCloseExtras() {
    clearTimeout(extrasTimer);
    extrasTimer = setTimeout(() => {
      if (!extras) return;
      extras.classList.remove('open');
      if (extrasToggle) extrasToggle.setAttribute('aria-expanded', 'false');
    }, 500);
  }
  if (extras && extrasToggle) {
    extras.addEventListener('mouseenter', openExtras);
    extras.addEventListener('mouseleave', scheduleCloseExtras);
    extrasToggle.addEventListener('focus', openExtras);
    extrasToggle.addEventListener('click', e => {
      e.preventDefault();
      if (extras.classList.contains('open')) scheduleCloseExtras();
      else openExtras();
    });
  }

})();

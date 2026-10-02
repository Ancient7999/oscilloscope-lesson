(function () {
  'use strict';

  /* —— Animated background —— */
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const wells = [], specks = [];
  const palette = ['#3d5a80', '#5c7a9e', '#c4a574', '#8aa0b4', '#d4c4a8'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 10; i++) {
    wells.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 40 + Math.random() * 90,
      a: 0.025 + Math.random() * 0.045,
      color: palette[Math.floor(Math.random() * palette.length)],
      pulse: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.06
    });
  }
  for (let i = 0; i < 36; i++) {
    specks.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.8 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.09,
      vy: (Math.random() - 0.5) * 0.07,
      a: 0.12 + Math.random() * 0.2,
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }

  function drawFx() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * 0.2, H * 0.05, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.9);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(235,232,225,0.15)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    wells.forEach(w => {
      w.x += w.drift; w.pulse += 0.008;
      if (w.x < -80) w.x = W + 80;
      if (w.x > W + 80) w.x = -80;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r * (0.9 + 0.1 * Math.sin(w.pulse)), 0, Math.PI * 2);
      ctx.fillStyle = w.color;
      ctx.globalAlpha = w.a * (0.75 + 0.25 * Math.sin(w.pulse));
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

  /* —— Custom cursor —— */
  const cursor = document.getElementById('cursor');
  const coreEl = document.querySelector('#cursor.core');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  if (!coarse) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      coreEl.style.left = mouseX + 'px';
      coreEl.style.top = mouseY + 'px';
      proximityTick();
    });
    document.addEventListener('mousedown', () => cursor.classList.add('active'));
    document.addEventListener('mouseup', () => cursor.classList.remove('active'));
  }

  /* —— SPA views —— */
  const VIEWS = [
    { id: 'aim', label: 'Aim' },
    { id: 'basics', label: 'What is a CRO?' },
    { id: 'medical', label: 'Medical context' },
    { id: 'outcomes', label: 'Learning outcomes' },
    { id: 'apparatus', label: 'Apparatus' },
    { id: 'method', label: 'Method' },
    { id: 'practical', label: 'Practical', practical: true },
    { id: 'formulas', label: 'Formulas' },
    { id: 'results', label: 'Results' },
    { id: 'trace', label: 'Trace chart' }
  ];

  const nav = document.getElementById('nav');
  const progressFill = document.getElementById('progress-fill');
  const whereEl = document.getElementById('where');
  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');
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
    btnNext.disabled = i === VIEWS.length - 1;
    document.querySelector('.app').classList.toggle('mode-practical', !!VIEWS[i].practical);
    if (pushHash !== false) {
      history.replaceState(null, '', '#' + VIEWS[i].id);
    }
    if (VIEWS[i].id === 'practical') {
      setTimeout(() => { if (window.renderMathInElement) tryRenderMath(); }, 50);
    }
    tryRenderMath();
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
  btnNext.addEventListener('click', () => goTo(viewIndex + 1));

  document.getElementById('fs-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  function hashToIndex() {
    const h = (location.hash || '#aim').replace('#', '');
    const idx = VIEWS.findIndex(v => v.id === h);
    return idx >= 0 ? idx : 0;
  }
  window.addEventListener('hashchange', () => goTo(hashToIndex(), false));
  goTo(hashToIndex(), false);

  document.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(viewIndex + 1);
    if (e.key === 'ArrowLeft') goTo(viewIndex - 1);
  });

  /* —— Practical steps (hover-first) —— */
  const steps = [
    {
      title: 'Power on the CRO',
      body: 'Push in the power switch. After a few seconds a horizontal trace appears on the CRT.',
      hint: 'Hover near the power glow on the screen — it wakes the first cue.',
      annos: ['power'],
      knobs: [],
      hot: 'power'
    },
    {
      title: 'Connect the function generator',
      body: 'Connect the function-generator output to one CRO input (typically CH1) with a BNC lead.',
      hint: 'Hover the CH1 input badge or the CH1 ← FG chip below the screen.',
      annos: ['power', 'input'],
      knobs: ['input'],
      hot: 'input'
    },
    {
      title: 'Intensity and Focus',
      body: 'Adjust Intensity for a readable brightness, then Focus until the trace is a sharp thin line.',
      hint: 'Hover the INT · FOCUS chip — a blurry trace makes division counting inaccurate.',
      annos: ['focus'],
      knobs: ['focus'],
      hot: 'focus'
    },
    {
      title: 'Set volts/div (vertical scale)',
      body: 'Change the volts/division control until the wave fits the screen with a convenient height. Here the setting is 2 V/div.',
      hint: 'Hover the left VOLTS/DIV strip or the VOLTS/DIV chip.',
      annos: ['vdiv'],
      knobs: ['vdiv'],
      hot: 'vdiv'
    },
    {
      title: 'Set time/div (horizontal scale)',
      body: 'Change time/division until one or two cycles fill the screen and the sweep matches so the wave stands still. Here: 1 ms/div.',
      hint: 'Hover the TIME/DIV bar along the bottom of the CRT.',
      annos: ['tdiv'],
      knobs: ['tdiv'],
      hot: 'tdiv'
    },
    {
      title: 'Count Y divisions (peak-to-peak)',
      body: 'Count vertical divisions from the lowest point of the wave to the highest. On this screen Y = 3.0 divisions.',
      hint: 'Hover near the vertical amber bracket on the wave. Vpp = Y × volts/div.',
      annos: ['ydiv', 'vdiv'],
      knobs: ['vdiv'],
      hot: 'ydiv'
    },
    {
      title: 'Count X divisions (one period)',
      body: 'Count horizontal divisions spanning one complete cycle. Here X = 4.0 divisions.',
      hint: 'Hover the horizontal bracket under the wave. T = X × time/div.',
      annos: ['xdiv', 'tdiv'],
      knobs: ['tdiv'],
      hot: 'xdiv'
    },
    {
      title: 'Compute Vpp, A, T, and f',
      body: 'Multiply divisions by the scale settings, then find amplitude and frequency. Fields wake one by one as you hover them — fill gently, minimal clicks.',
      hint: 'Vpp = 3×2 = 6 V · A = 3 V · T = 4×1 ms = 4 ms · f = 1/0.004 s = 250 Hz.',
      annos: ['ydiv', 'xdiv', 'calc'],
      knobs: ['vdiv', 'tdiv'],
      hot: 'calc'
    }
  ];

  let stepIdx = 0;
  const guideMeta = document.getElementById('guide-meta');
  const guideTitle = document.getElementById('guide-title');
  const guideBody = document.getElementById('guide-body');
  const guideHint = document.getElementById('guide-hint');
  const whisper = document.getElementById('whisper');
  const stepDots = document.getElementById('step-dots');
  const btnStepPrev = document.getElementById('btn-step-prev');
  const btnStepNext = document.getElementById('btn-step-next');
  const calcPanel = document.getElementById('calc-panel');
  const annos = () => document.querySelectorAll('#cro-stage [data-anno]');
  const knobs = () => document.querySelectorAll('#cro-stage [data-knob]');

  steps.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'step-dot';
    b.setAttribute('aria-label', 'Step ' + (i + 1));
    b.addEventListener('click', () => { stepIdx = i; renderStep(); });
    stepDots.appendChild(b);
  });

  function renderStep() {
    const s = steps[stepIdx];
    guideMeta.textContent = 'Step ' + (stepIdx + 1) + ' of ' + steps.length;
    guideTitle.textContent = s.title;
    guideBody.textContent = s.body;
    guideHint.textContent = s.hint;
    btnStepPrev.disabled = stepIdx === 0;
    btnStepNext.textContent = stepIdx === steps.length - 1 ? 'Done' : 'Next →';
    btnStepNext.disabled = false;

    annos().forEach(el => {
      const key = el.getAttribute('data-anno');
      const on = s.annos.indexOf(key) !== -1;
      el.classList.toggle('on', on);
      el.classList.toggle('anno-pulse', on && (key === 'ydiv' || key === 'xdiv'));
      el.classList.remove('soft', 'wake');
    });
    knobs().forEach(el => {
      const key = el.getAttribute('data-knob');
      el.classList.toggle('active', s.knobs.indexOf(key) !== -1);
      el.classList.remove('wake');
    });
    Array.prototype.forEach.call(stepDots.children, (d, i) => {
      d.classList.toggle('on', i === stepIdx);
      d.classList.toggle('done', i < stepIdx);
      d.classList.remove('wake');
    });

    const openCalc = stepIdx >= steps.length - 1;
    calcPanel.classList.toggle('open', openCalc);
    if (openCalc) {
      document.querySelectorAll('.calc-field').forEach((f, i) => {
        setTimeout(() => f.classList.add('awake'), 120 + i * 140);
      });
    } else {
      document.querySelectorAll('.calc-field').forEach(f => f.classList.remove('awake'));
    }
  }

  btnStepPrev.addEventListener('click', () => { if (stepIdx > 0) { stepIdx--; renderStep(); } });
  btnStepNext.addEventListener('click', () => {
    if (stepIdx < steps.length - 1) { stepIdx++; renderStep(); }
  });

  /* Proximity / hover wake system */
  const HOT_TO_STEP = {
    power: 0, input: 1, focus: 2, vdiv: 3, tdiv: 4, ydiv: 5, xdiv: 6, calc: 7
  };

  function setWhisper(text, live) {
    whisper.textContent = text;
    whisper.classList.toggle('live', !!live);
  }

  function wakeHot(key) {
    const target = HOT_TO_STEP[key];
    if (typeof target !== 'number') return;

    // Soft preview of related annotations even before committing the step
    annos().forEach(el => {
      const k = el.getAttribute('data-anno');
      if (k === key || (steps[target].annos.indexOf(k) !== -1 && target === stepIdx)) {
        el.classList.add('wake');
        if (!el.classList.contains('on')) el.classList.add('soft');
      }
    });
    knobs().forEach(el => {
      if (el.getAttribute('data-knob') === key) el.classList.add('wake');
    });
    if (stepDots.children[target]) stepDots.children[target].classList.add('wake');

    const nextHint = steps[target].title;
    if (target === stepIdx) {
      setWhisper('Here · ' + nextHint + ' — linger, then click the zone or press Next when ready.', true);
    } else if (target === stepIdx + 1) {
      setWhisper('Nearby · next is “' + nextHint + '”. Hover a moment longer or click to step forward.', true);
      cursor.classList.add('near');
    } else if (target > stepIdx + 1) {
      setWhisper('Looking ahead · “' + nextHint + '” comes later. Finish the current step first, or jump via the dots.', true);
    } else {
      setWhisper('Backtrack · revisit “' + nextHint + '” anytime.', true);
    }
  }

  function clearWake() {
    annos().forEach(el => el.classList.remove('wake', 'soft'));
    knobs().forEach(el => el.classList.remove('wake'));
    Array.prototype.forEach.call(stepDots.children, d => d.classList.remove('wake'));
    document.querySelectorAll('.hotspot-hit').forEach(h => h.classList.remove('near'));
    cursor.classList.remove('near');
    if (VIEWS[viewIndex] && VIEWS[viewIndex].id === 'practical') {
      setWhisper('Hover the screen, knobs, or brackets — they wake and gently show what’s next. Few clicks needed.', false);
    }
  }

  function proximityTick() {
    if (!VIEWS[viewIndex] || VIEWS[viewIndex].id !== 'practical') return;
    const stage = document.getElementById('cro-stage');
    if (!stage) return;

    let nearest = null;
    let best = 72;

    document.querySelectorAll('[data-hot]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = mouseX - cx, dy = mouseY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const pad = Math.max(r.width, r.height) * 0.55 + 36;
      if (d < pad && d < best) {
        best = d;
        nearest = el.getAttribute('data-hot');
        if (el.classList.contains('hotspot-hit')) el.classList.add('near');
      } else if (el.classList.contains('hotspot-hit')) {
        el.classList.remove('near');
      }
    });

    // Also check SVG hotspot centers via getScreenCTM if present
    document.querySelectorAll('#cro-stage .hotspot-hit').forEach(h => {
      try {
        const bb = h.getBoundingClientRect();
        const cx = bb.left + bb.width / 2;
        const cy = bb.top + bb.height / 2;
        const d = Math.hypot(mouseX - cx, mouseY - cy);
        const pad = Math.max(bb.width, bb.height) * 0.6 + 40;
        if (d < pad && d < best) {
          best = d;
          nearest = h.getAttribute('data-hot') || HOT_KEY_FROM_GOTO(h);
          h.classList.add('near');
        }
      } catch (e) { /* ignore */ }
    });

    if (nearest) wakeHot(nearest);
    else clearWake();
  }

  function HOT_KEY_FROM_GOTO(h) {
    const g = parseInt(h.getAttribute('data-goto'), 10);
    const map = { 0: 'power', 1: 'input', 2: 'focus', 3: 'vdiv', 4: 'tdiv', 5: 'ydiv', 6: 'xdiv', 7: 'calc' };
    return map[g] || null;
  }

  // Commit on click of hotspot / knob — low resistance advance
  document.getElementById('cro-stage').addEventListener('click', e => {
    const hotEl = e.target.closest('[data-hot]');
    const hit = e.target.closest('.hotspot-hit');
    let key = hotEl ? hotEl.getAttribute('data-hot') : null;
    if (!key && hit) key = HOT_KEY_FROM_GOTO(hit);
    if (!key) return;
    const target = HOT_TO_STEP[key];
    if (typeof target === 'number') {
      // Allow jump to current, next, or any earlier; soft-gate far jumps
      if (target <= stepIdx + 1 || target <= stepIdx) {
        stepIdx = target;
        renderStep();
      } else {
        setWhisper('Almost — finish “' + steps[stepIdx].title + '” first, or use Next.', true);
      }
    }
  });

  knobs().forEach(el => {
    el.addEventListener('mouseenter', () => wakeHot(el.getAttribute('data-knob')));
    el.addEventListener('mouseleave', () => clearWake());
    el.addEventListener('click', () => {
      const key = el.getAttribute('data-knob');
      const target = HOT_TO_STEP[key];
      if (typeof target === 'number' && target <= stepIdx + 1) {
        stepIdx = target; renderStep();
      }
    });
  });

  // Calc field hover wake
  document.querySelectorAll('.calc-field').forEach(f => {
    f.addEventListener('mouseenter', () => {
      if (calcPanel.classList.contains('open')) f.classList.add('awake');
    });
  });

  renderStep();
  setWhisper('Hover the screen, knobs, or brackets — they wake and gently show what’s next. Few clicks needed.', false);

  /* —— Answer checking —— */
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
      fb.textContent = 'All four match (Vpp = 6 V, A = 3 V, T = 4 ms, f = 250 Hz).';
    } else {
      fb.className = 'calc-feedback bad';
      fb.textContent = ok + ' of ' + total + ' correct. Re-count Y and X, then × 2 V/div and 1 ms/div.';
    }
  }
  document.getElementById('btn-check').addEventListener('click', check);
  document.getElementById('btn-reveal').addEventListener('click', () => {
    document.getElementById('in-vpp').value = '6';
    document.getElementById('in-a').value = '3';
    document.getElementById('in-tms').value = '4';
    document.getElementById('in-f').value = '250';
    check();
    stepIdx = steps.length - 1;
    renderStep();
  });

  // Auto-check on blur lightly
  document.querySelectorAll('#calc-panel input').forEach(inp => {
    inp.addEventListener('change', () => {
      const filled = [...document.querySelectorAll('#calc-panel input')].filter(i => i.value !== '').length;
      if (filled >= 2) check();
    });
  });

  /* —— Chart handwriting toggle —— */
  const chartCanvas = document.getElementById('chart-canvas');
  const btnOn = document.getElementById('btn-hand-on');
  const btnOff = document.getElementById('btn-hand-off');
  function setHand(show) {
    chartCanvas.classList.toggle('hand-hidden', !show);
    btnOn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btnOff.setAttribute('aria-pressed', show ? 'false' : 'true');
  }
  btnOn.addEventListener('click', () => setHand(true));
  btnOff.addEventListener('click', () => setHand(false));


  /* —— End extras upward expand (last page only, not in nav) —— */
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

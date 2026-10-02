> This README is AI-generated.

## Try it live (no setup)

**[Open the Oscilloscope Lab Lesson on GitHub Pages →](https://ancient7999.github.io/oscilloscope-lesson/)**

Skip cloning, installs, and local servers — just click the link above and use the lesson in your browser.

---

# Oscilloscope — College Lab Lesson

Static multipage SPA for measuring amplitude, period, and frequency with a CRO.
Site-wide Practical colorful live theme (scanline / phosphor / waveform beams). Chart-first teaching with live t/V readouts, under-chart formulas, and a guided calc walkthrough (Vpp → A → T → f).

## Section order

1. Aim & outcomes (merged)
2. What is an oscilloscope? (numbered graticule + live t/V)
3. Medical perspectives (ECG / EEG / EMG — high-contrast cards on the live theme)
4. Method (click a step → illustration panel)
5. Formulas & results (merged — worked values match Trace)
6. Trace waveforms (example traces always visible)
7. MCQs (scrollable full bank — select / feedback / explanations)
8. Practical (final — free hover teaching + guided calc + draw-graph stroke MCQ)

## Local preview (optional)

Open `index.html` in a browser (or serve the folder). Assets load via relative paths.
MCQs load `data/mcq-bank.json` via `fetch`, so use a local static server if the browser blocks file:// fetches.

## Structure

- `index.html` — hash-routed views + sneaky end extras
- `css/styles.css` — layout, Practical theme, teaching UI, MCQ / draw-graph
- `js/app.js` — navigation, FX, cursor, chart / formula teaching, guided calc, MCQs, draw-graph
- `data/mcq-bank.json` — expanded lab MCQ bank (same schema as the source bank)
- `assets/` — CRO, function generator, EEG, graph paper, method-step illustrations

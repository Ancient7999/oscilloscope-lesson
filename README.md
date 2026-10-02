# Oscilloscope — College Lab Lesson

Static multipage SPA for measuring amplitude, period, and frequency with a CRO.
Site-wide Practical colorful live theme (scanline / phosphor / waveform beams). Chart-first teaching with live t/V readouts, under-chart formulas, and a guided calc walkthrough (Vpp → A → T → f).

## View on GitHub Pages

`https://ancient7999.github.io/oscilloscope-lesson/`

## Section order

1. Aim & outcomes (merged)
2. What is an oscilloscope? (numbered graticule + live t/V)
3. Medical perspectives (ECG / EEG / EMG)
4. Method (click a step → illustration panel)
5. Formulas & results (merged — worked values match Trace)
6. Trace waveforms (example traces always visible)
7. Practical (final — free hover teaching + guided calc)

## Local preview

Open `index.html` in a browser (or serve the folder). Assets load via relative paths.

## Structure

- `index.html` — hash-routed views + sneaky end extras
- `css/styles.css` — layout, Practical theme, teaching UI
- `js/app.js` — navigation, FX, cursor, chart / formula teaching, guided calc
- `assets/` — CRO, function generator, EEG, graph paper, method-step illustrations

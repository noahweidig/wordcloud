# WordCloud Studio

A single-page web app that generates word clouds from pasted text or uploaded `.txt` files. Built with React, TypeScript, Vite, and d3-cloud.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Works fully offline after install.

## Features

- **Text input**: Paste text or upload a `.txt` file
- **Stopword removal**: Toggle built-in English stopwords + add custom ones
- **Word weighting**: Frequency counting with min-threshold, max-words, and scale modes (linear/sqrt/log)
- **Appearance controls**: Canvas size presets, background color & transparency, font family/weight, spiral type, padding
- **Rotation**: None, random (-30..30), fixed (0/90), with probability slider
- **Color modes**: Single color, palette cycling, frequency gradient, random from palette — 10 built-in palettes
- **Shape masks**: Circle, heart, star, speech bubble, cloud — plus custom PNG upload
- **Export**: Download PNG (with or without transparency), copy to clipboard
- **Presets**: Minimal, Vibrant, Poster — plus Randomize button
- **Stats**: Total words, unique words, words used in cloud

## Project Structure

```
src/
  utils/
    text.ts        — Tokenization, frequency counting, scaling
    stopwords.ts   — English stopword list
    palettes.ts    — Color palette definitions
    masks.ts       — Shape mask drawing and pixel-level masking
  hooks/
    useWordCloud.ts — d3-cloud layout generation hook
  components/
    ControlPanel.tsx — Left sidebar with all settings
    WordCloudCanvas.tsx — Canvas rendering + export logic
    ExportBar.tsx   — Download/copy buttons
  types.ts         — TypeScript types, defaults, presets
  App.tsx          — Main app layout and state
  App.css          — All styles
```

## Tech Stack

- React 19 + TypeScript
- Vite
- d3-cloud (word cloud layout algorithm)
- HTML Canvas (rendering)

## Notes

- Shape masks use post-render pixel clipping for reliable results with any shape
- Word placement within masks is filtered by center-point (words whose center falls outside the mask are removed)
- SVG export is not implemented (TODO)
- Stemming is not implemented (TODO)

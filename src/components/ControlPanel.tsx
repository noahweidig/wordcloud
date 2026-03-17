import { useRef } from 'react';
import type { CloudSettings, ScaleMode, SpiralType, RotationMode, ColorMode, MaskShape, PresetName } from '../types';
import { CANVAS_PRESETS, FONT_FAMILIES, FONT_WEIGHTS, PRESETS } from '../types';
import { PALETTES } from '../utils/palettes';
import type { CloudStats } from '../hooks/useWordCloud';

interface Props {
  settings: CloudSettings;
  onChange: (patch: Partial<CloudSettings>) => void;
  onGenerate: () => void;
  onRandomize: () => void;
  generating: boolean;
  stats: CloudStats;
  darkMode: boolean;
  onToggleDark: () => void;
  onError?: (msg: string) => void;
}

export default function ControlPanel({
  settings,
  onChange,
  onGenerate,
  onRandomize,
  generating,
  stats,
  darkMode,
  onToggleDark,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: File size and type validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError?.('File too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }
    if (!file.name.toLowerCase().endsWith('.txt') || file.type !== 'text/plain') {
      onError?.('Invalid file type. Only .txt files are allowed.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange({ text });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMaskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: File size and type validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError?.('Image too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }
    if (file.type !== 'image/png') {
      onError?.('Invalid image type. Only PNG images are allowed for masks.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onChange({ maskShape: 'custom', customMaskUrl: url });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyPreset = (name: PresetName) => {
    onChange(PRESETS[name]);
  };

  const handleCanvasPreset = (idx: number) => {
    const preset = CANVAS_PRESETS[idx];
    if (preset.w > 0) {
      onChange({ canvasWidth: preset.w, canvasHeight: preset.h });
    }
  };

  return (
    <div className="control-panel">
      <div className="app-title-row">
        <h1 className="app-title">WordCloud Studio</h1>
        <button
          className="theme-toggle"
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <span>Total: <b>{stats.totalWords}</b></span>
        <span>Unique: <b>{stats.uniqueWords}</b></span>
        <span>Used: <b>{stats.wordsUsed}</b></span>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="button-row">
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={generating || !settings.text.trim()}
            title={
              generating
                ? "Generating..."
                : !settings.text.trim()
                  ? "Add text to generate a word cloud"
                  : "Generate word cloud (Ctrl/Cmd + Enter)"
            }
            aria-label="Generate – important next step"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
          <button className="btn btn-secondary" onClick={onRandomize}>
            Randomize
          </button>
        </div>
        <div className="button-row">
          <button className="btn btn-small" onClick={() => applyPreset('minimal')}>Minimal</button>
          <button className="btn btn-small" onClick={() => applyPreset('vibrant')}>Vibrant</button>
          <button className="btn btn-small" onClick={() => applyPreset('poster')}>Poster</button>
        </div>
      </div>

      {/* Text Input */}
      <details className="section" open>
        <summary className="section-title">Text Input</summary>
        <textarea
          className="text-input"
          aria-label="Source text for word cloud"
          placeholder="Paste text"
          value={settings.text}
          maxLength={100000} // Limit to prevent DoS via excessive memory allocation
          onChange={(e) => onChange({ text: e.target.value })}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              if (!generating && settings.text.trim()) {
                onGenerate();
              }
            }
          }}
          rows={6}
        />
        <div className="button-row">
          <button className="btn btn-small" onClick={() => fileInputRef.current?.click()}>
            Upload .txt
          </button>
          <button
            className="btn btn-small"
            onClick={() => onChange({ text: '' })}
            disabled={!settings.text}
            title={!settings.text ? "Text is already empty" : undefined}
          >
            Clear
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <div className="control-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.removeStopwords}
              onChange={(e) => onChange({ removeStopwords: e.target.checked })}
            />
            Remove common words
          </label>
        </div>
        <div className="control-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.lowercase}
              onChange={(e) => onChange({ lowercase: e.target.checked })}
            />
            Lowercase
          </label>
        </div>
        <div className="control-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.removeNumbers}
              onChange={(e) => onChange({ removeNumbers: e.target.checked })}
            />
            Remove numbers
          </label>
        </div>
        <div className="control-row">
          <label htmlFor="custom-stopwords" className="control-label">Words to remove</label>
          <input
            id="custom-stopwords"
            type="text"
            className="text-field"
            placeholder="word1, word2, ..."
            value={settings.customStopwords}
            maxLength={2000} // Limit input length to avoid memory issues
            onChange={(e) => onChange({ customStopwords: e.target.value })}
          />
        </div>
      </details>

      {/* Word Weighting */}
      <details className="section">
        <summary className="section-title">Word Weighting</summary>
        <div className="control-row">
          <label className="control-label">Min frequency: {settings.minFrequency}</label>
          <input
            type="range" min={1} max={20} step={1}
            value={settings.minFrequency}
            onChange={(e) => onChange({ minFrequency: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">Max words: {settings.maxWords}</label>
          <input
            type="range" min={10} max={500} step={10}
            value={settings.maxWords}
            onChange={(e) => onChange({ maxWords: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">Scale mode</label>
          <select
            value={settings.scaleMode}
            onChange={(e) => onChange({ scaleMode: e.target.value as ScaleMode })}
          >
            <option value="linear">Linear</option>
            <option value="sqrt">Square root</option>
            <option value="log">Logarithmic</option>
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">Min font size: {settings.minFontSize}</label>
          <input
            type="range" min={8} max={40} step={1}
            value={settings.minFontSize}
            onChange={(e) => onChange({ minFontSize: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">Max font size: {settings.maxFontSize}</label>
          <input
            type="range" min={30} max={200} step={5}
            value={settings.maxFontSize}
            onChange={(e) => onChange({ maxFontSize: +e.target.value })}
          />
        </div>
      </details>

      {/* Appearance */}
      <details className="section">
        <summary className="section-title">Appearance</summary>
        <div className="control-row">
          <label className="control-label">Canvas size</label>
          <select onChange={(e) => handleCanvasPreset(+e.target.value)}>
            {CANVAS_PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </div>
        {/* Custom width/height always visible */}
        <div className="control-row inline">
          <label className="control-label">W:</label>
          <input
            type="number" min={200} max={4000} step={50}
            value={settings.canvasWidth}
            onChange={(e) => onChange({ canvasWidth: +e.target.value })}
            className="num-input"
          />
          <label className="control-label">H:</label>
          <input
            type="number" min={200} max={4000} step={50}
            value={settings.canvasHeight}
            onChange={(e) => onChange({ canvasHeight: +e.target.value })}
            className="num-input"
          />
        </div>
        <div className="control-row inline">
          <label className="control-label">Background</label>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">BG opacity: {settings.bgAlpha.toFixed(2)}</label>
          <input
            type="range" min={0} max={1} step={0.05}
            value={settings.bgAlpha}
            onChange={(e) => onChange({ bgAlpha: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">Font family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">Font weight</label>
          <select
            value={settings.fontWeight}
            onChange={(e) => onChange({ fontWeight: e.target.value })}
          >
            {FONT_WEIGHTS.map((fw) => (
              <option key={fw.value} value={fw.value}>{fw.label}</option>
            ))}
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">Spiral</label>
          <select
            value={settings.spiral}
            onChange={(e) => onChange({ spiral: e.target.value as SpiralType })}
          >
            <option value="archimedean">Archimedean</option>
            <option value="rectangular">Rectangular</option>
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">Padding: {settings.padding}</label>
          <input
            type="range" min={0} max={20} step={1}
            value={settings.padding}
            onChange={(e) => onChange({ padding: +e.target.value })}
          />
        </div>
      </details>

      {/* Rotation */}
      <details className="section">
        <summary className="section-title">Rotation</summary>
        <div className="control-row">
          <label className="control-label">Mode</label>
          <select
            value={settings.rotationMode}
            onChange={(e) => onChange({ rotationMode: e.target.value as RotationMode })}
          >
            <option value="none">None (horizontal)</option>
            <option value="random">Random -30..30</option>
            <option value="fixed">Fixed 0/90</option>
          </select>
        </div>
        {settings.rotationMode !== 'none' && (
          <div className="control-row">
            <label className="control-label">
              Rotation probability: {(settings.rotationProbability * 100).toFixed(0)}%
            </label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.rotationProbability}
              onChange={(e) => onChange({ rotationProbability: +e.target.value })}
            />
          </div>
        )}
      </details>

      {/* Colors */}
      <details className="section">
        <summary className="section-title">Colors</summary>
        <div className="control-row">
          <label className="control-label">Color mode</label>
          <select
            value={settings.colorMode}
            onChange={(e) => onChange({ colorMode: e.target.value as ColorMode })}
          >
            <option value="single">Single color</option>
            <option value="palette">Palette (cycle)</option>
            <option value="gradient">Gradient (by frequency)</option>
            <option value="random">Random from palette</option>
          </select>
        </div>
        {settings.colorMode === 'single' && (
          <div className="control-row inline">
            <label className="control-label">Color</label>
            <input
              type="color"
              value={settings.singleColor}
              onChange={(e) => onChange({ singleColor: e.target.value })}
            />
          </div>
        )}
        {settings.colorMode !== 'single' && (
          <div className="control-row">
            <label className="control-label">Palette</label>
            <select
              value={settings.paletteIndex}
              onChange={(e) => onChange({ paletteIndex: +e.target.value })}
            >
              {PALETTES.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
            {/* Palette preview */}
            <div className="palette-preview">
              {PALETTES[settings.paletteIndex]?.colors.map((c, i) => (
                <span key={i} className="palette-swatch" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        )}
        <div className="control-row">
          <label className="control-label">Word opacity: {settings.wordAlpha.toFixed(2)}</label>
          <input
            type="range" min={0.1} max={1} step={0.05}
            value={settings.wordAlpha}
            onChange={(e) => onChange({ wordAlpha: +e.target.value })}
          />
        </div>
      </details>

      {/* Shape Mask */}
      <details className="section">
        <summary className="section-title">Shape Mask</summary>
        <div className="control-row">
          <label className="control-label">Shape</label>
          <select
            value={settings.maskShape}
            onChange={(e) => onChange({ maskShape: e.target.value as MaskShape, customMaskUrl: null })}
          >
            <option value="none">None</option>
            <option value="circle">Circle</option>
            <option value="heart">Heart</option>
            <option value="star">Star</option>
            <option value="speech-bubble">Speech Bubble</option>
            <option value="cloud">Cloud</option>
            <option value="custom">Custom PNG...</option>
          </select>
        </div>
        {settings.maskShape === 'custom' && (
          <div className="control-row">
            <button
              className={`btn btn-small ${!settings.customMaskUrl ? 'btn-focus' : ''}`}
              onClick={() => maskFileRef.current?.click()}
              aria-label="Upload custom PNG mask – important next step"
            >
              {settings.customMaskUrl ? 'Change mask image' : 'Upload PNG mask'}
            </button>
            <input
              ref={maskFileRef}
              type="file"
              accept="image/png"
              style={{ display: 'none' }}
              onChange={handleMaskUpload}
            />
          </div>
        )}
      </details>
    </div>
  );
}

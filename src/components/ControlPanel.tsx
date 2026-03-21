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
  onError?: (msg: string) => void;
}

/** Compute CSS custom property value for range input fill */
function rangePct(value: number, min: number, max: number): React.CSSProperties {
  return { '--val': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties;
}

/* ── Section icon SVGs ── */
function IconText() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 2.5h10M6.5 2.5v8M4 10.5h5"/>
    </svg>
  );
}

function IconWeight() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="8.5" width="2.5" height="3" rx="0.5"/>
      <rect x="5.25" y="5.5" width="2.5" height="6" rx="0.5"/>
      <rect x="9.5" y="2.5" width="2.5" height="9" rx="0.5"/>
    </svg>
  );
}

function IconAppearance() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="5"/>
      <path d="M6.5 1.5v1.8M6.5 9.7v1.8M1.5 6.5h1.8M9.7 6.5h1.8"/>
    </svg>
  );
}

function IconRotation() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5v3H7.5"/>
      <path d="M2.5 6.5a4 4 0 007.9-.8"/>
      <path d="M2.5 10.5v-3h3"/>
      <path d="M10.5 6.5a4 4 0 01-7.9.8"/>
    </svg>
  );
}

function IconColors() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="4" cy="4" r="2.2"/>
      <circle cx="9" cy="4" r="2.2"/>
      <circle cx="4" cy="9" r="2.2"/>
      <circle cx="9" cy="9" r="2.2"/>
    </svg>
  );
}

function IconMask() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 1.2l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3L1.7 4.7l3.3-.5z"/>
    </svg>
  );
}

export default function ControlPanel({
  settings,
  onChange,
  onGenerate,
  onRandomize,
  generating,
  stats,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
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
    reader.onload = (ev) => onChange({ text: ev.target?.result as string });
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMaskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
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
    reader.onload = (ev) => onChange({ maskShape: 'custom', customMaskUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyPreset = (name: PresetName) => onChange(PRESETS[name]);

  const handleCanvasPreset = (idx: number) => {
    const preset = CANVAS_PRESETS[idx];
    if (preset.w > 0) onChange({ canvasWidth: preset.w, canvasHeight: preset.h });
  };

  return (
    <div className="control-panel">

      {/* Stats */}
      <div className="stats-bar" aria-live="polite">
        <div className="stat-chip">
          <span className="stat-value">{stats.totalWords}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-chip">
          <span className="stat-value">{stats.uniqueWords}</span>
          <span className="stat-label">Unique</span>
        </div>
        <div className="stat-chip">
          <span className="stat-value">{stats.wordsUsed}</span>
          <span className="stat-label">Used</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-row">
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={generating || !settings.text.trim()}
            title={
              generating
                ? 'Generating…'
                : !settings.text.trim()
                  ? 'Add text to generate a word cloud'
                  : 'Generate word cloud (Ctrl/Cmd + Enter)'
            }
            aria-label="Generate Word Cloud"
          >
            {generating ? (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M6.5 1.5a5 5 0 015 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6.5C2 4 4 2 6.5 2S11 4 11 6.5 9 11 6.5 11"/>
                  <path d="M1 9.5l2 2 2-2"/>
                </svg>
                Generate
              </>
            )}
          </button>
          <button className="btn btn-secondary" onClick={onRandomize} title="Randomize settings and generate">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1h3v3M1 9l3 3h-3M12 1L7.5 5.5M1 1l4.5 4.5M9 12h3v-3"/>
            </svg>
            Randomize
          </button>
        </div>
        <div className="preset-row">
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '2px' }}>Presets:</span>
          <button className="btn btn-chip" onClick={() => applyPreset('minimal')}>Minimal</button>
          <button className="btn btn-chip" onClick={() => applyPreset('vibrant')}>Vibrant</button>
          <button className="btn btn-chip" onClick={() => applyPreset('poster')}>Poster</button>
        </div>
      </div>

      {/* Text Input */}
      <details className="section" open>
        <summary className="section-title">
          <span className="section-icon"><IconText /></span>
          <span className="section-title-text">Text Input</span>
          <span className="section-arrow" />
        </summary>
        <textarea
          id="source-text-input"
          className={`text-input ${!settings.text.trim() ? 'text-input-attention' : ''}`}
          aria-label="Source text for word cloud"
          placeholder="Paste or type your text here…"
          value={settings.text}
          maxLength={100000}
          onChange={(e) => onChange({ text: e.target.value })}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              if (!generating && settings.text.trim()) onGenerate();
            }
          }}
          rows={5}
        />
        <div className="char-count">{settings.text.length.toLocaleString()} / 100,000</div>
        <div className="control-row">
          <div className="button-row">
            <button className="btn btn-small" onClick={() => fileInputRef.current?.click()}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 1v6M2.5 4l3-3 3 3M1 9h9"/>
              </svg>
              Upload .txt
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                if (settings.text.length > 200) {
                  if (window.confirm('Are you sure you want to clear this text?')) {
                    onChange({ text: '' });
                  }
                } else {
                  onChange({ text: '' });
                }
              }}
              disabled={!settings.text}
              title={!settings.text ? "Text input is already empty" : "Clear text"}
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
        </div>
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
          <label htmlFor="custom-stopwords" className="control-label">
            <span className="control-label-text">Words to remove</span>
          </label>
          <input
            id="custom-stopwords"
            type="text"
            className="text-field"
            placeholder="word1, word2, …"
            value={settings.customStopwords}
            maxLength={2000}
            onChange={(e) => onChange({ customStopwords: e.target.value })}
          />
          <div className="char-count">{settings.customStopwords.length} / 2,000</div>
        </div>
      </details>

      {/* Word Weighting */}
      <details className="section">
        <summary className="section-title">
          <span className="section-icon"><IconWeight /></span>
          <span className="section-title-text">Word Weighting</span>
          <span className="section-arrow" />
        </summary>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Min frequency</span>
            <span className="control-value">{settings.minFrequency}</span>
          </label>
          <input
            type="range" min={1} max={20} step={1}
            value={settings.minFrequency}
            style={rangePct(settings.minFrequency, 1, 20)}
            onChange={(e) => onChange({ minFrequency: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Max words</span>
            <span className="control-value">{settings.maxWords}</span>
          </label>
          <input
            type="range" min={10} max={500} step={10}
            value={settings.maxWords}
            style={rangePct(settings.maxWords, 10, 500)}
            onChange={(e) => onChange({ maxWords: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Scale mode</span>
          </label>
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
          <label className="control-label">
            <span className="control-label-text">Min font size</span>
            <span className="control-value">{settings.minFontSize}px</span>
          </label>
          <input
            type="range" min={8} max={40} step={1}
            value={settings.minFontSize}
            style={rangePct(settings.minFontSize, 8, 40)}
            onChange={(e) => onChange({ minFontSize: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Max font size</span>
            <span className="control-value">{settings.maxFontSize}px</span>
          </label>
          <input
            type="range" min={30} max={200} step={5}
            value={settings.maxFontSize}
            style={rangePct(settings.maxFontSize, 30, 200)}
            onChange={(e) => onChange({ maxFontSize: +e.target.value })}
          />
        </div>
      </details>

      {/* Appearance */}
      <details className="section">
        <summary className="section-title">
          <span className="section-icon"><IconAppearance /></span>
          <span className="section-title-text">Appearance</span>
          <span className="section-arrow" />
        </summary>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Canvas size</span>
          </label>
          <select onChange={(e) => handleCanvasPreset(+e.target.value)}>
            {CANVAS_PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </div>
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
          <label className="control-label" style={{ marginBottom: 0 }}>Background</label>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Background opacity</span>
            <span className="control-value">{Math.round(settings.bgAlpha * 100)}%</span>
          </label>
          <input
            type="range" min={0} max={1} step={0.05}
            value={settings.bgAlpha}
            style={rangePct(settings.bgAlpha, 0, 1)}
            onChange={(e) => onChange({ bgAlpha: +e.target.value })}
          />
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Font family</span>
          </label>
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
          <label className="control-label">
            <span className="control-label-text">Font weight</span>
          </label>
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
          <label className="control-label">
            <span className="control-label-text">Spiral</span>
          </label>
          <select
            value={settings.spiral}
            onChange={(e) => onChange({ spiral: e.target.value as SpiralType })}
          >
            <option value="archimedean">Archimedean</option>
            <option value="rectangular">Rectangular</option>
          </select>
        </div>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Word padding</span>
            <span className="control-value">{settings.padding}px</span>
          </label>
          <input
            type="range" min={0} max={20} step={1}
            value={settings.padding}
            style={rangePct(settings.padding, 0, 20)}
            onChange={(e) => onChange({ padding: +e.target.value })}
          />
        </div>
      </details>

      {/* Rotation */}
      <details className="section">
        <summary className="section-title">
          <span className="section-icon"><IconRotation /></span>
          <span className="section-title-text">Rotation</span>
          <span className="section-arrow" />
        </summary>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Mode</span>
          </label>
          <select
            value={settings.rotationMode}
            onChange={(e) => onChange({ rotationMode: e.target.value as RotationMode })}
          >
            <option value="none">None (horizontal)</option>
            <option value="random">Random −30°…30°</option>
            <option value="fixed">Fixed 0° / 90°</option>
          </select>
        </div>
        {settings.rotationMode !== 'none' && (
          <div className="control-row">
            <label className="control-label">
              <span className="control-label-text">Rotation probability</span>
              <span className="control-value">{Math.round(settings.rotationProbability * 100)}%</span>
            </label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.rotationProbability}
              style={rangePct(settings.rotationProbability, 0, 1)}
              onChange={(e) => onChange({ rotationProbability: +e.target.value })}
            />
          </div>
        )}
      </details>

      {/* Colors */}
      <details className="section">
        <summary className="section-title">
          <span className="section-icon"><IconColors /></span>
          <span className="section-title-text">Colors</span>
          <span className="section-arrow" />
        </summary>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Color mode</span>
          </label>
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
            <label className="control-label" style={{ marginBottom: 0 }}>Color</label>
            <input
              type="color"
              value={settings.singleColor}
              onChange={(e) => onChange({ singleColor: e.target.value })}
            />
          </div>
        )}
        {settings.colorMode !== 'single' && (
          <div className="control-row">
            <label className="control-label">
              <span className="control-label-text">Palette</span>
            </label>
            <select
              value={settings.paletteIndex}
              onChange={(e) => onChange({ paletteIndex: +e.target.value })}
            >
              {PALETTES.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
            <div className="palette-preview">
              {PALETTES[settings.paletteIndex]?.colors.map((c, i) => (
                <span key={i} className="palette-swatch" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        )}
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Word opacity</span>
            <span className="control-value">{Math.round(settings.wordAlpha * 100)}%</span>
          </label>
          <input
            type="range" min={0.1} max={1} step={0.05}
            value={settings.wordAlpha}
            style={rangePct(settings.wordAlpha, 0.1, 1)}
            onChange={(e) => onChange({ wordAlpha: +e.target.value })}
          />
        </div>
      </details>

      {/* Shape Mask */}
      <details className="section">
        <summary className="section-title">
          <span className="section-icon"><IconMask /></span>
          <span className="section-title-text">Shape Mask</span>
          <span className="section-arrow" />
        </summary>
        <div className="control-row">
          <label className="control-label">
            <span className="control-label-text">Shape</span>
          </label>
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
            <option value="custom">Custom PNG…</option>
          </select>
        </div>
        {settings.maskShape === 'custom' && (
          <div className="control-row">
            <button
              className={`btn btn-small ${!settings.customMaskUrl ? 'btn-focus' : ''}`}
              onClick={() => maskFileRef.current?.click()}
              aria-label="Upload custom PNG mask"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 1v6M2.5 4l3-3 3 3M1 9h9"/>
              </svg>
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

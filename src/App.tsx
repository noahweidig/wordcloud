import { useState, useRef, useCallback, useEffect } from 'react';
import type { CloudSettings } from './types';
import { DEFAULT_SETTINGS, FONT_FAMILIES, FONT_WEIGHTS } from './types';
import { PALETTES } from './utils/palettes';
import { useWordCloud } from './hooks/useWordCloud';
import ControlPanel from './components/ControlPanel';
import WordCloudCanvas, { type CanvasHandle } from './components/WordCloudCanvas';
import ExportBar from './components/ExportBar';
import './App.css';

function CloudIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 17.5A4.5 4.5 0 0015.5 13h-.75A6 6 0 104 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17.5h12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Sample text for demo
const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Technology innovation software development programming code algorithm data structure machine learning artificial intelligence neural network deep learning natural language processing computer vision cloud computing web development frontend backend database server client API framework library component function variable object class interface type module package import export async await promise callback event loop thread process memory stack heap queue array linked list hash map tree graph binary search sort merge quick heap insertion selection bubble algorithm complexity time space optimal efficient scalable distributed parallel concurrent asynchronous synchronous reactive functional object oriented procedural declarative imperative paradigm pattern design architecture microservice monolith container orchestration deployment continuous integration delivery testing unit integration end to end performance security authentication authorization encryption protocol HTTP REST GraphQL WebSocket TCP UDP DNS SSL TLS certificate domain server client request response header body status code middleware router controller model view template engine render component state props lifecycle hook effect context reducer store action dispatch subscribe provider consumer middleware thunk saga observable stream pipe filter map reduce transform aggregate query mutation subscription schema resolver directive fragment union interface enum scalar input type field argument default value validation pagination cursor offset limit sort order ascending descending filter search index cache invalidation refresh token session cookie storage local session indexed database query optimization join relationship foreign key primary key unique constraint index trigger stored procedure transaction rollback commit isolation level consistency durability availability partition tolerance consensus replication sharding cluster node leader follower election heartbeat timeout retry circuit breaker rate limit throttle backpressure buffer overflow memory leak garbage collection reference counting mark sweep compact generation nursery survivor tenure`;

type ToastType = 'success' | 'error' | 'info';

function App() {
  const [settings, setSettings] = useState<CloudSettings>({
    ...DEFAULT_SETTINGS,
    text: SAMPLE_TEXT,
  });
  const { words, generating, stats, generate } = useWordCloud();
  const canvasRef = useRef<CanvasHandle>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('wc-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('wc-dark-mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  const handleChange = useCallback((patch: Partial<CloudSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleGenerate = useCallback(() => {
    generate(settings);
    setSidebarOpen(false);
  }, [generate, settings]);

  const handleRandomize = useCallback(() => {
    const randomPalette = Math.floor(Math.random() * PALETTES.length);
    const randomFont = FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)];
    const randomWeight = FONT_WEIGHTS[Math.floor(Math.random() * FONT_WEIGHTS.length)].value;
    const colorModes = ['single', 'palette', 'gradient', 'random'] as const;
    const randomColorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
    const rotationModes = ['none', 'random', 'fixed'] as const;
    const randomRotation = rotationModes[Math.floor(Math.random() * rotationModes.length)];
    const spirals = ['archimedean', 'rectangular'] as const;
    const randomSpiral = spirals[Math.floor(Math.random() * spirals.length)];
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const bgColors = ['#ffffff', '#1a1a2e', '#f5f0e1', '#0a0a0a', '#2d3436', '#dfe6e9'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const patch: Partial<CloudSettings> = {
      paletteIndex: randomPalette,
      fontFamily: randomFont,
      fontWeight: randomWeight,
      colorMode: randomColorMode,
      singleColor: randomColor,
      rotationMode: randomRotation,
      rotationProbability: Math.random() * 0.6 + 0.1,
      spiral: randomSpiral,
      bgColor: randomBg,
      padding: Math.floor(Math.random() * 8) + 1,
      scaleMode: ['linear', 'sqrt', 'log'][Math.floor(Math.random() * 3)] as CloudSettings['scaleMode'],
    };

    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setTimeout(() => generate(next), 50);
      return next;
    });
    setSidebarOpen(false);
  }, [generate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sidebarOpen]);

  return (
    <div className="app">
      {/* Mobile-only top header */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <div className="mobile-brand-icon">
            <CloudIcon size={16} />
          </div>
          <span className="mobile-header-title">WordCloud Studio</span>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sticky sidebar header (desktop) */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <CloudIcon size={16} />
            </div>
            <span className="brand-name">WordCloud Studio</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Scrollable control panel */}
        <div className="sidebar-body">
          <ControlPanel
            settings={settings}
            onChange={handleChange}
            onGenerate={handleGenerate}
            onRandomize={handleRandomize}
            generating={generating}
            stats={stats}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>
      </aside>

      {/* Main canvas area */}
      <main className="main">
        <div className="canvas-wrapper">
          <div className="canvas-container">
            {words.length === 0 && !generating && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M26 11.5a7 7 0 00-13.56-2.33A5.5 5.5 0 106 20.5h20a4.5 4.5 0 000-9z" fill="currentColor" opacity="0.15"/>
                    <path d="M26 11.5a7 7 0 00-13.56-2.33A5.5 5.5 0 106 20.5h20a4.5 4.5 0 000-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M13 26l3-4 3 4M16 22v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2>WordCloud Studio</h2>
                <p>
                  Create beautiful word clouds.<br />
                  Paste text, customize the design, and export.
                </p>
                <div className="empty-state-actions">
                  {settings.text.trim() ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerate}
                      aria-label="Generate Word Cloud"
                    >
                      Generate
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSidebarOpen(true);
                        setTimeout(() => {
                          document.getElementById('source-text-input')?.focus();
                        }, 50);
                      }}
                      aria-label="Open settings to add text"
                    >
                      Add text to begin
                    </button>
                  )}
                </div>
              </div>
            )}
            {generating && (
              <div className="loading-overlay">
                <div className="spinner" />
                <span>Generating…</span>
              </div>
            )}
            <WordCloudCanvas ref={canvasRef} words={words} settings={settings} />
          </div>

          <ExportBar canvasRef={canvasRef} showToast={showToast} hasWords={words.length > 0} />
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        className={`mobile-menu-toggle ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close settings' : 'Open settings'}
      >
        <div className="menu-icon">
          <span />
          <span />
          <span />
        </div>
      </button>

      {/* Toast */}
      <div
        className={`toast toast-${toast.type} ${toast.visible ? 'toast-visible' : ''}`}
        role="alert"
        aria-live="assertive"
      >
        {toast.message}
      </div>
    </div>
  );
}

export default App;

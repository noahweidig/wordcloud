import { useState, useRef, useCallback, useEffect } from 'react';
import type { CloudSettings } from './types';
import { DEFAULT_SETTINGS, FONT_FAMILIES, FONT_WEIGHTS } from './types';
import { PALETTES } from './utils/palettes';
import { useWordCloud } from './hooks/useWordCloud';
import ControlPanel from './components/ControlPanel';
import WordCloudCanvas, { type CanvasHandle } from './components/WordCloudCanvas';
import ExportBar from './components/ExportBar';
import { Cloud, Sun, Moon, Menu, X } from 'lucide-react';
import './App.css';

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

  // ⚡ Bolt Optimization:
  // Stabilized the onError callback to prevent ControlPanel's React.memo from breaking
  // when App re-renders (e.g. on sidebar toggles or when the words array updates).
  const handleError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);

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
            <Cloud size={18} aria-hidden="true" />
          </div>
          <span className="mobile-header-title">WordCloud Studio</span>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
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
              <Cloud size={18} aria-hidden="true" />
            </div>
            <span className="brand-name">WordCloud Studio</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
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
            onError={handleError}
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
                  <Cloud size={32} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h2>WordCloud Studio</h2>
                <p>
                  Visualize themes in your text.<br />
                  {settings.text.trim() ? 'Click Generate to begin.' : 'Add text to start.'}
                </p>
                <div className="empty-state-actions button-row">
                  {settings.text.trim() ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerate}
                      aria-label="Generate"
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
                      Add Text
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
        style={{ overflow: 'visible' }}
      >
        {sidebarOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        {!sidebarOpen && <span className="notification-badge" aria-hidden="true" />}
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

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CloudSettings } from './types';
import { DEFAULT_SETTINGS, FONT_FAMILIES, FONT_WEIGHTS } from './types';
import { PALETTES } from './utils/palettes';
import { useWordCloud } from './hooks/useWordCloud';
import ControlPanel from './components/ControlPanel';
import WordCloudCanvas, { type CanvasHandle } from './components/WordCloudCanvas';
import ExportBar from './components/ExportBar';
import './App.css';

// Simple cloud SVG icon for the mobile header logo
function CloudIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <path
        d="M17.5 6.5a4.5 4.5 0 00-8.74-1.5A3.5 3.5 0 104.5 12H17a3 3 0 000-6 2.99 2.99 0 00-.5.04z"
        fill="currentColor"
      />
    </svg>
  );
}

// Sample text for demo
const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Technology innovation software development programming code algorithm data structure machine learning artificial intelligence neural network deep learning natural language processing computer vision cloud computing web development frontend backend database server client API framework library component function variable object class interface type module package import export async await promise callback event loop thread process memory stack heap queue array linked list hash map tree graph binary search sort merge quick heap insertion selection bubble algorithm complexity time space optimal efficient scalable distributed parallel concurrent asynchronous synchronous reactive functional object oriented procedural declarative imperative paradigm pattern design architecture microservice monolith container orchestration deployment continuous integration delivery testing unit integration end to end performance security authentication authorization encryption protocol HTTP REST GraphQL WebSocket TCP UDP DNS SSL TLS certificate domain server client request response header body status code middleware router controller model view template engine render component state props lifecycle hook effect context reducer store action dispatch subscribe provider consumer middleware thunk saga observable stream pipe filter map reduce transform aggregate query mutation subscription schema resolver directive fragment union interface enum scalar input type field argument default value validation pagination cursor offset limit sort order ascending descending filter search index cache invalidation refresh token session cookie storage local session indexed database query optimization join relationship foreign key primary key unique constraint index trigger stored procedure transaction rollback commit isolation level consistency durability availability partition tolerance consensus replication sharding cluster node leader follower election heartbeat timeout retry circuit breaker rate limit throttle backpressure buffer overflow memory leak garbage collection reference counting mark sweep compact generation nursery survivor tenure`;

// Toast notification types
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

  // Apply dark mode to document
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

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sidebarOpen]);

  return (
    <div className="app">
      {/* Mobile-only top header */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <CloudIcon />
          <span className="mobile-header-title">WordCloud Studio</span>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <ControlPanel
          settings={settings}
          onChange={handleChange}
          onGenerate={handleGenerate}
          onRandomize={handleRandomize}
          generating={generating}
          stats={stats}
          darkMode={darkMode}
          onToggleDark={toggleDarkMode}
        />
      </div>

      <div className="main">
        <div className="canvas-container">
          {words.length === 0 && !generating && (
            <div className="empty-state">
              <p>Paste or upload text, then click <b>Generate</b> to create your word cloud.</p>
            </div>
          )}
          {generating && (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Generating word cloud...</span>
            </div>
          )}
          <WordCloudCanvas ref={canvasRef} words={words} settings={settings} />
        </div>
        <ExportBar canvasRef={canvasRef} showToast={showToast} />
      </div>

      {/* Mobile menu toggle */}
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

      {/* Toast notification */}
      <div className={`toast toast-${toast.type} ${toast.visible ? 'toast-visible' : ''}`} role="alert" aria-live="assertive">
        {toast.message}
      </div>
    </div>
  );
}

export default App;

import { useState, useRef, useCallback } from 'react';
import type { CloudSettings } from './types';
import { DEFAULT_SETTINGS, FONT_FAMILIES, FONT_WEIGHTS } from './types';
import { PALETTES } from './utils/palettes';
import { useWordCloud } from './hooks/useWordCloud';
import ControlPanel from './components/ControlPanel';
import WordCloudCanvas, { type CanvasHandle } from './components/WordCloudCanvas';
import ExportBar from './components/ExportBar';
import './App.css';

// Sample text for demo
const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Technology innovation software development programming code algorithm data structure machine learning artificial intelligence neural network deep learning natural language processing computer vision cloud computing web development frontend backend database server client API framework library component function variable object class interface type module package import export async await promise callback event loop thread process memory stack heap queue array linked list hash map tree graph binary search sort merge quick heap insertion selection bubble algorithm complexity time space optimal efficient scalable distributed parallel concurrent asynchronous synchronous reactive functional object oriented procedural declarative imperative paradigm pattern design architecture microservice monolith container orchestration deployment continuous integration delivery testing unit integration end to end performance security authentication authorization encryption protocol HTTP REST GraphQL WebSocket TCP UDP DNS SSL TLS certificate domain server client request response header body status code middleware router controller model view template engine render component state props lifecycle hook effect context reducer store action dispatch subscribe provider consumer middleware thunk saga observable stream pipe filter map reduce transform aggregate query mutation subscription schema resolver directive fragment union interface enum scalar input type field argument default value validation pagination cursor offset limit sort order ascending descending filter search index cache invalidation refresh token session cookie storage local session indexed database query optimization join relationship foreign key primary key unique constraint index trigger stored procedure transaction rollback commit isolation level consistency durability availability partition tolerance consensus replication sharding cluster node leader follower election heartbeat timeout retry circuit breaker rate limit throttle backpressure buffer overflow memory leak garbage collection reference counting mark sweep compact generation nursery survivor tenure`;

function App() {
  const [settings, setSettings] = useState<CloudSettings>({
    ...DEFAULT_SETTINGS,
    text: SAMPLE_TEXT,
  });
  const { words, generating, stats, generate } = useWordCloud();
  const canvasRef = useRef<CanvasHandle>(null);

  const handleChange = useCallback((patch: Partial<CloudSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleGenerate = useCallback(() => {
    generate(settings);
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
      // Auto-generate after randomize
      setTimeout(() => generate(next), 50);
      return next;
    });
  }, [generate]);

  return (
    <div className="app">
      <div className="sidebar">
        <ControlPanel
          settings={settings}
          onChange={handleChange}
          onGenerate={handleGenerate}
          onRandomize={handleRandomize}
          generating={generating}
          stats={stats}
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
        <ExportBar canvasRef={canvasRef} />
      </div>
    </div>
  );
}

export default App;

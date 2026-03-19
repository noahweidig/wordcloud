import type { CanvasHandle } from './WordCloudCanvas';

interface Props {
  canvasRef: React.RefObject<CanvasHandle | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hasWords: boolean;
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1v7M3 5.5L6 8.5l3-3M1 10h10"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="6" height="6" rx="1"/>
      <path d="M7.5 4.5V3A1.5 1.5 0 006 1.5H3A1.5 1.5 0 001.5 3v3A1.5 1.5 0 003 7.5h1.5"/>
    </svg>
  );
}

export default function ExportBar({ canvasRef, showToast, hasWords }: Props) {
  const downloadPNG = async (transparent: boolean) => {
    const blob = await canvasRef.current?.exportPNG(transparent);
    if (!blob) {
      showToast('Nothing to export yet. Generate a word cloud first.', 'error');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordcloud${transparent ? '-transparent' : ''}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('PNG downloaded!', 'success');
  };

  const copyToClipboard = async () => {
    const ok = await canvasRef.current?.copyToClipboard();
    if (ok) {
      showToast('Copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy. Try downloading instead.', 'error');
    }
  };

  const disabledTitle = hasWords ? undefined : 'Generate a word cloud first';

  return (
    <div className="export-bar">
      <span className="export-bar-label">Export</span>

      <button
        className={`btn btn-small ${hasWords ? 'export-primary' : ''}`}
        onClick={() => downloadPNG(false)}
        disabled={!hasWords}
        title={disabledTitle ?? 'Download PNG with background'}
        aria-label="Download PNG"
      >
        <DownloadIcon />
        PNG
      </button>

      <button
        className="btn btn-small"
        onClick={() => downloadPNG(true)}
        disabled={!hasWords}
        title={disabledTitle ?? 'Download PNG with transparent background'}
      >
        <DownloadIcon />
        Transparent
      </button>

      <button
        className="btn btn-small"
        onClick={copyToClipboard}
        disabled={!hasWords}
        title={disabledTitle ?? 'Copy image to clipboard'}
      >
        <CopyIcon />
        Copy
      </button>
    </div>
  );
}

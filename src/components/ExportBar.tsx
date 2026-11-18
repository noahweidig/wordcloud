import { memo } from 'react';
import { Download, Copy, ImageDown } from 'lucide-react';
import type { CanvasHandle } from './WordCloudCanvas';

interface Props {
  canvasRef: React.RefObject<CanvasHandle | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hasWords: boolean;
}

function ExportBar({ canvasRef, showToast, hasWords }: Props) {
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
    showToast('PNG exported!', 'success');
  };

  const copyToClipboard = async () => {
    const ok = await canvasRef.current?.copyToClipboard();
    if (ok) {
      showToast('Copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy. Try exporting instead.', 'error');
    }
  };

  const disabledTitle = hasWords ? undefined : 'Generate a word cloud first';

  return (
    <div className="export-bar">
      <span className="export-bar-label">Export</span>

      <button
        className={`btn btn-small ${hasWords ? 'export-primary has-badge' : ''}`}
        onClick={() => downloadPNG(false)}
        disabled={!hasWords}
        title={disabledTitle ?? 'Export PNG with background'}
        aria-label={hasWords ? 'Export PNG – ready' : 'Export PNG'}
      >
        <Download size={14} aria-hidden="true" />
        PNG
        {hasWords && <span className="notification-badge" aria-hidden="true" />}
      </button>

      <button
        className="btn btn-small"
        onClick={() => downloadPNG(true)}
        disabled={!hasWords}
        title={disabledTitle ?? 'Export PNG with transparent background'}
      >
        <ImageDown size={14} aria-hidden="true" />
        Transparent
      </button>

      <button
        className={`btn btn-small ${hasWords ? 'btn-highlight btn-accent-ring' : ''}`}
        onClick={copyToClipboard}
        disabled={!hasWords}
        title={disabledTitle ?? 'Copy image to clipboard'}
        aria-label={hasWords ? 'Copy image – important quick share' : 'Copy image'}
      >
        <Copy size={14} aria-hidden="true" />
        Copy
      </button>
    </div>
  );
}

export default memo(ExportBar);

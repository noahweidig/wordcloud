import type { CanvasHandle } from './WordCloudCanvas';

interface Props {
  canvasRef: React.RefObject<CanvasHandle | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hasWords: boolean;
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
      showToast('Image copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy. Try downloading instead.', 'error');
    }
  };

  const title = hasWords ? undefined : 'Generate a word cloud first';

  return (
    <div className="export-bar">
      <button
        className="btn btn-small"
        onClick={() => downloadPNG(false)}
        disabled={!hasWords}
        title={title}
      >
        Download PNG
      </button>
      <button
        className="btn btn-small"
        onClick={() => downloadPNG(true)}
        disabled={!hasWords}
        title={title}
      >
        Download PNG (transparent)
      </button>
      <button
        className="btn btn-small"
        onClick={copyToClipboard}
        disabled={!hasWords}
        title={title}
      >
        Copy to clipboard
      </button>
    </div>
  );
}

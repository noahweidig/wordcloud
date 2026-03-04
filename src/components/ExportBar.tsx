import type { CanvasHandle } from './WordCloudCanvas';

interface Props {
  canvasRef: React.RefObject<CanvasHandle | null>;
}

export default function ExportBar({ canvasRef }: Props) {
  const downloadPNG = async (transparent: boolean) => {
    const blob = await canvasRef.current?.exportPNG(transparent);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordcloud${transparent ? '-transparent' : ''}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const ok = await canvasRef.current?.copyToClipboard();
    if (ok) {
      alert('Image copied to clipboard!');
    } else {
      alert('Failed to copy. Your browser may not support clipboard API.');
    }
  };

  return (
    <div className="export-bar">
      <button className="btn btn-small" onClick={() => downloadPNG(false)}>
        Download PNG
      </button>
      <button className="btn btn-small" onClick={() => downloadPNG(true)}>
        PNG (transparent)
      </button>
      <button className="btn btn-small" onClick={copyToClipboard}>
        Copy to clipboard
      </button>
    </div>
  );
}

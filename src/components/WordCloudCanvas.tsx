import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { PlacedWord } from '../hooks/useWordCloud';
import type { CloudSettings, MaskShape } from '../types';
import { drawBuiltInMask, loadCustomMask } from '../utils/masks';

interface Props {
  words: PlacedWord[];
  settings: CloudSettings;
}

export interface CanvasHandle {
  exportPNG: (transparent: boolean) => Promise<Blob | null>;
  copyToClipboard: () => Promise<boolean>;
}

const WordCloudCanvas = forwardRef<CanvasHandle, Props>(({ words, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract only properties that directly affect rendering to avoid unnecessary re-renders when other settings change.
  const { canvasWidth, canvasHeight, bgAlpha, bgColor, wordAlpha, maskShape, customMaskUrl } = settings;

  // Draw words onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const w = canvasWidth;
    const h = canvasHeight;
    canvas.width = w;
    canvas.height = h;

    // Background
    if (bgAlpha > 0) {
      ctx.globalAlpha = bgAlpha;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    const centerX = w / 2;
    const centerY = h / 2;

    ctx.globalAlpha = wordAlpha;

    for (const word of words) {
      ctx.save();
      ctx.translate(centerX + word.x, centerY + word.y);
      ctx.rotate((word.rotate * Math.PI) / 180);
      ctx.font = `${word.weight} ${word.size}px ${word.font}`;
      ctx.fillStyle = word.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word.text, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    // Apply mask clipping (post-render) for better visual result
    if (maskShape !== 'none') {
      applyMaskClip(canvas, maskShape, customMaskUrl);
    }
  }, [words, canvasWidth, canvasHeight, bgAlpha, bgColor, wordAlpha, maskShape, customMaskUrl]);

  useImperativeHandle(ref, () => ({
    async exportPNG(transparent: boolean): Promise<Blob | null> {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      if (transparent) {
        // Re-render without background
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = settings.canvasWidth;
        exportCanvas.height = settings.canvasHeight;
        const ctx = exportCanvas.getContext('2d')!;
        const centerX = settings.canvasWidth / 2;
        const centerY = settings.canvasHeight / 2;

        ctx.globalAlpha = settings.wordAlpha;
        for (const word of words) {
          ctx.save();
          ctx.translate(centerX + word.x, centerY + word.y);
          ctx.rotate((word.rotate * Math.PI) / 180);
          ctx.font = `${word.weight} ${word.size}px ${word.font}`;
          ctx.fillStyle = word.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(word.text, 0, 0);
          ctx.restore();
        }
        ctx.globalAlpha = 1;

        if (settings.maskShape !== 'none') {
          await applyMaskClip(exportCanvas, settings.maskShape, settings.customMaskUrl);
        }

        return new Promise((resolve) => exportCanvas.toBlob(resolve, 'image/png'));
      }

      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    },

    async copyToClipboard(): Promise<boolean> {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (!blob) return false;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return true;
      } catch {
        return false;
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Word cloud visualization with ${words.length} words`}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: 8,
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
      }}
    >
      Word cloud visualization with {words.length} words.
    </canvas>
  );
});

/**
 * Post-render mask clipping: make pixels outside the mask transparent.
 * Uses hardware-accelerated destination-in composite operation instead of manual pixel loop.
 */
async function applyMaskClip(canvas: HTMLCanvasElement, maskShape: MaskShape, customMaskUrl: string | null): Promise<void> {
  const w = canvas.width;
  const h = canvas.height;

  // Create mask canvas
  let maskCanvas: HTMLCanvasElement;

  if (maskShape === 'custom' && customMaskUrl) {
    try {
      maskCanvas = await loadCustomMask(customMaskUrl, w, h);
    } catch {
      return;
    }
  } else if (maskShape !== 'none' && maskShape !== 'custom') {
    maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mctx = maskCanvas.getContext('2d')!;
    drawBuiltInMask(mctx, maskShape as MaskShape, w, h);
  } else {
    return;
  }

  // Use GPU hardware-accelerated composite operation
  const ctx = canvas.getContext('2d')!;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; // Reset to default
}

WordCloudCanvas.displayName = 'WordCloudCanvas';
export default WordCloudCanvas;

import { useEffect, useRef, forwardRef, useImperativeHandle, memo } from 'react';
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

    if (words.length === 0) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

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
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ⚡ Bolt Optimization:
    // 1. Replaced save/restore with manual translation/rotation reversal to preserve existing
    //    transformation matrix (e.g. for high-DPI scaling) and reduce overall canvas API calls.
    // 2. Cached font and fillStyle to avoid redundant state assignments which cross
    //    the JS-to-C++ boundary in the browser, providing a significant speedup for large clouds.
    let lastFont = '';
    let lastColor = '';

    // Save state once before the loop to restore it afterwards
    ctx.save();
    for (const word of words) {
      const x = centerX + word.x;
      const y = centerY + word.y;
      const rot = (word.rotate * Math.PI) / 180;

      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);

      const font = `${word.weight} ${word.size}px ${word.font}`;
      if (font !== lastFont) {
        ctx.font = font;
        lastFont = font;
      }
      if (word.color !== lastColor) {
        ctx.fillStyle = word.color;
        lastColor = word.color;
      }

      ctx.fillText(word.text, 0, 0);

      // Reverse transform
      if (rot) ctx.rotate(-rot);
      ctx.translate(-x, -y);
    }
    // Restore state (font, fillStyle, etc.) after the loop
    ctx.restore();

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
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // ⚡ Bolt Optimization:
        // 1. Replaced save/restore with manual translation/rotation reversal.
        // 2. Cached font and fillStyle to minimize redundant state updates.
        let lastFont = '';
        let lastColor = '';

        ctx.save();
        for (const word of words) {
          const x = centerX + word.x;
          const y = centerY + word.y;
          const rot = (word.rotate * Math.PI) / 180;

          ctx.translate(x, y);
          if (rot) ctx.rotate(rot);

          const font = `${word.weight} ${word.size}px ${word.font}`;
          if (font !== lastFont) {
            ctx.font = font;
            lastFont = font;
          }
          if (word.color !== lastColor) {
            ctx.fillStyle = word.color;
            lastColor = word.color;
          }

          ctx.fillText(word.text, 0, 0);

          if (rot) ctx.rotate(-rot);
          ctx.translate(-x, -y);
        }
        ctx.restore();
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

export default memo(WordCloudCanvas, (prevProps, nextProps) => {
  // ⚡ Bolt Optimization:
  // Only re-render if words change or if specific visual settings change.
  // This prevents the expensive canvas component from re-rendering on every keystroke
  // when typing in the text area (which updates the `settings` object).
  if (prevProps.words !== nextProps.words) return false;

  const p = prevProps.settings;
  const n = nextProps.settings;

  return (
    p.canvasWidth === n.canvasWidth &&
    p.canvasHeight === n.canvasHeight &&
    p.bgAlpha === n.bgAlpha &&
    p.bgColor === n.bgColor &&
    p.wordAlpha === n.wordAlpha &&
    p.maskShape === n.maskShape &&
    p.customMaskUrl === n.customMaskUrl
  );
});

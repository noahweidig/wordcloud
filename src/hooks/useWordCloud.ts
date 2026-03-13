import { useCallback, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import type { CloudSettings } from '../types';
import { tokenize, countFrequencies, filterWords, scaleSize } from '../utils/text';
import { PALETTES, getPaletteColor } from '../utils/palettes';
import { drawBuiltInMask, getMaskData, loadCustomMask } from '../utils/masks';

interface D3Word {
  text?: string;
  font?: string;
  style?: string;
  weight?: string | number;
  rotate?: number;
  size?: number;
  padding?: number;
  x?: number;
  y?: number;
  // Custom properties added for our application
  color?: string;
  count?: number;
}

export interface PlacedWord {
  text: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  count: number;
  font: string;
  weight: string;
}

export interface CloudStats {
  totalWords: number;
  uniqueWords: number;
  wordsUsed: number;
}

export function useWordCloud() {
  const [words, setWords] = useState<PlacedWord[]>([]);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<CloudStats>({ totalWords: 0, uniqueWords: 0, wordsUsed: 0 });
  const abortRef = useRef<boolean>(false);

  const generate = useCallback(async (settings: CloudSettings) => {
    abortRef.current = true; // Cancel any in-flight generation
    await new Promise((r) => setTimeout(r, 10));
    abortRef.current = false;
    setGenerating(true);

    try {
      // Tokenize and count
      const tokens = tokenize(settings.text, {
        removeStopwords: settings.removeStopwords,
        customStopwords: settings.customStopwords.split(',').map((s) => s.trim()).filter(Boolean),
        lowercase: settings.lowercase,
        removeNumbers: settings.removeNumbers,
      });

      const freqs = countFrequencies(tokens);
      const filtered = filterWords(freqs, settings.minFrequency, settings.maxWords);

      setStats({
        totalWords: tokens.length,
        uniqueWords: freqs.length,
        wordsUsed: filtered.length,
      });

      if (filtered.length === 0) {
        setWords([]);
        setGenerating(false);
        return;
      }

      const maxCount = filtered[0].count;
      const palette = PALETTES[settings.paletteIndex] || PALETTES[0];

      // Compute colors for each word
      const getColor = (index: number, count: number): string => {
        switch (settings.colorMode) {
          case 'single':
            return settings.singleColor;
          case 'palette':
            return getPaletteColor(palette, index);
          case 'gradient': {
            // Map frequency to palette position
            const ratio = maxCount > 1 ? (count - 1) / (maxCount - 1) : 0;
            const pIdx = Math.floor(ratio * (palette.colors.length - 1));
            return palette.colors[pIdx];
          }
          case 'random':
            return palette.colors[Math.floor(Math.random() * palette.colors.length)];
          default:
            return '#333';
        }
      };

      // Compute rotation for each word
      const getRotation = (): number => {
        switch (settings.rotationMode) {
          case 'none':
            return 0;
          case 'random':
            if (Math.random() > settings.rotationProbability) return 0;
            return Math.floor(Math.random() * 61) - 30;
          case 'fixed':
            if (Math.random() > settings.rotationProbability) return 0;
            return Math.random() > 0.5 ? 0 : 90;
          case 'custom':
            if (Math.random() > settings.rotationProbability) return 0;
            return Math.floor(Math.random() * 61) - 30;
          default:
            return 0;
        }
      };

      // Prepare mask if needed
      let maskCanvas: HTMLCanvasElement | null = null;
      if (settings.maskShape !== 'none') {
        maskCanvas = document.createElement('canvas');
        maskCanvas.width = settings.canvasWidth;
        maskCanvas.height = settings.canvasHeight;

        if (settings.maskShape === 'custom' && settings.customMaskUrl) {
          try {
            maskCanvas = await loadCustomMask(
              settings.customMaskUrl,
              settings.canvasWidth,
              settings.canvasHeight
            );
          } catch {
            // Fall back to no mask
            maskCanvas = null;
          }
        } else if (settings.maskShape !== 'custom') {
          const ctx = maskCanvas.getContext('2d')!;
          drawBuiltInMask(ctx, settings.maskShape, settings.canvasWidth, settings.canvasHeight);
        }
      }

      // Build word list with sizes
      const wordData = filtered.map((w, i) => ({
        text: w.text,
        size: scaleSize(w.count, maxCount, settings.minFontSize, settings.maxFontSize, settings.scaleMode),
        color: getColor(i, w.count),
        count: w.count,
        rotation: getRotation(),
      }));

      // Run d3-cloud layout
      const placed = await new Promise<PlacedWord[]>((resolve) => {
        const layout = cloud()
          .size([settings.canvasWidth, settings.canvasHeight])
          .words(
            wordData.map((d) => ({
              text: d.text,
              size: d.size,
              color: d.color,
              count: d.count,
              rotate: d.rotation,
            }))
          )
          .padding(settings.padding)
          .rotate((d: D3Word) => d.rotate ?? 0)
          .font(settings.fontFamily)
          .fontWeight(settings.fontWeight)
          .fontSize((d: D3Word) => d.size ?? 16)
          .spiral(settings.spiral)
          .on('end', (output: D3Word[]) => {
            const result: PlacedWord[] = output.map((w: D3Word) => ({
              text: w.text!,
              size: w.size!,
              x: w.x!,
              y: w.y!,
              rotate: w.rotate ?? 0,
              color: w.color ?? '#333',
              count: w.count ?? 1,
              font: settings.fontFamily,
              weight: settings.fontWeight,
            }));
            resolve(result);
          });
        layout.start();
      });

      if (abortRef.current) return;

      // If mask is active, filter words that fall outside the mask
      if (maskCanvas) {
        const maskData = getMaskData(maskCanvas);
        const w = settings.canvasWidth;
        const h = settings.canvasHeight;
        const centerX = w / 2;
        const centerY = h / 2;

        const maskedWords = placed.filter((word) => {
          // Check if word center is inside mask
          const px = Math.round(word.x + centerX);
          const py = Math.round(word.y + centerY);
          if (px < 0 || px >= w || py < 0 || py >= h) return false;
          return maskData[py * w + px];
        });

        setWords(maskedWords);
      } else {
        setWords(placed);
      }
    } finally {
      if (!abortRef.current) {
        setGenerating(false);
      }
    }
  }, []);

  return { words, generating, stats, generate };
}

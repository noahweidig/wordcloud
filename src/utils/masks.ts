import type { MaskShape } from '../types';

/**
 * Draw a built-in mask shape onto a canvas context.
 * Fills the shape area with white on a transparent background.
 */
export function drawBuiltInMask(
  ctx: CanvasRenderingContext2D,
  shape: MaskShape,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 10;

  switch (shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'heart':
      drawHeart(ctx, cx, cy, r);
      break;

    case 'star':
      drawStar(ctx, cx, cy, r, 5);
      break;

    case 'speech-bubble':
      drawSpeechBubble(ctx, cx, cy, r);
      break;

    case 'cloud':
      drawCloudShape(ctx, cx, cy, r);
      break;
  }
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): void {
  const s = size * 0.9;
  ctx.beginPath();
  // Heart using bezier curves
  const topY = cy - s * 0.4;
  ctx.moveTo(cx, cy + s * 0.7);
  // Left side
  ctx.bezierCurveTo(
    cx - s * 1.2, cy, cx - s * 1.2, topY - s * 0.3,
    cx, topY
  );
  // Right side
  ctx.bezierCurveTo(
    cx + s * 1.2, topY - s * 0.3, cx + s * 1.2, cy,
    cx, cy + s * 0.7
  );
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  points: number
): void {
  const inner = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  const w = r * 1.6;
  const h = r * 1.1;
  const cornerR = r * 0.3;
  const tailH = r * 0.3;

  // Rounded rectangle body
  const x = cx - w;
  const y = cy - h;
  const bw = w * 2;
  const bh = h * 1.7;

  ctx.beginPath();
  ctx.moveTo(x + cornerR, y);
  ctx.lineTo(x + bw - cornerR, y);
  ctx.quadraticCurveTo(x + bw, y, x + bw, y + cornerR);
  ctx.lineTo(x + bw, y + bh - cornerR);
  ctx.quadraticCurveTo(x + bw, y + bh, x + bw - cornerR, y + bh);
  // Tail
  ctx.lineTo(x + bw * 0.35, y + bh);
  ctx.lineTo(x + bw * 0.15, y + bh + tailH);
  ctx.lineTo(x + bw * 0.2, y + bh);
  ctx.lineTo(x + cornerR, y + bh);
  ctx.quadraticCurveTo(x, y + bh, x, y + bh - cornerR);
  ctx.lineTo(x, y + cornerR);
  ctx.quadraticCurveTo(x, y, x + cornerR, y);
  ctx.closePath();
  ctx.fill();
}

function drawCloudShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  ctx.beginPath();
  // Cloud made of overlapping circles
  const circles = [
    { x: 0, y: 0, s: 0.7 },
    { x: -0.6, y: 0.1, s: 0.5 },
    { x: 0.6, y: 0.1, s: 0.55 },
    { x: -0.3, y: -0.35, s: 0.45 },
    { x: 0.3, y: -0.35, s: 0.5 },
    { x: -0.85, y: 0.3, s: 0.35 },
    { x: 0.85, y: 0.3, s: 0.35 },
    { x: 0, y: 0.35, s: 0.45 },
  ];
  for (const c of circles) {
    ctx.moveTo(cx + c.x * r + c.s * r, cy + c.y * r);
    ctx.arc(cx + c.x * r, cy + c.y * r, c.s * r, 0, Math.PI * 2);
  }
  ctx.fill();
}

/**
 * Create a mask bitmap (Uint8Array) from a canvas.
 * Returns an array where 1 = word can be placed there.
 * Using Uint8Array instead of boolean[] for better performance and memory efficiency.
 */
export function getMaskData(
  canvas: HTMLCanvasElement
): Uint8Array {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const mask = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0; i < mask.length; i++) {
    // Check alpha channel - pixel is "inside" mask if alpha > 128
    mask[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  }
  return mask;
}

/**
 * Load a custom PNG mask image and draw it onto a canvas.
 */
export function loadCustomMask(
  url: string,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent canvas tainting for cross-origin images
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

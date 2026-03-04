/**
 * Built-in color palettes for the word cloud.
 */
export interface Palette {
  name: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  {
    name: 'Ocean',
    colors: ['#0077b6', '#00b4d8', '#90e0ef', '#023e8a', '#48cae4'],
  },
  {
    name: 'Sunset',
    colors: ['#ff6b6b', '#ffa06b', '#ffd93d', '#ff8a5c', '#ea5455'],
  },
  {
    name: 'Forest',
    colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
  },
  {
    name: 'Neon',
    colors: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
  },
  {
    name: 'Earth',
    colors: ['#6b4226', '#a0522d', '#cd853f', '#deb887', '#8b7355'],
  },
  {
    name: 'Candy',
    colors: ['#ff6f91', '#ff9671', '#ffc75f', '#f9f871', '#d65db1'],
  },
  {
    name: 'Monochrome',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
  },
  {
    name: 'Pastel',
    colors: ['#a8dadc', '#f1faee', '#457b9d', '#e63946', '#1d3557'],
  },
  {
    name: 'Warm',
    colors: ['#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307'],
  },
  {
    name: 'Cool',
    colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
  },
];

/** Get a color from a palette by index (wraps around) */
export function getPaletteColor(palette: Palette, index: number): string {
  return palette.colors[index % palette.colors.length];
}

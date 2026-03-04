export type ScaleMode = 'linear' | 'sqrt' | 'log';
export type SpiralType = 'archimedean' | 'rectangular';
export type RotationMode = 'none' | 'random' | 'fixed' | 'custom';
export type ColorMode = 'single' | 'palette' | 'gradient' | 'random';
export type MaskShape = 'none' | 'circle' | 'heart' | 'star' | 'speech-bubble' | 'cloud' | 'custom';
export type PresetName = 'minimal' | 'vibrant' | 'poster';

export interface CloudSettings {
  // Input
  text: string;
  removeStopwords: boolean;
  customStopwords: string;
  lowercase: boolean;
  removeNumbers: boolean;

  // Weighting
  minFrequency: number;
  maxWords: number;
  scaleMode: ScaleMode;

  // Appearance
  canvasWidth: number;
  canvasHeight: number;
  bgColor: string;
  bgAlpha: number;
  fontFamily: string;
  fontWeight: string;
  spiral: SpiralType;

  // Rotation
  rotationMode: RotationMode;
  rotationProbability: number;

  // Color
  colorMode: ColorMode;
  singleColor: string;
  paletteIndex: number;

  // Advanced
  wordAlpha: number;
  padding: number;

  // Mask
  maskShape: MaskShape;
  customMaskUrl: string | null;

  // Font size range
  minFontSize: number;
  maxFontSize: number;
}

export const DEFAULT_SETTINGS: CloudSettings = {
  text: '',
  removeStopwords: true,
  customStopwords: '',
  lowercase: true,
  removeNumbers: true,
  minFrequency: 1,
  maxWords: 200,
  scaleMode: 'sqrt',
  canvasWidth: 800,
  canvasHeight: 600,
  bgColor: '#ffffff',
  bgAlpha: 1,
  fontFamily: 'Arial',
  fontWeight: '700',
  spiral: 'archimedean',
  rotationMode: 'random',
  rotationProbability: 0.3,
  colorMode: 'palette',
  singleColor: '#333333',
  paletteIndex: 0,
  wordAlpha: 1,
  padding: 2,
  maskShape: 'none',
  customMaskUrl: null,
  minFontSize: 12,
  maxFontSize: 80,
};

export const PRESETS: Record<PresetName, Partial<CloudSettings>> = {
  minimal: {
    bgColor: '#ffffff',
    bgAlpha: 1,
    fontFamily: 'Helvetica',
    fontWeight: '300',
    colorMode: 'single',
    singleColor: '#333333',
    rotationMode: 'none',
    padding: 4,
    scaleMode: 'sqrt',
    maxWords: 100,
  },
  vibrant: {
    bgColor: '#1a1a2e',
    bgAlpha: 1,
    fontFamily: 'Impact',
    fontWeight: '700',
    colorMode: 'random',
    paletteIndex: 3, // Neon
    rotationMode: 'random',
    rotationProbability: 0.4,
    padding: 2,
    scaleMode: 'sqrt',
    maxWords: 250,
  },
  poster: {
    bgColor: '#f5f0e1',
    bgAlpha: 1,
    fontFamily: 'Georgia',
    fontWeight: '700',
    colorMode: 'gradient',
    paletteIndex: 8, // Warm
    rotationMode: 'fixed',
    padding: 3,
    scaleMode: 'log',
    maxWords: 150,
  },
};

export const CANVAS_PRESETS = [
  { label: '800 x 600', w: 800, h: 600 },
  { label: '1024 x 768', w: 1024, h: 768 },
  { label: '1200 x 800', w: 1200, h: 800 },
  { label: '1920 x 1080', w: 1920, h: 1080 },
  { label: 'Square 800', w: 800, h: 800 },
  { label: 'Custom', w: 0, h: 0 },
];

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Palatino',
];

export const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

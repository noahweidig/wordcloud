import { STOPWORDS } from './stopwords';

export interface TokenOptions {
  removeStopwords: boolean;
  customStopwords: string[];
  lowercase: boolean;
  removeNumbers: boolean;
}

export interface WordFrequency {
  text: string;
  count: number;
}

/**
 * Tokenize raw text into individual words.
 * Splits on whitespace and punctuation, optionally removes numbers.
 */
export function tokenize(text: string, options: TokenOptions): string[] {
  // Split on non-word characters (whitespace, punctuation)
  let tokens = text.split(/[^\w']+/).filter(Boolean);

  if (options.lowercase) {
    tokens = tokens.map((t) => t.toLowerCase());
  }

  if (options.removeNumbers) {
    tokens = tokens.filter((t) => !/^\d+$/.test(t));
  }

  if (options.removeStopwords) {
    const customSet = new Set(
      options.customStopwords.map((w) => w.trim().toLowerCase()).filter(Boolean)
    );
    tokens = tokens.filter((t) => {
      const lower = t.toLowerCase();
      return !STOPWORDS.has(lower) && !customSet.has(lower);
    });
  } else if (options.customStopwords.length > 0) {
    // Even if default stopwords are off, still remove custom ones
    const customSet = new Set(
      options.customStopwords.map((w) => w.trim().toLowerCase()).filter(Boolean)
    );
    tokens = tokens.filter((t) => !customSet.has(t.toLowerCase()));
  }

  // Remove very short tokens (single characters except "I")
  tokens = tokens.filter((t) => t.length > 1 || t.toLowerCase() === 'i');

  return tokens;
}

/**
 * Count word frequencies from an array of tokens.
 * Returns sorted by frequency descending.
 */
export function countFrequencies(tokens: string[]): WordFrequency[] {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Apply frequency thresholds and limits to word list.
 */
export function filterWords(
  words: WordFrequency[],
  minFreq: number,
  maxWords: number
): WordFrequency[] {
  return words.filter((w) => w.count >= minFreq).slice(0, maxWords);
}

/**
 * Scale word sizes based on frequency.
 */
export function scaleSize(
  count: number,
  maxCount: number,
  minSize: number,
  maxSize: number,
  mode: 'linear' | 'sqrt' | 'log'
): number {
  if (maxCount <= 1) return (minSize + maxSize) / 2;
  const ratio = (count - 1) / (maxCount - 1);
  let scaled: number;
  switch (mode) {
    case 'sqrt':
      scaled = Math.sqrt(ratio);
      break;
    case 'log':
      scaled = Math.log2(1 + ratio) / Math.log2(2);
      break;
    default:
      scaled = ratio;
  }
  return minSize + scaled * (maxSize - minSize);
}

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
  // Use match to avoid creating empty string elements and filter(Boolean)
  // Replaces 6 sequential array iterations with a single loop
  const matches = text.match(/[\w']+/g);
  if (!matches) return [];

  const customSet = new Set(
    options.customStopwords.map((w: string) => w.trim().toLowerCase()).filter(Boolean)
  );

  const result: string[] = [];
  const { lowercase, removeNumbers, removeStopwords } = options;
  const numRegex = /^\d+$/;

  for (let i = 0; i < matches.length; i++) {
    let t = matches[i];

    if (lowercase) {
      t = t.toLowerCase();
    }

    if (removeNumbers && numRegex.test(t)) {
      continue;
    }

    const lower = lowercase ? t : t.toLowerCase();

    if (removeStopwords) {
      if (STOPWORDS.has(lower) || customSet.has(lower)) {
        continue;
      }
    } else if (customSet.has(lower)) {
      continue;
    }

    if (t.length <= 1 && lower !== 'i') {
      continue;
    }

    result.push(t);
  }

  return result;
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
  // ⚡ Bolt Optimization:
  // Replaced `words.filter().slice()` with a single for loop.
  // This avoids creating a large intermediate array and allows early exit
  // when maxWords is reached, reducing complexity from O(N) to O(min(N, maxWords)).
  const result: WordFrequency[] = [];
  for (let i = 0; i < words.length; i++) {
    if (result.length >= maxWords) break;
    if (words[i].count >= minFreq) {
      result.push(words[i]);
    }
  }
  return result;
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

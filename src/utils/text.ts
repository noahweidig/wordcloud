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
  // ⚡ Bolt Optimization:
  // Using exec avoids creating a massive array of all matches in memory at once
  // via string.match(). This significantly reduces garbage collection overhead
  // and memory usage for large texts. Lowercasing upfront simplifies later checks.
  const regex = /[\w']+/g;
  const customSet = new Set(
    options.customStopwords.map((w: string) => w.trim().toLowerCase()).filter(Boolean)
  );

  const result: string[] = [];
  const { lowercase, removeNumbers, removeStopwords } = options;
  const numRegex = /^\d+$/;
  const hasCustom = customSet.size > 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const t = match[0];

    // Lowercasing upfront simplifies later checks and reduces redundant operations
    const lower = t.toLowerCase();

    // Faster number check using regex test
    if (removeNumbers && numRegex.test(t)) {
        continue;
    }

    if (removeStopwords && STOPWORDS.has(lower)) {
        continue;
    }

    if (hasCustom && customSet.has(lower)) {
        continue;
    }

    if (t.length <= 1 && lower !== 'i') {
      continue;
    }

    // Push the appropriate case based on options
    result.push(lowercase ? lower : t);
  }

  return result;
}

/**
 * Count word frequencies from an array of tokens.
 * Returns sorted by frequency descending.
 */
export function countFrequencies(tokens: string[]): WordFrequency[] {
  // ⚡ Bolt Optimization:
  // 1. Used pre-allocated array based on Map size instead of Array.from().map()
  //    to reduce intermediate array allocations.
  // 2. Used undefined check instead of logical OR for map lookups.
  // 3. Replaced for..of with standard for loop.
  const freq = new Map<string, number>();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const current = freq.get(token);
    freq.set(token, current === undefined ? 1 : current + 1);
  }

  const result = new Array<WordFrequency>(freq.size);
  let index = 0;
  for (const [text, count] of freq.entries()) {
    result[index++] = { text, count };
  }

  return result.sort((a, b) => b.count - a.count);
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

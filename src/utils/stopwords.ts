/**
 * Common English stopwords for filtering out low-value words from word clouds.
 */
export const STOPWORDS = new Set([
  // Articles & determiners
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  // Pronouns
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom',
  // Prepositions
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once',
  // Conjunctions
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
  'too', 'very',
  // Verbs (common)
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'can', 'could',
  // Misc
  'here', 'there', 'when', 'where', 'why', 'how',
  'if', 'because', 'as', 'until', 'while',
  'just', 'also', 'now', 'even', 'well', 'back',
  'still', 'already', 'since', 'much', 'many',
  // Contractions (lowercased parts)
  't', 's', 've', 'd', 'll', 're', 'don', 'doesn', 'didn',
  'won', 'wouldn', 'shouldn', 'couldn', 'isn', 'aren', 'wasn',
  'weren', 'hasn', 'haven', 'hadn',
]);

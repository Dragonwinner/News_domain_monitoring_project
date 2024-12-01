export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function filterWords(text: string): string[] {
  const words = text.split(' ');
  const uniqueWords = [...new Set(words)];
  
  return uniqueWords.filter(word => {
    // Allow alphanumeric characters and hyphens, but ensure it doesn't start or end with a hyphen
    const isValid = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(word) || /^[a-z0-9]$/.test(word);
    const isNotCommon = !commonWords.includes(word);
    const hasValidLength = word.length >= 3;
    const hasNoConsecutiveHyphens = !word.includes('--');
    return isValid && isNotCommon && hasValidLength && hasNoConsecutiveHyphens;
  });
}

export const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are'
];
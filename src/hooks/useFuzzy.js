import { useComputed } from '@preact/signals';

function fuzzyMatch(pattern, text) {
  if (!pattern) return { score: 0, matches: [] };

  pattern = pattern.toLowerCase();
  text = text.toLowerCase();

  let patternIdx = 0;
  let textIdx = 0;
  const matches = [];
  let score = 0;
  let consecutiveMatches = 0;

  while (patternIdx < pattern.length && textIdx < text.length) {
    const patternChar = pattern[patternIdx];
    const textChar = text[textIdx];

    if (patternChar === textChar) {
      matches.push(textIdx);
      score += 1 + consecutiveMatches;
      consecutiveMatches++;
      patternIdx++;
    } else {
      consecutiveMatches = 0;
    }
    textIdx++;
  }

  if (patternIdx !== pattern.length) {
    return null;
  }

  matches.forEach(idx => {
    if (idx === 0 || text[idx - 1] === ' ' || text[idx - 1] === '-' || text[idx - 1] === '/') {
      score += 2;
    }
  });

  score -= (text.length - pattern.length) * 0.1;

  return { score, matches };
}

export function useFuzzy(itemsSignal, querySignal, keys = ['title', 'url']) {
  return useComputed(() => {
    const items = itemsSignal.value;
    const query = querySignal.value;

    if (!query) return items.map(tab => ({
      tab,
      match: { score: 0, matches: [] },
      matchedIn: null
    }));

    return items.map(item => {
      const tab = item;
      const titleMatch = fuzzyMatch(query, tab.title || '');
      const urlMatch = fuzzyMatch(query, tab.url || '');

      let match, matchedIn;

      if (urlMatch) {
        match = { ...urlMatch, score: urlMatch.score * 1.5 };
        matchedIn = 'url';
      } else if (titleMatch) {
        match = titleMatch;
        matchedIn = 'title';
      } else {
        return null;
      }

      if (urlMatch && titleMatch) {
        const boostedUrlScore = urlMatch.score * 1.5;
        if (boostedUrlScore < titleMatch.score) {
          match = titleMatch;
          matchedIn = 'title';
        }
      }

      return { tab, match, matchedIn };
    })
    .filter(Boolean)
    .sort((a, b) => b.match.score - a.match.score);
  });
}

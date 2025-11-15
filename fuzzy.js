/**
 * Optimized fuzzy search algorithm
 * Returns match score and highlighted positions
 */
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

  // All pattern characters must be found
  if (patternIdx !== pattern.length) {
    return null;
  }

  // Bonus for matches at word boundaries
  matches.forEach(idx => {
    if (idx === 0 || text[idx - 1] === ' ' || text[idx - 1] === '-' || text[idx - 1] === '/') {
      score += 2;
    }
  });

  // Penalty for length difference
  score -= (text.length - pattern.length) * 0.1;

  return { score, matches };
}

/**
 * Search tabs with fuzzy matching
 */
function fuzzySearch(tabs, query) {
  if (!query) return tabs;

  const results = tabs
    .map(tab => {
      const titleMatch = fuzzyMatch(query, tab.title || '');
      const urlMatch = fuzzyMatch(query, tab.url || '');

      // Prioritize URL over title
      let match, matchedIn;

      if (urlMatch) {
        // Give URL matches a significant boost
        match = { ...urlMatch, score: urlMatch.score * 1.5 };
        matchedIn = 'url';
      } else if (titleMatch) {
        match = titleMatch;
        matchedIn = 'title';
      } else {
        return null;
      }

      // If both match, still use URL with boosted score
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

  return results;
}

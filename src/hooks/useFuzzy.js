import { useComputed } from "@preact/signals";

const formatUrl = (url) => {
  try {
    const { hostname, pathname, search } = new URL(url);
    return `${hostname}${pathname}${search}`;
  } catch {
    return url;
  }
};

const SEPARATORS = new Set([" ", "-", "/", ".", "_"]);

function calculateScore(matches, text) {
  let score = 0;
  let consecutive = 0;

  for (let i = 0; i < matches.length; i++) {
    const idx = matches[i];
    score += 10;

    if (i > 0 && idx === matches[i - 1] + 1) {
      consecutive++;
      score += consecutive * 5;
    } else {
      consecutive = 0;
    }

    if (idx === 0 || SEPARATORS.has(text[idx - 1])) {
      score += 15;
    }
  }

  return score;
}

function fuzzyMatch(pattern, text) {
  if (!pattern) return { score: 0, matches: [] };

  const p = pattern.toLowerCase();
  const t = text.toLowerCase();

  const substringIdx = t.indexOf(p);
  if (substringIdx !== -1) {
    const matches = Array.from(
      { length: p.length },
      (_, i) => substringIdx + i,
    );
    let score = calculateScore(matches, t);
    score += 20;
    score -= (t.length - p.length) * 0.01;
    return { score, matches };
  }

  const memo = new Map();

  function findBest(pIdx, tIdx) {
    const key = `${pIdx}:${tIdx}`;
    if (memo.has(key)) return memo.get(key);

    if (pIdx === p.length) return { score: 0, matches: [] };
    if (tIdx >= t.length) return null;

    const char = p[pIdx];
    let best = null;

    for (let i = tIdx; i < t.length; i++) {
      if (t[i] === char) {
        const result = findBest(pIdx + 1, i + 1);
        if (result) {
          const matches = [i, ...result.matches];
          const score = calculateScore(matches, t);

          if (!best || score > best.score) {
            best = { score, matches };
          }
        }
      }
    }

    memo.set(key, best);
    return best;
  }

  const result = findBest(0, 0);

  if (!result) return null;

  return {
    ...result,
    score: result.score - (t.length - p.length) * 0.01,
  };
}

export function useFuzzy(itemsSignal, querySignal) {
  return useComputed(() => {
    const items = itemsSignal.value;
    const query = querySignal.value;

    if (!query) {
      return items.map((tab) => ({
        tab,
        score: 0,
        titleMatch: null,
        urlMatch: null,
        displayUrl: formatUrl(tab.url || ""),
      }));
    }

    return items
      .map((tab) => {
        const displayUrl = formatUrl(tab.url || "");
        const titleMatch = fuzzyMatch(query, tab.title || "");
        const urlMatch = fuzzyMatch(query, displayUrl);

        if (!titleMatch && !urlMatch) return null;

        const urlScore = (urlMatch?.score || 0) * 1.5;
        const titleScore = titleMatch?.score || 0;

        return {
          tab,
          score: Math.max(urlScore, titleScore),
          titleMatch,
          urlMatch,
          displayUrl,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  });
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function highlightText(text, matches) {
  if (!matches || matches.length === 0) return escapeHtml(text);

  let result = '';
  let lastIndex = 0;

  matches.forEach(index => {
    result += escapeHtml(text.slice(lastIndex, index));
    result += `<span class="text-[#4ec9b0] font-semibold">${escapeHtml(text[index])}</span>`;
    lastIndex = index + 1;
  });

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

export function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

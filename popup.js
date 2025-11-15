let allTabs = [];
let filteredResults = [];
let selectedIndex = 0;

const searchInput = document.getElementById('search');
const resultsContainer = document.getElementById('results');

// Initialize
(async function init() {
  // Get all tabs from current window
  const window = await chrome.windows.getCurrent();
  allTabs = await chrome.tabs.query({ windowId: window.id });

  // Focus search input
  searchInput.focus();

  // Initial render
  renderResults();
})();

// Search input handler
searchInput.addEventListener('input', (e) => {
  selectedIndex = 0;
  renderResults();
});

// Keyboard navigation
searchInput.addEventListener('keydown', async (e) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
      renderResults();
      scrollToSelected();
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderResults();
      scrollToSelected();
      break;

    case 'Tab':
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: navigate up
        selectedIndex = Math.max(selectedIndex - 1, 0);
      } else {
        // Tab: navigate down
        selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
      }
      renderResults();
      scrollToSelected();
      break;

    case 'Enter':
      e.preventDefault();
      await switchToSelectedTab();
      break;

    case 'Escape':
      window.close();
      break;

    case 'Delete':
    case 'Backspace':
      // Only close tab if input is empty or modifier key is pressed
      if (e.key === 'Delete' || (e.key === 'Backspace' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        await closeSelectedTab();
      }
      break;
  }
});

// Render results
function renderResults() {
  const query = searchInput.value.trim();

  if (!query) {
    filteredResults = allTabs.map(tab => ({ tab, match: { score: 0, matches: [] }, matchedIn: 'title' }));
  } else {
    filteredResults = fuzzySearch(allTabs, query);
  }

  if (filteredResults.length === 0) {
    resultsContainer.innerHTML = '<div class="empty-state">No tabs found</div>';
    adjustPopupHeight(1);
    return;
  }

  resultsContainer.innerHTML = filteredResults
    .map((result, index) => {
      const { tab, match, matchedIn } = result;
      const isSelected = index === selectedIndex;

      return `
        <div class="tab-item ${isSelected ? 'selected' : ''}" data-index="${index}">
          <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}" alt="">
          <div class="tab-info">
            <div class="tab-title">${highlightText(tab.title || 'Untitled', matchedIn === 'title' ? match.matches : [])}</div>
            <div class="tab-url">${highlightText(formatUrl(tab.url), matchedIn === 'url' ? match.matches : [])}</div>
          </div>
        </div>
      `;
    })
    .join('');

  // Add click handlers
  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', async () => {
      selectedIndex = parseInt(item.dataset.index);
      await switchToSelectedTab();
    });

    item.addEventListener('mouseenter', () => {
      selectedIndex = parseInt(item.dataset.index);
      renderResults();
    });
  });

  // Adjust popup height based on results
  adjustPopupHeight(filteredResults.length);
}

// Adjust popup height dynamically
function adjustPopupHeight(resultCount) {
  const searchHeight = 49; // Input height + border
  const itemHeight = 61; // Approximate height per item
  const maxItems = 8; // Maximum items to show before scrolling
  const emptyStateHeight = 120; // Height for empty state

  const visibleItems = Math.min(resultCount, maxItems);
  const contentHeight = resultCount === 0 ? emptyStateHeight : (visibleItems * itemHeight);
  const totalHeight = searchHeight + contentHeight;

  document.body.style.height = `${totalHeight}px`;
}

// Highlight matched characters
function highlightText(text, matches) {
  if (!matches || matches.length === 0) return escapeHtml(text);

  let result = '';
  let lastIndex = 0;

  matches.forEach(index => {
    result += escapeHtml(text.slice(lastIndex, index));
    result += `<span class="highlight">${escapeHtml(text[index])}</span>`;
    lastIndex = index + 1;
  });

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

// Format URL for display
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Switch to selected tab
async function switchToSelectedTab() {
  if (filteredResults.length === 0) return;

  const result = filteredResults[selectedIndex];
  if (!result) return;

  try {
    await chrome.tabs.update(result.tab.id, { active: true });
    window.close();
  } catch (error) {
    console.error('Failed to switch tab:', error);
    // Tab might have been closed, refresh list
    allTabs = await chrome.tabs.query({ windowId: (await chrome.windows.getCurrent()).id });
    renderResults();
  }
}

// Close selected tab
async function closeSelectedTab() {
  if (filteredResults.length === 0) return;

  const result = filteredResults[selectedIndex];
  if (!result) return;

  try {
    await chrome.tabs.remove(result.tab.id);

    // Remove from arrays
    allTabs = allTabs.filter(tab => tab.id !== result.tab.id);
    filteredResults.splice(selectedIndex, 1);

    // Adjust selection
    if (selectedIndex >= filteredResults.length) {
      selectedIndex = Math.max(0, filteredResults.length - 1);
    }

    renderResults();

    // Close popup if no tabs left
    if (allTabs.length === 0) {
      window.close();
    }
  } catch (error) {
    console.error('Failed to close tab:', error);
  }
}

// Scroll to selected item
function scrollToSelected() {
  const selectedItem = resultsContainer.querySelector('.tab-item.selected');
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

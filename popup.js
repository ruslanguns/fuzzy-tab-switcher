const state = {
  allTabs: [],
  filteredResults: [],
  selectedIndex: 0,
  tabAccessHistory: {},
};

const elements = {
  search: document.getElementById('search'),
  results: document.getElementById('results'),
};

const CONFIG = {
  MAX_VISIBLE_ITEMS: 8,
  SEARCH_HEIGHT: 49,
  ITEM_HEIGHT: 61,
  EMPTY_STATE_HEIGHT: 120,
};

async function init() {
  await loadTabAccessHistory();
  await loadAllTabs();
  elements.search.focus();
  renderResults();
}

async function loadTabAccessHistory() {
  const data = await chrome.storage.local.get('tabAccessHistory');
  state.tabAccessHistory = data.tabAccessHistory || {};
}

async function saveTabAccessHistory() {
  await chrome.storage.local.set({ tabAccessHistory: state.tabAccessHistory });
}

async function loadAllTabs() {
  state.allTabs = await chrome.tabs.query({});
  cleanupTabAccessHistory();
}

function cleanupTabAccessHistory() {
  const validTabIds = new Set(state.allTabs.map(tab => tab.id));
  const cleaned = {};

  for (const [tabId, timestamp] of Object.entries(state.tabAccessHistory)) {
    if (validTabIds.has(parseInt(tabId))) {
      cleaned[tabId] = timestamp;
    }
  }

  state.tabAccessHistory = cleaned;
}

async function recordTabAccess(tabId) {
  state.tabAccessHistory[tabId] = Date.now();
  await saveTabAccessHistory();
}

elements.search.addEventListener('input', () => {
  state.selectedIndex = 0;
  renderResults();
});

elements.search.addEventListener('keydown', async (e) => {
  const handlers = {
    ArrowDown: () => navigateDown(),
    ArrowUp: () => navigateUp(),
    Tab: () => (e.shiftKey ? navigateUp() : navigateDown()),
    Enter: () => switchToSelectedTab(),
    Escape: () => window.close(),
    Delete: () => closeSelectedTab(),
    Backspace: () => (e.metaKey || e.ctrlKey) && closeSelectedTab(),
  };

  const handler = handlers[e.key];
  if (handler) {
    e.preventDefault();
    await handler();
  }
});

function navigateDown() {
  state.selectedIndex = Math.min(
    state.selectedIndex + 1,
    state.filteredResults.length - 1
  );
  renderResults();
  scrollToSelected();
}

function navigateUp() {
  state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
  renderResults();
  scrollToSelected();
}

function renderResults() {
  const query = elements.search.value.trim();

  if (!query) {
    state.filteredResults = sortByMRU(state.allTabs);
  } else {
    state.filteredResults = fuzzySearch(state.allTabs, query);
  }

  if (state.filteredResults.length === 0) {
    renderEmptyState();
    return;
  }

  renderTabItems();
  adjustPopupHeight(state.filteredResults.length);
}

function sortByMRU(tabs) {
  return tabs
    .map(tab => ({
      tab,
      match: { score: 0, matches: [] },
      matchedIn: 'title',
      lastAccess: state.tabAccessHistory[tab.id] || 0,
    }))
    .sort((a, b) => {
      if (a.tab.active) return -1;
      if (b.tab.active) return 1;
      return b.lastAccess - a.lastAccess;
    });
}

function renderEmptyState(message = 'No tabs found') {
  elements.results.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  adjustPopupHeight(1);
}

function renderTabItems() {
  elements.results.innerHTML = state.filteredResults
    .map((result, index) => {
      const { tab, match, matchedIn } = result;
      const isSelected = index === state.selectedIndex;
      const audioIndicator = tab.audible ? ' 🔊' : '';

      return `
        <div class="tab-item ${isSelected ? 'selected' : ''}" data-index="${index}">
          <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}" alt="">
          <div class="tab-info">
            <div class="tab-title">${highlightText(tab.title || 'Untitled', matchedIn === 'title' ? match.matches : [])}${audioIndicator}</div>
            <div class="tab-url">${highlightText(formatUrl(tab.url), matchedIn === 'url' ? match.matches : [])}</div>
          </div>
        </div>
      `;
    })
    .join('');

  attachTabItemListeners();
}

function attachTabItemListeners() {
  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', async () => {
      state.selectedIndex = parseInt(item.dataset.index);
      await switchToSelectedTab();
    });

    item.addEventListener('mouseenter', () => {
      const newIndex = parseInt(item.dataset.index);
      if (state.selectedIndex !== newIndex) {
        state.selectedIndex = newIndex;
        updateSelectedClass();
      }
    });
  });
}

function updateSelectedClass() {
  document.querySelectorAll('.tab-item').forEach((item, index) => {
    if (index === state.selectedIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function adjustPopupHeight(resultCount) {
  const visibleItems = Math.min(resultCount, CONFIG.MAX_VISIBLE_ITEMS);
  const contentHeight = resultCount === 0
    ? CONFIG.EMPTY_STATE_HEIGHT
    : visibleItems * CONFIG.ITEM_HEIGHT;
  const totalHeight = CONFIG.SEARCH_HEIGHT + contentHeight;

  document.body.style.height = `${totalHeight}px`;
}

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

function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function switchToSelectedTab() {
  if (state.filteredResults.length === 0) return;

  const result = state.filteredResults[state.selectedIndex];
  if (!result) return;

  try {
    const { tab } = result;

    if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    await chrome.tabs.update(tab.id, { active: true });
    await recordTabAccess(tab.id);
    window.close();
  } catch (error) {
    console.error('Failed to switch tab:', error);
    await loadAllTabs();
    renderResults();
  }
}

async function closeSelectedTab() {
  if (state.filteredResults.length === 0) return;

  const result = state.filteredResults[state.selectedIndex];
  if (!result) return;

  try {
    await chrome.tabs.remove(result.tab.id);

    state.allTabs = state.allTabs.filter(tab => tab.id !== result.tab.id);
    state.filteredResults.splice(state.selectedIndex, 1);

    if (state.selectedIndex >= state.filteredResults.length) {
      state.selectedIndex = Math.max(0, state.filteredResults.length - 1);
    }

    delete state.tabAccessHistory[result.tab.id];
    await saveTabAccessHistory();

    renderResults();

    if (state.allTabs.length === 0) {
      window.close();
    }
  } catch (error) {
    console.error('Failed to close tab:', error);
  }
}

function scrollToSelected() {
  const selectedItem = elements.results.querySelector('.tab-item.selected');
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

init();

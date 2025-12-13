chrome.runtime.onInstalled.addListener(() => {
  console.log('Fuzzy Tab Switcher installed');
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  const key = 'fts_tab_history';
  chrome.storage.local.get(key, (storage) => {
    const history = storage[key] || {};
    history[activeInfo.tabId] = Date.now();
    chrome.storage.local.set({ [key]: history });
  });
});

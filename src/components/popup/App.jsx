import { useState, useEffect, useRef } from 'preact/hooks';
import { fuzzySearch } from '../../utils/fuzzy';
import { TabList } from './TabList';
import { Search } from './Search';

export function App() {
  const [allTabs, setAllTabs] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabAccessHistory, setTabAccessHistory] = useState({});
  const searchRef = useRef(null);

  useEffect(() => {
    async function init() {
      const data = await chrome.storage.local.get('tabAccessHistory');
      const history = data.tabAccessHistory || {};
      setTabAccessHistory(history);

      const tabs = await chrome.tabs.query({});
      setAllTabs(tabs);

      cleanupHistory(tabs, history);
      searchRef.current?.focus();
    }
    init();
  }, []);

  function cleanupHistory(tabs, history) {
    const validTabIds = new Set(tabs.map(tab => tab.id));
    const cleaned = {};

    for (const [tabId, timestamp] of Object.entries(history)) {
      if (validTabIds.has(parseInt(tabId))) {
        cleaned[tabId] = timestamp;
      }
    }

    if (Object.keys(cleaned).length !== Object.keys(history).length) {
      chrome.storage.local.set({ tabAccessHistory: cleaned });
      setTabAccessHistory(cleaned);
    }
  }

  const filteredResults = query
    ? fuzzySearch(allTabs, query)
    : sortByMRU(allTabs, tabAccessHistory);

  function sortByMRU(tabs, history) {
    return tabs
      .map(tab => ({
        tab,
        match: { score: 0, matches: [] },
        matchedIn: 'title',
        lastAccess: history[tab.id] || 0,
      }))
      .sort((a, b) => {
        if (a.tab.active) return -1;
        if (b.tab.active) return 1;
        return b.lastAccess - a.lastAccess;
      });
  }

  async function recordTabAccess(tabId) {
    const newHistory = { ...tabAccessHistory, [tabId]: Date.now() };
    setTabAccessHistory(newHistory);
    await chrome.storage.local.set({ tabAccessHistory: newHistory });
  }

  async function switchToTab(index) {
    if (filteredResults.length === 0 || !filteredResults[index]) return;

    const { tab } = filteredResults[index];

    try {
      if (tab.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }

      await chrome.tabs.update(tab.id, { active: true });
      await recordTabAccess(tab.id);
      window.close();
    } catch (error) {
      console.error('Failed to switch tab:', error);
      const tabs = await chrome.tabs.query({});
      setAllTabs(tabs);
    }
  }

  async function closeTab(index) {
    if (filteredResults.length === 0 || !filteredResults[index]) return;

    const { tab } = filteredResults[index];

    try {
      await chrome.tabs.remove(tab.id);

      const newTabs = allTabs.filter(t => t.id !== tab.id);
      setAllTabs(newTabs);

      const newHistory = { ...tabAccessHistory };
      delete newHistory[tab.id];
      setTabAccessHistory(newHistory);
      await chrome.storage.local.set({ tabAccessHistory: newHistory });

      if (selectedIndex >= filteredResults.length - 1) {
        setSelectedIndex(Math.max(0, filteredResults.length - 2));
      }

      if (newTabs.length === 0) {
        window.close();
      }
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  }

  function handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else {
          setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        switchToTab(selectedIndex);
        break;
      case 'Escape':
        window.close();
        break;
      case 'Delete':
        e.preventDefault();
        closeTab(selectedIndex);
        break;
      case 'Backspace':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          closeTab(selectedIndex);
        }
        break;
    }
  }

  return (
    <div class="flex flex-col bg-[#1e1e1e] text-[#d4d4d4] min-h-screen">
      <Search
        ref={searchRef}
        value={query}
        onInput={e => {
          setQuery(e.target.value);
          setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDown}
      />
      <TabList
        results={filteredResults}
        selectedIndex={selectedIndex}
        onSelect={switchToTab}
        onHover={setSelectedIndex}
      />
    </div>
  );
}

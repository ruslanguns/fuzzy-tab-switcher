import browser from "webextension-polyfill";
import {
  STORAGE_KEY_HISTORY,
  STORAGE_KEY_TOGGLE,
  CMD_QUICK_SWITCH,
} from "./constants";

const getToggleHistory = async () => {
  const data = await browser.storage.local.get(STORAGE_KEY_TOGGLE);
  return data[STORAGE_KEY_TOGGLE] || {};
};

const setToggleHistory = async (history) => {
  await browser.storage.local.set({ [STORAGE_KEY_TOGGLE]: history });
};

const updateTimestampHistory = async (tabId) => {
  const data = await browser.storage.local.get(STORAGE_KEY_HISTORY);
  const history = data[STORAGE_KEY_HISTORY] || {};
  history[tabId] = Date.now();
  await browser.storage.local.set({ [STORAGE_KEY_HISTORY]: history });
};

browser.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  const allToggleHistory = await getToggleHistory();
  const toggleHistory = allToggleHistory[windowId] || {
    current: null,
    previous: null,
  };

  if (toggleHistory.current !== tabId) {
    toggleHistory.previous = toggleHistory.current;
    toggleHistory.current = tabId;
    allToggleHistory[windowId] = toggleHistory;
    await setToggleHistory(allToggleHistory);
  }

  await updateTimestampHistory(tabId);
});

browser.windows.onRemoved.addListener(async (windowId) => {
  const allHistory = await getToggleHistory();
  delete allHistory[windowId];
  await setToggleHistory(allHistory);
});

browser.tabs.onRemoved.addListener(
  async (tabId, { windowId, isWindowClosing }) => {
    if (isWindowClosing) return;

    const allHistory = await getToggleHistory();
    const history = allHistory[windowId];
    if (!history) return;

    if (history.current === tabId) history.current = null;
    if (history.previous === tabId) history.previous = null;
    await setToggleHistory(allHistory);
  },
);

browser.commands.onCommand.addListener(async (command) => {
  if (command !== CMD_QUICK_SWITCH) return;

  try {
    const window = await browser.windows.getLastFocused();
    const allHistory = await getToggleHistory();
    const history = allHistory[window.id];

    if (!history?.previous) return;

    try {
      await browser.tabs.update(history.previous, { active: true });
    } catch (tabError) {
      console.warn("Previous tab no longer exists, cleaning up history");
      history.previous = null;
      await setToggleHistory(allHistory);
    }
  } catch (error) {
    console.error("Quick-switch error:", error);
  }
});

import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import browser from "webextension-polyfill";
import { useFuzzy } from "./useFuzzy";

export function useTabs(query, historySignal) {
  const tabs = useSignal([]);
  const currentWindowId = useSignal(null);
  const isLoading = useSignal(true);

  const refresh = async () => {
    const [allTabs, win] = await Promise.all([
      browser.tabs.query({}),
      browser.windows.getCurrent(),
    ]);

    currentWindowId.value = win.id;

    tabs.value = allTabs.map((t) => ({
      ...t,
      isInCurrentWindow: t.windowId === win.id,
    }));
    isLoading.value = false;
  };

  const fuzzyResults = useFuzzy(tabs, query);

  const filteredResults = useComputed(() => {
    const results = fuzzyResults.value;

    return results
      .map((result) => ({
        ...result,
        lastAccess: historySignal.value[result.tab.id] || 0,
      }))
      .sort(
        (a, b) => b.score - a.score || b.lastAccess - a.lastAccess,
      );
  });

  useEffect(() => {
    refresh();

    const update = () => refresh();
    if (browser.tabs) {
      browser.tabs.onCreated.addListener(update);
      browser.tabs.onUpdated.addListener(update);
      browser.tabs.onRemoved.addListener(update);
    }

    return () => {
      if (browser.tabs) {
        browser.tabs.onCreated.removeListener(update);
        browser.tabs.onUpdated.removeListener(update);
        browser.tabs.onRemoved.removeListener(update);
      }
    };
  }, []);

  return {
    tabs,
    currentWindowId,
    isLoading,
    filteredResults,
    refresh,
  };
}

import { useSignal, useSignalEffect } from "@preact/signals";
import browser from "webextension-polyfill";
import { STORAGE_KEY_HISTORY } from "../constants";

const STORAGE_KEY = STORAGE_KEY_HISTORY;
const CLEANUP_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function useHistory() {
  const history = useSignal({});

  useSignalEffect(() => {
    const load = async () => {
      const data = await browser.storage.local.get(STORAGE_KEY);
      let loadedHistory = data[STORAGE_KEY] || {};

      const now = Date.now();
      const cleaned = Object.entries(loadedHistory)
        .filter(([_, timestamp]) => now - timestamp < CLEANUP_THRESHOLD_MS)
        .reduce((acc, [id, ts]) => ({ ...acc, [id]: ts }), {});

      if (Object.keys(loadedHistory).length !== Object.keys(cleaned).length) {
        await browser.storage.local.set({ [STORAGE_KEY]: cleaned });
        loadedHistory = cleaned;
      }

      history.value = loadedHistory;
    };
    load();
  });

  const recordAccess = async (tabId) => {
    const newHistory = { ...history.value, [tabId]: Date.now() };
    history.value = newHistory;
    await browser.storage.local.set({ [STORAGE_KEY]: newHistory });
  };

  return {
    history,
    recordAccess,
  };
}

import { useSignal, useSignalEffect } from "@preact/signals";
import browser from "webextension-polyfill";

export function CommandHelp({ theme, onToggleTheme }) {
  const isMac = useSignal(false);

  useSignalEffect(() => {
    browser.runtime.getPlatformInfo().then((info) => {
      isMac.value = info.os === "mac";
    });
  });

  return (
    <div class="flex items-center justify-between border-t border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground select-none">
      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2"
          title="Global shortcut to toggle extension"
        >
          <span class="flex items-center gap-1">
            <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span class="text-xs">{isMac.value ? "⌥" : "Alt"}</span>
            </kbd>
            <span class="text-xs">+</span>
            <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span class="text-xs">K</span>
            </kbd>
          </span>
          <span>Open/Close</span>
        </div>
        <div
          class="flex items-center gap-2"
          title="Switch to previously active tab"
        >
          <span class="flex items-center gap-1">
            <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span class="text-xs">{isMac.value ? "⌥" : "Alt"}</span>
            </kbd>
            <span class="text-xs">+</span>
            <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span class="text-xs">Q</span>
            </kbd>
          </span>
          <span>Switch back</span>
        </div>
      </div>

      <button
        onClick={onToggleTheme}
        class="flex items-center gap-2 transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
        title={`Switch Theme: ${theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light"}`}
      >
        {theme === "light" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        )}
        {theme === "dark" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
        {theme === "system" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
            <line x1="2" x2="22" y1="20" y2="20" />
          </svg>
        )}
      </button>
    </div>
  );
}

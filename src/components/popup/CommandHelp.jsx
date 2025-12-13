import { useSignal, useSignalEffect } from "@preact/signals";
import browser from "webextension-polyfill";

export function CommandHelp({ theme, onToggleTheme }) {
  const isMac = useSignal(false);

  useSignalEffect(() => {
    browser.runtime.getPlatformInfo().then((info) => {
      isMac.value = info.os === "mac";
    });
  });

  const commands = [
    {
      label: "Navigate",
      detail: "Use Up/Down arrows to move selection",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="8 18 12 22 16 18" />
          <polyline points="8 6 12 2 16 6" />
          <line x1="12" x2="12" y1="2" y2="22" />
        </svg>
      ),
    },
    {
      label: "Select",
      detail: "Press Enter to switch to tab",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 10 4 15 9 20" />
          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
      ),
    },
    {
      label: "Theme",
      detail: `Current: ${theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light"}. Click to toggle`,
      onClick: onToggleTheme,
      icon: (
        <>
          {theme === "light" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
              width="16"
              height="16"
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
              width="16"
              height="16"
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
        </>
      ),
    },
  ];

  return (
    <div class="flex items-center justify-between border-t border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground select-none">
      <div class="flex items-center gap-4">
        {commands.map((cmd, index) => (
          <div
            key={cmd.label}
            class={`flex items-center gap-1.5 ${cmd.onClick ? "cursor-pointer transition-colors hover:text-foreground" : "cursor-default"}`}
            onClick={cmd.onClick}
            title={cmd.detail}
          >
            {cmd.icon}
            <span>{cmd.label}</span>
          </div>
        ))}
      </div>
      <div
        class="flex cursor-default items-center gap-1"
        title="Global shortcut to toggle extension"
      >
        <span class="text-sm font-semibold">{isMac.value ? "Opt" : "Alt"}</span>
        <span>+</span>
        <span class="text-sm font-semibold">K</span>
      </div>
    </div>
  );
}

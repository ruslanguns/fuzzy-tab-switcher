import { useSignal, useSignalEffect } from "@preact/signals";
import browser from "webextension-polyfill";

const MODIFIER_SYMBOLS = {
  Alt: "⌥",
  Command: "⌘",
  Shift: "⇧",
  Ctrl: "⌃",
};

const MODIFIER_ORDER = ["⇧", "⌘", "⌥", "⌃"];

function parseShortcutKeys(shortcut, isMac) {
  if (!shortcut) return [];

  if (shortcut.includes("+")) {
    return shortcut.split("+").map((key) => {
      return isMac && MODIFIER_SYMBOLS[key] ? MODIFIER_SYMBOLS[key] : key;
    });
  }

  const keys = [];
  let remaining = shortcut;

  while (remaining) {
    const modifier = MODIFIER_ORDER.find((mod) => remaining.startsWith(mod));
    if (modifier) {
      keys.push(modifier);
      remaining = remaining.slice(modifier.length);
    } else {
      keys.push(remaining);
      break;
    }
  }

  return keys;
}

function ShortcutKeys({ shortcut, isMac, prefix }) {
  const keys = parseShortcutKeys(shortcut, isMac);

  return (
    <>
      {keys.map((key, index) => (
        <>
          <kbd
            key={`${prefix}-${index}`}
            class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono opacity-100"
          >
            <span>{key}</span>
          </kbd>
          {index < keys.length - 1 && (
            <span key={`${prefix}-plus-${index}`}>+</span>
          )}
        </>
      ))}
    </>
  );
}

function ThemeIcon({ theme }) {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  if (theme === "light") {
    return (
      <svg {...iconProps}>
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
    );
  }

  if (theme === "dark") {
    return (
      <svg {...iconProps}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
      <line x1="2" x2="22" y1="20" y2="20" />
    </svg>
  );
}

export function CommandHelp({ theme, onToggleTheme }) {
  const isMac = useSignal(false);
  const shortcuts = useSignal({
    toggle: "Alt+K",
    quickSwitch: "Alt+Q",
  });

  useSignalEffect(() => {
    browser.runtime.getPlatformInfo().then((info) => {
      isMac.value = info.os === "mac";
    });

    browser.commands.getAll().then((commands) => {
      const newShortcuts = {};

      commands.forEach((command) => {
        if (command.name === "_execute_action" && command.shortcut) {
          newShortcuts.toggle = command.shortcut;
        } else if (command.name === "quick-switch" && command.shortcut) {
          newShortcuts.quickSwitch = command.shortcut;
        }
      });

      if (Object.keys(newShortcuts).length > 0) {
        shortcuts.value = { ...shortcuts.value, ...newShortcuts };
      }
    });
  });

  const themeLabel =
    theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light";

  return (
    <div class="flex flex-col">
      <div class="flex w-full items-center justify-between border-t border-border bg-secondary/50 px-3 py-2 font-mono text-[10px] text-muted-foreground select-none">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center gap-2"
            title="Global shortcut to toggle extension"
          >
            <span class="flex items-center gap-1">
              <ShortcutKeys
                shortcut={shortcuts.value.toggle}
                isMac={isMac.value}
                prefix="toggle"
              />
            </span>
            <span>Open/Close</span>
          </div>

          <div
            class="flex items-center gap-2"
            title="Switch to previously active tab"
          >
            <span class="flex items-center gap-1">
              <ShortcutKeys
                shortcut={shortcuts.value.quickSwitch}
                isMac={isMac.value}
                prefix="quick"
              />
            </span>
            <span>Switch back</span>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          class="flex items-center gap-2 transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
          title={`Switch Theme: ${themeLabel}`}
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div class="flex w-full justify-center border-t border-border py-2">
        <span class="text-xs text-muted-foreground/80">
          Crafted by{" "}
          <a
            href="https://x.com/ruslangonzalez"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-foreground"
          >
            Ruslan Gonzalez
          </a>
        </span>
      </div>
    </div>
  );
}

# Fuzzy Tab Switcher

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast and powerful Chrome/Brave extension for searching and switching between open tabs using fuzzy search.

## Features

- **Fuzzy Search** - Search tabs by title and URL with intelligent matching
- **Full Keyboard Navigation** - Navigate entirely without a mouse
- **Cross-Window Search** - Search tabs across all browser windows
- **MRU Sorting** - Most Recently Used tabs appear first when no search query
- **Quick Tab Closing** - Close tabs directly from the search interface
- **Audio Indicator** - Visual indicator for tabs playing audio (🔊)
- **Zero Dependencies** - Pure vanilla JavaScript
- **Manifest V3** - Latest Chrome extension standard
- **Persistent History** - Remembers your most used tabs

## Installation

1. Open `chrome://extensions/` (or `brave://extensions/`)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder

## Usage

### Keyboard Shortcuts
- **Cmd+Shift+K** (Mac) / **Ctrl+Shift+K** (Windows/Linux) - Open tab switcher
- **↑/↓** or **Tab/Shift+Tab** - Navigate through results
- **Enter** - Switch to selected tab
- **Escape** - Close switcher
- **Delete** or **Cmd+Backspace** - Close selected tab
- **Customize shortcut:** `chrome://extensions/shortcuts`

### Search Examples
- `gh is` → GitHub Issues
- `tw` → Twitter
- `gm` → Gmail
- `localhost:3000` → Local development servers

## How It Works

### Search Across All Windows
Unlike most tab switchers, this extension searches tabs in **all open windows**, not just the current one. When you switch to a tab in another window, that window automatically comes to focus.

### MRU (Most Recently Used)
When you open the switcher without typing a search query, tabs are sorted by:
1. Active tab first
2. Recently accessed tabs (based on your usage history)
3. Other tabs

This makes it extremely fast to switch between your most frequently used tabs.

### Intelligent Fuzzy Matching
The fuzzy search algorithm:
- Matches characters in order, but not necessarily consecutively
- Gives bonus points to matches at word boundaries
- Prioritizes URL matches over title matches (1.5x boost)
- Highlights matched characters

## Architecture

```
├── manifest.json       # Extension configuration
├── popup.html         # Search interface
├── popup.css          # Styling
├── popup.js           # Main application logic
├── fuzzy.js           # Fuzzy search algorithm
└── background.js      # Service worker
```

### Key Technologies
- Chrome Extensions API (Manifest V3)
- Chrome Storage API (for MRU history)
- Vanilla JavaScript (no frameworks)
- Modern ES6+ syntax

## Privacy

All data stays local:
- Tab access history is stored locally using `chrome.storage.local`
- No data is sent to any server
- No analytics or tracking

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Ruslan Gonzalez**
- Email: ruslanguns@gmail.com
- GitHub: [@ruslanguns](https://github.com/ruslanguns)

---

Made with ❤️ by RusGunx

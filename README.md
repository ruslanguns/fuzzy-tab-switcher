# Fuzzy Tab Switcher

A high-performance tab switcher focused on speed and keyboard navigation. Replaces the default browser tab cycling with a fuzzy search interface that searches across all open windows.

## Core Logic & Features

- **Intelligent Fuzzy Search**: Custom scoring algorithm that matches against both Title and URL (`Title` vs `URL` weighting). Prioritizes sequential matches and word boundaries.
- **Cross-Window Context**: Queries `browser.tabs` globally, allowing seamless switching effectively treating the entire browser session as a single workspace.
- **Smart Sorting**:
  1. **Visual Order**: Defaults to natural matching browser tab order when query is empty.
  2. **MRU**: Sorts by "Last Access Time" (Most Recently Used) when searching.
- **Privacy**: Zero external requests. All history state is persisted in `browser.storage.local`.

## Technical Stack

Built with a modern, compile-to-JS toolchain for performance and maintainability:

- **State Management**: Preact Signals for fine-grained reactivity.
- **UI Framework**: Preact (lightweight React alternative).
- **Styling**: Tailwind CSS (bundled via Vite).
- **Build System**: Vite.

## Development & Build

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

### Build Steps

1. Clone the repository:

```bash
git clone https://github.com/ruslanguns/fuzzy-tab-switcher.git
cd fuzzy-tab-switcher
```

2. Install dependencies:

```bash
npm install
```

3. Build for your target browser (outputs to `dist/`):

- **Chrome / Brave / Edge**:

```bash
npm run build:chrome
```

- **Firefox**:

  ```bash
  npm run build:firefox
  ```

- **Safari**:

  ```bash
  npm run build:safari
  ```

## Installation (Developer Mode)

> **Note**: These instructions are for loading the extension locally for development or testing.

### Chromium Browsers (Chrome, Brave, Edge, Opera)

1. Run `npm run build:chrome`.
2. Navigate to `chrome://extensions`.
3. Enable **Developer Mode** (toggle in top-right).
4. Click **Load unpacked**.
5. Select the `dist` directory.

### Firefox

> **Warning**: "Temporary Add-ons" are removed when you restart Firefox.

1. Run `npm run build:firefox`.
2. Navigate to `about:debugging`.
3. Click **This Firefox** in the sidebar.
4. Click **Load Temporary Add-on...**.
5. Navigate to the `dist` folder and select the `manifest.json` file.

### Safari (macOS)

1. Run `npm run build:safari`.
2. Convert the extension:

   ```bash
   xcrun safari-web-extension-converter dist
   ```

3. Follow the on-screen prompts to build and run via Xcode.

## Usage

| Shortcut                | Action                                |
| :---------------------- | :------------------------------------ |
| **Alt+K**               | **Open Tab Switcher**                 |
| **Tab** / **Shift+Tab** | Navigate selection                    |
| **Alt+Q**               | Switch to previous tab (Quick Switch) |
| **Enter**               | Switch to tab                         |

## License

MIT

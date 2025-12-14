# v1.1.1 (2025-12-14)

## 📝 Documentation

- docs: update changelog for v1.1.1

## 🏗️ Chores

- chore: Add Husky pre-push hook for Firefox build and linting
- chore: Use package.json version for zip filename and ignore generated zip files
- chore: workaround to complain with Firefox
- chore: update safari manifest Compliance Audit



# v1.1.0 (2025-12-14)

## ✨ Features

- feat: add dynamic Safari shortcuts with Command key support

## 🏗️ Chores

- chore: centralize versioning from package.json as source of truth

# v1.0.0 (2025-12-13)

## ✨ Features

- feat: Add release packaging scripts, privacy policy, and promotional assets.
- feat: Add author credit to README and command help, and reorder search UI text.
- feat: display explicit keyboard shortcuts in command help and add select hint to search input.
- feat: reimplement fuzzy matching algorithm with substring optimization
- feat: Replace custom tooltips with native browser tooltips and update cursor styles.
- feat: Implement animated search placeholder, reduce popup width, and refine overall UI spacing and typography.
- feat: Configure build process to output browser-specific builds into distinct directories.
- feat: Add theme switching functionality and command help component
- feat: Implement target-specific manifest building for multi-browser support
- feat: add description for browser action in manifest.json
- feat: Implement quick switch command and refactor background script for robust tab history management.
- feat: implement background history tracking for true MRU
- feat: just general improvements to make it more consistent and removing anti patterns
- feat: migrate to Preact and improving performance and accesibility
- feat: add cross-window search and MRU sorting
- feat: adjustment of height to be dynamic

## 🐛 Bug Fixes

- fix: Added logic to ignore mouse hover events while using the keyboard, preventing the selection from jumping
- fix: Jittery/Invisible Scroll

## 💄 Styles

- style: lighten dark mode color palette by adjusting HSL values for various UI elements.
- style: update arrow icon in CommandHelp from single to double-headed.

## 📝 Documentation

- docs: clarify sorting behavior for empty queries and document the new Alt+Q functionality
- docs: readme update

## 🏗️ Chores

- chore: Add Prettier and apply consistent formatting across the codebase.

## 🔧 CI/CD

- ci: Add GitHub Actions release workflow, promotional assets, and date-stamp packaged zip files.

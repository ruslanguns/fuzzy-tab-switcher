import { useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import browser from 'webextension-polyfill'
import { useHistory } from '../../hooks/useHistory'
import { useNavigation } from '../../hooks/useNavigation'
import { useTabs } from '../../hooks/useTabs'
import { useTheme } from '../../hooks/useTheme'
import { CommandHelp } from './CommandHelp'
import { Search } from './Search'
import { TabList } from './TabList'

export function App() {
  const searchRef = useRef(null)
  const query = useSignal('')
  const toggleShortcut = useSignal(null)

  useEffect(() => {
    let isMounted = true

    browser.commands.getAll().then((commands) => {
      if (!isMounted) return

      const toggleCommand = commands.find(
        (command) => command.name === '_execute_action' && command.shortcut,
      )

      toggleShortcut.value = toggleCommand?.shortcut ?? null
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const { history, recordAccess } = useHistory()
  const { theme, toggleTheme } = useTheme()

  const { filteredResults, isLoading, currentWindowId } = useTabs(
    query,
    history,
  )

  const switchTab = async (item) => {
    if (!item) return
    const { tab } = item

    await recordAccess(tab.id)

    try {
      if (tab.windowId !== currentWindowId.value) {
        await browser.windows.update(tab.windowId, { focused: true })
      }
      await browser.tabs.update(tab.id, { active: true })
      window.close()
    } catch (err) {
      console.error(err)
    }
  }

  const { selectedIndex, handleKeyDown } = useNavigation(
    filteredResults,
    switchTab,
  )

  const matchesShortcut = (event, shortcut) => {
    if (!shortcut) return false

    const normalizedShortcut = shortcut
      .replace('⌘', 'Command')
      .replace('⌥', 'Alt')
      .replace('⇧', 'Shift')
      .replace('⌃', 'Ctrl')

    const parts = normalizedShortcut.includes('+')
      ? normalizedShortcut.split('+')
      : normalizedShortcut.match(/(Command|Alt|Shift|Ctrl)|./g) || []

    const key = parts[parts.length - 1]?.toLowerCase()
    if (event.key.toLowerCase() !== key) return false

    const modifiers = {
      Command: event.metaKey,
      Alt: event.altKey,
      Shift: event.shiftKey,
      Ctrl: event.ctrlKey,
    }

    return Object.entries(modifiers).every(
      ([mod, isPressed]) => parts.includes(mod) === isPressed,
    )
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      window.close()
      return
    }

    if (matchesShortcut(e, toggleShortcut.value)) {
      e.preventDefault()
      window.close()
      return
    }

    handleKeyDown(e)
  }

  if (isLoading.value) {
    return (
      <div class='flex h-screen items-center justify-center rounded-lg bg-background p-4 text-muted-foreground'>
        Loading...
      </div>
    )
  }

  return (
    <div class='flex h-auto max-h-[600px] w-[500px] flex-col bg-background font-sans text-foreground antialiased'>
      <Search
        ref={searchRef}
        value={query.value}
        onInput={(e) => (query.value = e.target.value)}
        onKeyDown={onKeyDown}
      />
      <TabList
        results={filteredResults.value}
        selectedIndex={selectedIndex.value}
        onSelect={(idx) => switchTab(filteredResults.value[idx])}
        onHover={(idx) => {
          selectedIndex.value = idx
        }}
      />
      <CommandHelp theme={theme.value} onToggleTheme={toggleTheme} />
    </div>
  )
}

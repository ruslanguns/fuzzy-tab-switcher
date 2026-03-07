import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import browser from 'webextension-polyfill'

const STORAGE_KEY = 'theme_preference'

export function useTheme() {
  const theme = useSignal('system') // 'light' | 'dark' | 'system'

  // Load saved preference
  useEffect(() => {
    let isMounted = true

    browser.storage.local.get(STORAGE_KEY).then((data) => {
      if (isMounted && data[STORAGE_KEY]) {
        theme.value = data[STORAGE_KEY]
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const currentTheme = theme.value

    root.classList.remove('light', 'dark')

    if (currentTheme === 'system') {
      const systemDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      if (systemDark) root.classList.add('dark')
    } else {
      root.classList.add(currentTheme)
    }
  }, [theme.value])

  // Listen for system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = () => {
      if (theme.value === 'system') {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        if (mediaQuery.matches) root.classList.add('dark')
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme.value])

  const toggleTheme = async () => {
    const modes = ['light', 'dark', 'system']
    const nextIndex = (modes.indexOf(theme.value) + 1) % modes.length
    const nextTheme = modes[nextIndex]

    theme.value = nextTheme
    await browser.storage.local.set({ [STORAGE_KEY]: nextTheme })
  }

  return { theme, toggleTheme }
}

import { useState } from 'react'
import { CHANGELOG } from '../lib/changelog'

const STORAGE_KEY = 'whats_new_seen'

export function useWhatsNew() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== CHANGELOG.id
  )

  function dispensar() {
    localStorage.setItem(STORAGE_KEY, CHANGELOG.id)
    setVisible(false)
  }

  function forcarAbrir() {
    setVisible(true)
  }

  return { visible, dispensar, forcarAbrir }
}

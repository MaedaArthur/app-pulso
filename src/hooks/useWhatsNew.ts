import { useState } from 'react'
import { CHANGELOG } from '../lib/changelog'
import { track } from '../lib/analytics'

const STORAGE_KEY = 'whats_new_seen'

export function useWhatsNew() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== CHANGELOG.id
  )

  function dispensar() {
    localStorage.setItem(STORAGE_KEY, CHANGELOG.id)
    setVisible(false)
    track('whats_new_dispensado', { versao: CHANGELOG.id })
  }

  function forcarAbrir() {
    setVisible(true)
  }

  return { visible, dispensar, forcarAbrir }
}

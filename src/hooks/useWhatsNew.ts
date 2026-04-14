import { useState, useEffect } from 'react'
import { CHANGELOG } from '../lib/changelog'

const STORAGE_KEY = 'whats_new_seen'

export function useWhatsNew() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen !== CHANGELOG.id) {
      setVisible(true)
    }
  }, [])

  function dispensar() {
    localStorage.setItem(STORAGE_KEY, CHANGELOG.id)
    setVisible(false)
  }

  function forcarAbrir() {
    setVisible(true)
  }

  return { visible, dispensar, forcarAbrir }
}

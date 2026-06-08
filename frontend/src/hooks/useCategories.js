import { useEffect, useMemo, useState } from 'react'
import * as productsApi from '../services/products.service'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    productsApi
      .getCategories()
      .then((list) => {
        if (!cancelled) setCategories(list)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'Tout' },
      ...categories.map((c) => ({
        id: c.slug,
        label: c.name,
        emoji: c.emoji,
      })),
    ],
    [categories],
  )

  return { categories, tabs, loading }
}

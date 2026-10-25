import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  createMenuIndex,
  findMenuChain,
  getFirstMenuPath,
  getMenuLeaves,
  normalizeMenuTree,
} from './menuUtils'
import type { MenuContextValue, MenuItem, MenuProviderProps } from './types'

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({
  children,
  request,
  iconPrefix = 'ion',
  transform,
}: MenuProviderProps) {
  const [rawMenus, setRawMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const requestRef = useRef(request)
  requestRef.current = request
  const transformRef = useRef(transform)
  transformRef.current = transform
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const data = await requestRef.current()
      if (requestId !== requestIdRef.current) return
      setRawMenus(transformRef.current ? transformRef.current(data) : data)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setRawMenus([])
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const menuTree = useMemo(() => normalizeMenuTree(rawMenus), [rawMenus])
  const menuIndex = useMemo(() => createMenuIndex(menuTree), [menuTree])
  const leaves = useMemo(() => getMenuLeaves(menuTree), [menuTree])
  const firstMenuPath = useMemo(() => getFirstMenuPath(menuTree), [menuTree])

  const getMenuChain = useCallback((path: string) => findMenuChain(menuTree, path), [menuTree])
  const getMenuNode = useCallback((path: string) => menuIndex.get(path), [menuIndex])

  const value = useMemo<MenuContextValue>(
    () => ({
      loading,
      error,
      rawMenus,
      menuTree,
      leaves,
      getMenuChain,
      getMenuNode,
      firstMenuPath,
      iconPrefix,
      refresh: load,
    }),
    [
      loading,
      error,
      rawMenus,
      menuTree,
      leaves,
      getMenuChain,
      getMenuNode,
      firstMenuPath,
      iconPrefix,
      load,
    ],
  )

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu 必须在 <MenuProvider> 内部使用')
  }
  return context
}

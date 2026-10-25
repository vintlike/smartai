import { useCallback } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { AppMenuNode } from './types'

/** 菜单标题解析：优先 meta.localeKey，其次使用接口返回的 title */
export function useMenuTitle() {
  const { t, has } = useI18n()
  return useCallback(
    (node: AppMenuNode) => (node.localeKey && has(node.localeKey) ? t(node.localeKey) : node.title),
    [t, has],
  )
}

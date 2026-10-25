/** 拼接父子路径，兼容子路径已经携带父级前缀的情况（如 aigc + aigc/embed-store） */
export function joinPath(parentPath: string, childPath: string): string {
  const parent = trimSlashes(parentPath)
  const child = trimSlashes(childPath)

  if (!child) return parent ? `/${parent}` : '/'
  if (!parent) return `/${child}`
  if (child === parent || child.startsWith(`${parent}/`)) return `/${child}`
  return `/${parent}/${child}`
}

export function trimSlashes(path: string): string {
  return path.replace(/^\/+/, '').replace(/\/+$/, '')
}

export function isExternalPath(path: string): boolean {
  return /^(https?:)?\/\//.test(path) || /^(mailto|tel):/.test(path)
}

/** 判断当前访问路径是否命中菜单路径（支持后续扩展动态参数） */
export function matchMenuPath(menuPath: string, pathname: string): boolean {
  if (menuPath === pathname) return true
  return pathname.startsWith(`${menuPath}/`)
}

/** 驼峰转中划线：PaperPlaneOutline -> paper-plane-outline */
export function camelToKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

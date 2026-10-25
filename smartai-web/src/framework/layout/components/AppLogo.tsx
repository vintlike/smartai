import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLayout } from '../LayoutProvider'
import { BrandMark } from './BrandMark'

export interface AppLogoProps {
  collapsed?: boolean
  className?: string
}

/** 通用 Logo：图片/图标、标题、跳转地址均来自配置 */
export function AppLogo({ collapsed = false, className }: AppLogoProps) {
  const { logo } = useLayout()
  const navigate = useNavigate()
  const { src, icon, title = '', showTitle, showTitleWhenCollapsed, href = '/' } = logo
  const visible = showTitle !== false && (!collapsed || showTitleWhenCollapsed === true)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (/^https?:\/\//.test(href)) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(href)
  }

  return (
    <a
      className={['sa-logo', className].filter(Boolean).join(' ')}
      href={href}
      onClick={handleClick}
      aria-label={title}
    >
      <span className="sa-logo__icon">
        {icon ?? (src ? <img src={src} alt={title} width={28} height={28} /> : <BrandMark />)}
      </span>
      {visible ? <span className="sa-logo__title">{title}</span> : null}
    </a>
  )
}

import { Breadcrumb } from 'antd'
import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useMenu } from '../../menu/MenuProvider'
import { useMenuTitle } from '../../menu/useMenuTitle'

/** 基于菜单树自动生成面包屑 */
export function LayoutBreadcrumb() {
  const { getMenuChain, firstMenuPath } = useMenu()
  const getTitle = useMenuTitle()
  const location = useLocation()
  const chain = getMenuChain(location.pathname)

  const items = [
    {
      title: (
        <Link to={firstMenuPath} className="sa-breadcrumb__home">
          <Home size={14} />
        </Link>
      ),
    },
    ...chain.map((node) => ({ title: getTitle(node) })),
  ]

  return <Breadcrumb className="sa-breadcrumb" items={items} />
}

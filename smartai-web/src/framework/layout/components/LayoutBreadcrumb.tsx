import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useMenu } from '@/framework/menu/MenuProvider';
import { useMenuTitle } from '@/framework/menu/useMenuTitle';

/** 基于菜单树自动生成面包屑 */
export function LayoutBreadcrumb() {
  const { getMenuChain, firstMenuPath } = useMenu();
  const getTitle = useMenuTitle();
  const location = useLocation();
  const chain = getMenuChain(location.pathname);

  const items = [
    {
      title: (
        <Link to={firstMenuPath} className="sa-breadcrumb__home">
          <HomeOutlined style={{ fontSize: 18 }} />
        </Link>
      ),
    },
    ...chain.map((node) => ({ title: getTitle(node) })),
  ];

  return <Breadcrumb className="sa-breadcrumb" items={items} />;
}

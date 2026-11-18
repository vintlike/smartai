import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, type BreadcrumbProps } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useMenuContext } from '../../menu/MenuProvider';
import { getItemPath, resolveMenuChain } from '../../menu/MenuUtil';
import { useLayout } from '../AppLayoutProvider';

/** 面包屑：由当前路径命中的菜单链推导，分组节点不可点击 */
export function AppBreadcrumb() {
  const { menus } = useMenuContext();
  const { config } = useLayout();
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const items = useMemo<NonNullable<BreadcrumbProps['items']>>(() => {
    const chain = resolveMenuChain(menus, pathname);
    if (chain.length === 0) return [];

    return [
      {
        title: (
          <button
            type="button"
            className="app-breadcrumb-link"
            aria-label={t('common.backHome')}
            onClick={() => navigate(config.homePath ?? '/')}
          >
            <HomeOutlined />
          </button>
        ),
      },
      ...chain.map((node, index) => {
        const path = getItemPath(node);
        const isLast = index === chain.length - 1;
        // 分组节点与动态段（:id）不可点击，避免跳到无意义路径
        const clickable =
          !isLast && !node.children?.length && Boolean(node.component) && !path.includes(':');

        return {
          title: clickable ? (
            <button type="button" className="app-breadcrumb-link" onClick={() => navigate(path)}>
              {node.label}
            </button>
          ) : (
            node.label
          ),
        };
      }),
    ];
  }, [menus, pathname, navigate, config.homePath, t]);

  if (items.length === 0) return null;

  return <Breadcrumb className="app-breadcrumb" items={items} />;
}

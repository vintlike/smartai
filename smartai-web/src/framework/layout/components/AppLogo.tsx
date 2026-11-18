import { theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../AppLayoutProvider';

export interface AppLogoProps {
  /** 是否折叠态（侧边栏收起时仅展示 Logo） */
  collapsed?: boolean;
}

/**
 * Logo + 标题：位置由所在容器决定（侧边栏顶部 / 顶栏左侧）。
 * 未显式传入 collapsed 时跟随布局的折叠状态；点击跳转到 homePath。
 */
export function AppLogo({ collapsed }: AppLogoProps) {
  const { config, collapsed: layoutCollapsed } = useLayout();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const isCollapsed = collapsed ?? layoutCollapsed;
  const logo = isCollapsed ? (config.collapsedLogo ?? config.logo) : config.logo;

  return (
    <button
      type="button"
      className={`app-layout-logo${isCollapsed ? ' is-collapsed' : ''}`}
      title={typeof config.title === 'string' ? config.title : undefined}
      onClick={() => navigate(config.homePath ?? '/')}
    >
      <span className="app-layout-logo-img">{logo}</span>
      {!isCollapsed && config.title && (
        <span className="app-layout-logo-title" style={{ color: token.colorText }}>
          {config.title}
        </span>
      )}
    </button>
  );
}

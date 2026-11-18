import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, type MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useLayout } from '../AppLayoutProvider';

/**
 * 右上角用户头像：点击下拉展示当前用户信息、个人中心与退出登录。
 * 用户数据来自 config.userInfo，入口由 config.onProfile / config.onLogout 决定，框架不感知业务。
 */
export function AppUserAvatar() {
  const { config } = useLayout();
  const { t } = useI18n();
  const userInfo = config.userInfo;
  const name = userInfo?.name ?? t('user.defaultName');
  const nameText = typeof name === 'string' ? name : undefined;
  const avatarFallback = nameText ? nameText.charAt(0) : undefined;

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      className: 'app-user-info-item',
      label: (
        <div className="app-user-info">
          <Avatar
            size={40}
            src={userInfo?.avatar}
            icon={!userInfo?.avatar ? <UserOutlined /> : undefined}
          >
            {!userInfo?.avatar ? avatarFallback : undefined}
          </Avatar>
          <div className="app-user-info-meta">
            <div className="app-user-info-name">{name}</div>
            {userInfo?.account && <div className="app-user-info-sub">{userInfo.account}</div>}
            {userInfo?.description && (
              <div className="app-user-info-sub">{userInfo.description as ReactNode}</div>
            )}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
  ];

  if (config.onProfile) {
    items.push({
      key: 'profile',
      icon: <UserOutlined />,
      label: t('user.profile'),
      onClick: config.onProfile,
    });
  }

  if (config.onLogout) {
    items.push({
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('user.logout'),
      onClick: config.onLogout,
    });
  }

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="app-user-avatar-trigger"
        aria-label={nameText ?? t('user.defaultName')}
      >
        <Avatar
          size={32}
          src={userInfo?.avatar}
          icon={!userInfo?.avatar ? <UserOutlined /> : undefined}
        >
          {!userInfo?.avatar ? avatarFallback : undefined}
        </Avatar>
      </button>
    </Dropdown>
  );
}

import { App, Avatar, Descriptions, Dropdown, Modal } from 'antd'
import type { DescriptionsProps, MenuProps } from 'antd'
import { LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { currentUser, logout } from '@/services/user'
import './UserMenu.less'

/** 账号菜单：顶栏头像 + 下拉，展示当前登录账号信息，提供个人信息与退出登录 */
export function UserMenu() {
  const { modal, message } = App.useApp()
  const [profileOpen, setProfileOpen] = useState(false)

  const initial = currentUser.nickname.slice(0, 1)

  const profileItems: DescriptionsProps['items'] = [
    { key: 'username', label: '登录账号', children: currentUser.username },
    { key: 'nickname', label: '昵称', children: currentUser.nickname },
    { key: 'role', label: '角色', children: currentUser.roleName ?? '-' },
    { key: 'dept', label: '部门', children: currentUser.deptName ?? '-' },
    { key: 'email', label: '邮箱', children: currentUser.email ?? '-' },
    { key: 'phone', label: '手机号', children: currentUser.phone ?? '-' },
    { key: 'lastLoginAt', label: '最近登录', children: currentUser.lastLoginAt ?? '-' },
  ]

  const handleLogout = () => {
    modal.confirm({
      title: '退出登录',
      content: `确定要退出当前账号「${currentUser.nickname}」吗？`,
      okText: '退出登录',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await logout()
        // 真实项目在此跳转登录页，例如 navigate('/login', { replace: true })
        message.success('已退出登录')
      },
    })
  }

  const menuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserRound size={14} />, label: '个人信息' },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={14} />, label: '退出登录', danger: true },
  ]

  return (
    <>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          items: menuItems,
          onClick: ({ key }) => {
            if (key === 'profile') setProfileOpen(true)
            if (key === 'logout') handleLogout()
          },
        }}
        popupRender={(menu) => (
          <div className="sa-user-panel">
            <div className="sa-user-panel__header">
              <Avatar
                size={36}
                src={currentUser.avatar}
                style={{ background: 'var(--sa-color-primary)', flex: 'none' }}
              >
                {initial}
              </Avatar>
              <div className="sa-user-panel__meta">
                <span className="sa-user-panel__name">{currentUser.nickname}</span>
                <span className="sa-user-panel__desc">
                  {currentUser.roleName ?? currentUser.username}
                </span>
              </div>
            </div>
            {menu}
          </div>
        )}
      >
        <button type="button" className="sa-user-trigger" aria-label="账号菜单">
          <Avatar
            size={28}
            src={currentUser.avatar}
            style={{ background: 'var(--sa-color-primary)', flex: 'none' }}
          >
            {initial}
          </Avatar>
          <span className="sa-user-trigger__name">{currentUser.nickname}</span>
        </button>
      </Dropdown>

      <Modal
        open={profileOpen}
        title="个人信息"
        footer={null}
        width={420}
        onCancel={() => setProfileOpen(false)}
      >
        <div className="sa-user-profile">
          <div className="sa-user-profile__head">
            <Avatar
              size={48}
              src={currentUser.avatar}
              style={{ background: 'var(--sa-color-primary)', flex: 'none', fontSize: 18 }}
            >
              {initial}
            </Avatar>
            <div className="sa-user-profile__meta">
              <span className="sa-user-profile__name">{currentUser.nickname}</span>
              <span className="sa-user-profile__desc">
                {currentUser.roleName ?? currentUser.username}
              </span>
            </div>
          </div>
          <Descriptions column={1} size="small" items={profileItems} />
        </div>
      </Modal>
    </>
  )
}

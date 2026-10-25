import { Button, Dropdown, Tabs } from 'antd'
import type { TabsProps } from 'antd'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useMenu } from '../../menu/MenuProvider'
import { useMenuTitle } from '../../menu/useMenuTitle'
import { useLayout } from '../LayoutProvider'

/** 多 Tab 标签页，可关闭/关闭其它/关闭全部 */
export function TabsBar() {
  const { tabs, activeKey, closeTab, closeOtherTabs, closeAllTabs } = useLayout()
  const { getMenuNode } = useMenu()
  const getTitle = useMenuTitle()
  const { t } = useI18n()
  const navigate = useNavigate()

  if (tabs.length === 0) return null

  const items: NonNullable<TabsProps['items']> = tabs.map((tab) => {
    const node = getMenuNode(tab.path)
    return {
      key: tab.key,
      label: node ? getTitle(node) : tab.title,
      closable: tab.closable && tabs.length > 1,
    }
  })

  return (
    <div className="sa-tabsbar">
      <Tabs
        type="editable-card"
        size="small"
        hideAdd
        activeKey={activeKey}
        items={items}
        onChange={(key) => navigate(key)}
        onEdit={(targetKey, action) => {
          if (action === 'remove') closeTab(String(targetKey))
        }}
        tabBarExtraContent={
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                { key: 'others', label: t('layout.tabs.closeOthers') },
                { key: 'all', label: t('layout.tabs.closeAll') },
              ],
              onClick: ({ key }) => {
                if (key === 'others') closeOtherTabs(activeKey)
                if (key === 'all') closeAllTabs()
              },
            }}
          >
            <Button
              type="text"
              size="small"
              className="sa-icon-btn"
              aria-label={t('layout.tabs.closeOthers')}
              icon={<MoreHorizontal size={16} />}
            />
          </Dropdown>
        }
      />
    </div>
  )
}

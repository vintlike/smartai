import type { MenuProps, TabsProps } from 'antd';
import { Button, Dropdown, Tabs, Tooltip } from 'antd';
import { ArrowLeftToLine, ArrowRightToLine, ChevronDown, RotateCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useMenu } from '../../menu/MenuProvider';
import { useMenuTitle } from '../../menu/useMenuTitle';
import { useLayout } from '../LayoutProvider';

/**
 * 多 Tab 标签页：
 * - 每个标签右键弹出操作菜单
 * - 右侧提供刷新按钮与操作下拉菜单
 */
export function TabsBar() {
  const { tabs, activeKey, closeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, refreshTab } =
    useLayout();
  const { getMenuNode } = useMenu();
  const getTitle = useMenuTitle();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (tabs.length === 0) return null;

  const handleMenuClick = (targetKey: string, key: string) => {
    if (key === 'refresh') refreshTab(targetKey);
    else if (key === 'close') closeTab(targetKey);
    else if (key === 'closeOthers') closeOtherTabs(targetKey);
    else if (key === 'closeLeft') closeLeftTabs(targetKey);
    else if (key === 'closeRight') closeRightTabs(targetKey);
  };

  const buildMenuItems = (targetKey: string): MenuProps['items'] => {
    const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
    const target = tabs[targetIndex];
    const closeDisabled = !target?.closable || tabs.length <= 1;
    const hasOtherClosable = tabs.some((tab) => tab.key !== targetKey && tab.closable);
    const hasLeftClosable =
      targetIndex > 0 && tabs.slice(0, targetIndex).some((tab) => tab.closable);
    const hasRightClosable =
      targetIndex !== -1 && tabs.slice(targetIndex + 1).some((tab) => tab.closable);

    return [
      { key: 'refresh', label: t('layout.tabs.refresh'), icon: <RotateCw size={14} /> },
      { type: 'divider' },
      {
        key: 'close',
        label: t('layout.tabs.close'),
        icon: <X size={14} />,
        disabled: closeDisabled,
      },
      {
        key: 'closeOthers',
        label: t('layout.tabs.closeOthers'),
        icon: <X size={14} />,
        disabled: !hasOtherClosable,
      },
      {
        key: 'closeLeft',
        label: t('layout.tabs.closeLeft'),
        icon: <ArrowLeftToLine size={14} />,
        disabled: !hasLeftClosable,
      },
      {
        key: 'closeRight',
        label: t('layout.tabs.closeRight'),
        icon: <ArrowRightToLine size={14} />,
        disabled: !hasRightClosable,
      },
    ];
  };

  const items: NonNullable<TabsProps['items']> = tabs.map((tab) => {
    const node = getMenuNode(tab.path);
    return {
      key: tab.key,
      label: (
        <Dropdown
          trigger={['contextMenu']}
          placement="bottomLeft"
          menu={{
            items: buildMenuItems(tab.key),
            onClick: ({ key }) => handleMenuClick(tab.key, key),
          }}
        >
          <span className="sa-tab-label">{node ? getTitle(node) : tab.title}</span>
        </Dropdown>
      ),
      closable: tab.closable && tabs.length > 1,
    };
  });

  const actions = (
    <div className="sa-tabsbar__actions">
      <Tooltip title={t('layout.tabs.refresh')}>
        <Button
          type="text"
          size="small"
          className="sa-icon-btn"
          aria-label={t('layout.tabs.refresh')}
          icon={<RotateCw size={15} />}
          onClick={() => refreshTab()}
        />
      </Tooltip>
      <span className="sa-tabsbar__divider" aria-hidden />
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          items: buildMenuItems(activeKey),
          onClick: ({ key }) => handleMenuClick(activeKey, key),
        }}
      >
        <Button
          type="text"
          size="small"
          className="sa-icon-btn"
          aria-label={t('layout.tabs.more')}
          icon={<ChevronDown size={15} />}
        />
      </Dropdown>
    </div>
  );

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
          if (action === 'remove') closeTab(String(targetKey));
        }}
        tabBarExtraContent={actions}
      />
    </div>
  );
}

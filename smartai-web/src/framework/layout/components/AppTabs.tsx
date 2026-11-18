import { CaretDownOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Menu, type MenuProps, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useMenuContext } from '../../menu/MenuProvider';
import { resolveTabTitle } from '../../menu/MenuUtil';
import { useLayout } from '../AppLayoutProvider';

/** 从本地存储读取标签路径列表（过滤重定向根路径与重复项） */
function readStoredTabs(storageKey: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(`${storageKey}-tabs`) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(parsed.filter((item): item is string => typeof item === 'string' && item !== '/')),
    ];
  } catch {
    return [];
  }
}

/**
 * 多页签导航栏：路由变化自动开签，标签路径持久化到本地存储。
 * 标签标题实时取自菜单数据（hidden 菜单承载详情页标题），菜单文案变更后自动同步。
 * 刷新当前页优先通知局部刷新订阅者（表格等），无人订阅时回退为内容区重挂载。
 */
export function AppTabs() {
  const { config, refreshPage } = useLayout();
  const { menus } = useMenuContext();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const storageKey = config.storageKey ?? 'smartai-web';

  const [tabs, setTabs] = useState<string[]>(() => readStoredTabs(storageKey));
  const [contextMenuKey, setContextMenuKey] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeKey = location.pathname;

  /** 路由变化：跳过根路径重定向，未在列表中的路径自动开签 */
  useEffect(() => {
    if (activeKey === '/') return;
    setTabs((prev) => (prev.includes(activeKey) ? prev : [...prev, activeKey]));
  }, [activeKey]);

  /** 标签列表持久化 */
  useEffect(() => {
    window.localStorage.setItem(`${storageKey}-tabs`, JSON.stringify(tabs));
  }, [storageKey, tabs]);

  /** 点击页面任意处关闭右键菜单 */
  useEffect(() => {
    if (!contextMenuKey) return;
    const close = () => setContextMenuKey(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [contextMenuKey]);

  /** 标签右键：定位命中的签并弹出操作菜单 */
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const onContextMenu = (event: MouseEvent) => {
      const tabNode = (event.target as HTMLElement).closest('[role="tab"]');
      if (!tabNode) return;
      event.preventDefault();
      const all = Array.from(container.querySelectorAll('[role="tab"]'));
      const path = tabs[all.indexOf(tabNode)];
      if (!path) return;
      setContextMenuKey(path);
      setContextMenuPos({ x: event.clientX, y: event.clientY });
    };
    container.addEventListener('contextmenu', onContextMenu);
    return () => container.removeEventListener('contextmenu', onContextMenu);
  }, [tabs]);

  /** 关闭单个标签：关的是当前签时导航到相邻签 */
  const closeTab = useCallback(
    (key: string) => {
      if (tabs.length <= 1) return;
      const index = tabs.indexOf(key);
      if (index === -1) return;
      const next = tabs.filter((item) => item !== key);
      setTabs(next);
      setContextMenuKey(null);
      if (key === activeKey) {
        navigate(next[Math.min(index, next.length - 1)]);
      }
    },
    [tabs, activeKey, navigate],
  );

  /** 关闭其他标签 */
  const closeOtherTabs = useCallback(
    (key: string) => {
      setTabs([key]);
      setContextMenuKey(null);
      if (key !== activeKey) navigate(key);
    },
    [activeKey, navigate],
  );

  /** 关闭左侧其他标签：当前签被波及则导航到目标签 */
  const closeLeftTabs = useCallback(
    (key: string) => {
      const index = tabs.indexOf(key);
      if (index <= 0) return;
      const next = tabs.slice(index);
      setTabs(next);
      setContextMenuKey(null);
      if (!next.includes(activeKey)) navigate(key);
    },
    [tabs, activeKey, navigate],
  );

  /** 关闭右侧其他标签：当前签被波及则导航到目标签 */
  const closeRightTabs = useCallback(
    (key: string) => {
      const index = tabs.indexOf(key);
      if (index === -1) return;
      const next = tabs.slice(0, index + 1);
      setTabs(next);
      setContextMenuKey(null);
      if (!next.includes(activeKey)) navigate(key);
    },
    [tabs, activeKey, navigate],
  );

  /** 关闭全部标签（保留第一个签，与 smartai-ui 行为一致） */
  const closeAllTabs = useCallback(() => {
    if (tabs.length <= 1) return;
    const [first] = tabs;
    setTabs([first]);
    setContextMenuKey(null);
    if (first !== activeKey) navigate(first);
  }, [tabs, activeKey, navigate]);

  /** 刷新指定标签：非当前签切换过去即完成全新挂载；当前签优先走局部刷新 */
  const refreshTab = useCallback(
    (key: string) => {
      setContextMenuKey(null);
      if (key !== activeKey) {
        navigate(key);
        return;
      }
      refreshPage();
    },
    [activeKey, navigate, refreshPage],
  );

  /** 单个标签的操作菜单项 */
  const buildMenuItems = useCallback(
    (key: string | null): MenuProps['items'] => {
      if (!key) return [];
      const index = tabs.indexOf(key);
      return [
        {
          key: 'refresh',
          label: t('tabs.refreshCurrent'),
          onClick: () => refreshTab(key),
        },
        {
          key: 'close',
          label: t('tabs.close'),
          disabled: tabs.length <= 1,
          onClick: () => closeTab(key),
        },
        {
          key: 'closeOthers',
          label: t('tabs.closeOthers'),
          disabled: tabs.length <= 1,
          onClick: () => closeOtherTabs(key),
        },
        {
          key: 'closeLeft',
          label: t('tabs.closeLeft'),
          disabled: index <= 0,
          onClick: () => closeLeftTabs(key),
        },
        {
          key: 'closeRight',
          label: t('tabs.closeRight'),
          disabled: index === -1 || index >= tabs.length - 1,
          onClick: () => closeRightTabs(key),
        },
      ];
    },
    [tabs, t, refreshTab, closeTab, closeOtherTabs, closeLeftTabs, closeRightTabs],
  );

  /** 右侧下拉：关闭全部 + 当前激活签的操作项 */
  const dropdownItems = useMemo<MenuProps['items']>(
    () => [
      {
        key: 'closeAll',
        label: t('tabs.closeAll'),
        disabled: tabs.length <= 1,
        onClick: closeAllTabs,
      },
      { type: 'divider' },
      ...(buildMenuItems(activeKey) ?? []),
    ],
    [tabs.length, t, closeAllTabs, buildMenuItems, activeKey],
  );

  return (
    <>
      <div ref={tabsRef} className="app-layout-tabs">
        <Tabs
          hideAdd
          activeKey={activeKey}
          type={tabs.length > 1 ? 'editable-card' : 'card'}
          onChange={(key) => navigate(key)}
          onEdit={(targetKey, action) => {
            if (action === 'remove') closeTab(String(targetKey));
          }}
          tabBarExtraContent={{
            right: (
              <div className="app-layout-tabs-extra">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  title={t('tabs.refreshCurrent')}
                  onClick={refreshPage}
                />
                <Divider orientation="vertical" className="app-layout-tabs-divider" />
                <Dropdown trigger={['click']} menu={{ items: dropdownItems }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CaretDownOutlined />}
                    title={t('tabs.closeAll')}
                  />
                </Dropdown>
              </div>
            ),
          }}
          items={tabs.map((path) => ({
            key: path,
            label: resolveTabTitle(menus, path),
            closable: tabs.length > 1,
          }))}
        />
      </div>
      {contextMenuKey ? (
        <div
          className="app-layout-tabs-context"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <Menu items={buildMenuItems(contextMenuKey) ?? []} />
        </div>
      ) : null}
    </>
  );
}

import {
  CheckOutlined,
  ColumnHeightOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Divider, Dropdown, type MenuProps, Switch, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useI18n } from '@/framework';
import type { TableDensity, TableToolbarState } from '@/hooks/useTableToolbar';
import './table.less';

export interface TableToolbarProps<T> {
  state: TableToolbarState<T>;
  /** 左侧业务按钮（如「新增」） */
  extra?: ReactNode;
}

/** 表格右上角工具栏：斑马纹 / 刷新 / 密度 / 列设置 */
export function TableToolbar<T>({ state, extra }: TableToolbarProps<T>) {
  const { t } = useI18n();

  const densityItems: MenuProps['items'] = (
    [
      ['compact', t('table.densityCompact')],
      ['default', t('table.densityDefault')],
      ['loose', t('table.densityLoose')],
    ] as Array<[TableDensity, string]>
  ).map(([key, label]) => ({
    key,
    label,
    icon:
      state.density === key ? <CheckOutlined /> : <span className="app-table-toolbar-icon-space" />,
  }));

  return (
    <div className="app-table-toolbar">
      <div className="app-table-toolbar__left">{extra}</div>
      <div className="app-table-toolbar__right">
        <Tooltip title={t('table.zebra')}>
          <Switch size="small" checked={state.zebra} onChange={state.setZebra} />
        </Tooltip>
        <Divider orientation="vertical" className="app-table-toolbar__divider" />
        <Tooltip title={t('table.refresh')}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={state.loading}
            onClick={() => {
              void state.refresh();
            }}
          />
        </Tooltip>
        <Dropdown
          trigger={['click']}
          menu={{
            items: densityItems,
            selectable: false,
            onClick: ({ key }) => state.setDensity(key as TableDensity),
          }}
        >
          <Tooltip title={t('table.density')}>
            <Button type="text" size="small" icon={<ColumnHeightOutlined />} />
          </Tooltip>
        </Dropdown>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          popupRender={() => (
            <div className="app-column-setting">
              <div className="app-column-setting__title">{t('table.columnSetting')}</div>
              <div className="app-column-setting__list">
                {state.columnMetas.map((meta) => (
                  <Checkbox
                    key={meta.key}
                    checked={!state.hiddenKeys.includes(meta.key)}
                    onChange={(event) => state.toggleColumn(meta.key, event.target.checked)}
                  >
                    {meta.title}
                  </Checkbox>
                ))}
              </div>
              <div className="app-column-setting__footer">
                <Button type="link" size="small" onClick={state.resetColumns}>
                  {t('table.reset')}
                </Button>
              </div>
            </div>
          )}
        >
          <Tooltip title={t('table.columnSetting')}>
            <Button type="text" size="small" icon={<SettingOutlined />} />
          </Tooltip>
        </Dropdown>
      </div>
    </div>
  );
}

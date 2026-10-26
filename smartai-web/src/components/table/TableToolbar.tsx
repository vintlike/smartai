import type { MenuProps } from 'antd';
import { Button, Checkbox, Divider, Dropdown, Switch, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import {
  CheckOutlined,
  ColumnHeightOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TableDensity, TableToolbarState } from '@/components/table/useTableToolbar';
import { densityLabels } from '@/components/table/useTableToolbar';
import '@/components/table/table.less';

export interface TableToolbarProps<T> {
  state: TableToolbarState<T>;
  /** 左侧业务按钮（如「新增」） */
  extra?: ReactNode;
}

/** 表格右上角工具栏：斑马纹 / 刷新 / 密度 / 列设置 */
export function TableToolbar<T>({ state, extra }: TableToolbarProps<T>) {
  const densityItems: MenuProps['items'] = (
    Object.keys(densityLabels) as TableDensity[]
  ).map((key) => ({
    key,
    label: densityLabels[key],
    icon: state.density === key ? <CheckOutlined /> : <span className="sa-toolbar__icon-space" />,
  }));

  return (
    <div className="sa-table-toolbar">
      <div className="sa-table-toolbar__left">{extra}</div>
      <div className="sa-table-toolbar__right">
        <Tooltip title="表格斑马纹">
          <Switch size="small" checked={state.zebra} onChange={state.setZebra} />
        </Tooltip>
        <Divider orientation="vertical" className="sa-table-toolbar__divider" />
        <Tooltip title="刷新">
          <Button type="text" size="small" icon={<ReloadOutlined />} onClick={state.refresh} />
        </Tooltip>
        <Dropdown
          trigger={['click']}
          menu={{
            items: densityItems,
            selectable: false,
            onClick: ({ key }) => state.setDensity(key as TableDensity),
          }}
        >
          <Tooltip title="密度">
            <Button type="text" size="small" icon={<ColumnHeightOutlined />} />
          </Tooltip>
        </Dropdown>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          popupRender={() => (
            <div className="sa-column-setting">
              <div className="sa-column-setting__title">列展示</div>
              <div className="sa-column-setting__list">
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
              <div className="sa-column-setting__footer">
                <Button type="link" size="small" onClick={state.resetColumns}>
                  重置
                </Button>
              </div>
            </div>
          )}
        >
          <Tooltip title="列设置">
            <Button type="text" size="small" icon={<SettingOutlined />} />
          </Tooltip>
        </Dropdown>
      </div>
    </div>
  );
}

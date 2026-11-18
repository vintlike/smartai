import { Empty, Table, type TableProps } from 'antd';
import type { ReactNode } from 'react';
import { useI18n } from '@/framework';
import type { TableToolbarState } from '@/hooks/useTableToolbar';
import { TableToolbar } from './TableToolbar';
import './table.less';

export interface DataTableProps<T>
  extends Omit<TableProps<T>, 'columns' | 'size' | 'rowClassName'> {
  /** useTableToolbar 返回的状态 */
  state: TableToolbarState<T>;
  /** 工具栏左侧业务按钮（新增、批量操作等） */
  toolbarExtra?: ReactNode;
  /** 是否隐藏工具栏（详情页内的小表格使用） */
  hideToolbar?: boolean;
}

/** 统一列表表格：自带工具栏、斑马纹、密度、分页与空状态 */
export function DataTable<T extends object>({
  state,
  toolbarExtra,
  hideToolbar,
  rowKey = 'id',
  pagination,
  locale,
  scroll,
  loading,
  ...rest
}: DataTableProps<T>) {
  const { t } = useI18n();

  const mergedPagination =
    pagination === false
      ? false
      : {
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showQuickJumper: true,
          showTotal: (total: number) => t('common.total', { total }),
          ...(pagination ?? {}),
        };

  return (
    <div className="app-data-table">
      {hideToolbar ? toolbarExtra : <TableToolbar state={state} extra={toolbarExtra} />}
      <Table<T>
        rowKey={rowKey}
        size={state.tableSize}
        columns={state.visibleColumns}
        loading={state.loading || loading}
        rowClassName={(_, index) => (state.zebra && index % 2 === 1 ? 'app-table-row--zebra' : '')}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
          ),
          ...locale,
        }}
        pagination={mergedPagination}
        scroll={{ x: 'max-content', ...scroll }}
        {...rest}
      />
    </div>
  );
}

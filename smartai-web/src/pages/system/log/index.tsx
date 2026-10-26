import { DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { App, Button, Divider, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { PageContainer, PageHeading } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { LogItem } from '@/services/mock-data';
import { mockLogs } from '@/services/mock-data';
import '@/pages/system/log/log.less';

/** 日志管理：所有用户的操作日志 */
export default function LogPage() {
  const { message, modal } = App.useApp();
  const [logs, setLogs] = useState<LogItem[]>(mockLogs);

  const columns = useMemo<TableColumnsType<LogItem>>(
    () => [
      { title: '操作用户', dataIndex: 'username', key: 'username', width: 130 },
      {
        title: '操作状态',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (value: string) => <Tag color="success">{value}</Tag>,
      },
      { title: '操作描述', dataIndex: 'description', key: 'description', width: 140 },
      { title: '请求URL', dataIndex: 'url', key: 'url', width: 150 },
      { title: '耗时/毫秒', dataIndex: 'cost', key: 'cost', width: 110 },
      { title: '操作方法', dataIndex: 'method', key: 'method', width: 110 },
      { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130 },
      { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', width: 190 },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: (_, record) => (
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              modal.confirm({
                title: '删除日志',
                content: '确定要删除这条操作日志吗？',
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => {
                  setLogs((list) => list.filter((item) => item.id !== record.id));
                  message.success('删除成功');
                },
              })
            }
          />
        ),
      },
    ],
    // 操作列仅依赖稳定的 modal/message
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const state = useTableToolbar(columns);

  return (
    <PageContainer>
      <PageHeading title="日志数据管理" description="所有用户的操作日志信息。" />
      <Divider className="sa-log__divider" />
      <DataTable<LogItem> state={state} dataSource={logs} />
    </PageContainer>
  );
}

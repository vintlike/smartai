import { EyeOutlined } from '@ant-design/icons';
import { Button, Descriptions, Drawer, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockLogs } from './mockData';
import type { LogItem } from './types';

const { Text } = Typography;

export default function LogManage() {
  const [logs] = useState<LogItem[]>(mockLogs);
  const [current, setCurrent] = useState<LogItem | null>(null);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const filteredLogs = useMemo(() => {
    const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
    return logs.filter((item) => {
      if (keyword) {
        const haystack = `${item.username}${item.description}${item.url}${item.method}${item.ip}`;
        if (!haystack.toLowerCase().includes(keyword)) return false;
      }
      if (typeof query.status === 'string' && item.status !== query.status) return false;
      if (query.speed === 'fast' && item.costTime >= 1000) return false;
      if (query.speed === 'slow' && item.costTime < 1000) return false;
      return true;
    });
  }, [logs, query]);

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setPageState(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setPageState(1);
  };

  const columns: ColumnsType<LogItem> = [
    { title: '操作用户', dataIndex: 'username', width: 120 },
    {
      title: '操作状态',
      dataIndex: 'status',
      width: 100,
      render: (status: LogItem['status']) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    { title: '操作描述', dataIndex: 'description', width: 150 },
    { title: '请求URL', dataIndex: 'url', width: 200, ellipsis: true },
    {
      title: '耗时/毫秒',
      dataIndex: 'costTime',
      width: 120,
      sorter: (a, b) => a.costTime - b.costTime,
      render: (costTime: number) => (
        <span style={{ color: costTime > 1000 ? 'var(--ant-color-error)' : undefined }}>
          {costTime}
        </span>
      ),
    },
    { title: '操作方法', dataIndex: 'method', width: 220, ellipsis: true },
    { title: 'IP地址', dataIndex: 'ip', width: 140 },
    { title: '操作时间', dataIndex: 'operateTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setCurrent(record)}>
          详情
        </Button>
      ),
    },
  ];

  const toolbar = useTableToolbar<LogItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer title="日志管理" contentBordered={false}>
      <SearchBar
        fields={[
          {
            name: 'keyword',
            label: '关键字',
            placeholder: '用户 / 描述 / URL / IP',
            width: 240,
          },
          {
            name: 'status',
            label: '操作状态',
            type: 'select',
            width: 140,
            options: [
              { value: 'success', label: '成功' },
              { value: 'fail', label: '失败' },
            ],
          },
          {
            name: 'speed',
            label: '耗时',
            type: 'select',
            width: 150,
            options: [
              { value: 'fast', label: '正常（<1s）' },
              { value: 'slow', label: '慢请求（≥1s）' },
            ],
          },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      <div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">
        <DataTable
          rowKey="id"
          bordered
          state={toolbar}
          dataSource={filteredLogs}
          scroll={{ x: 1400 }}
          pagination={{
            current: page,
            pageSize,
            onChange: (nextPage, nextPageSize) => {
              setPageState(nextPage);
              setPageSizeState(nextPageSize);
            },
          }}
        />
      </div>

      <Drawer
        width={520}
        destroyOnHidden
        open={Boolean(current)}
        title="日志详情"
        onClose={() => setCurrent(null)}
      >
        {current ? (
          <Descriptions column={1} styles={{ label: { width: 100 } }}>
            <Descriptions.Item label="操作用户">{current.username}</Descriptions.Item>
            <Descriptions.Item label="操作状态">
              <Tag color={current.status === 'success' ? 'success' : 'error'}>
                {current.status === 'success' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作描述">{current.description}</Descriptions.Item>
            <Descriptions.Item label="请求地址">
              <Text code copyable>
                {current.url}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="操作方法">{current.method}</Descriptions.Item>
            <Descriptions.Item label="耗时">{current.costTime} 毫秒</Descriptions.Item>
            <Descriptions.Item label="IP 地址">{current.ip}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{current.operateTime}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </PageContainer>
  );
}

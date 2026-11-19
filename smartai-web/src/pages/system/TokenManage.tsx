import { App, Button, Popconfirm, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SysTokenRecord } from '@/api/system';
import { tokenApi } from '@/api/system';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import type { TokenItem } from './types';

const { Text } = Typography;

function maskToken(token: string): string {
  if (token.length <= 14) return token;
  return `${token.slice(0, 6)}****${token.slice(-6)}`;
}

function isExpired(expireTime: string): boolean {
  const parsed = new Date(expireTime.replace(/-/g, '/'));
  return Number.isNaN(parsed.getTime()) ? false : parsed.getTime() < Date.now();
}

function toTokenItem(record: SysTokenRecord): TokenItem {
  return {
    id: record.id,
    token: record.token ?? '',
    account: record.account ?? '',
    expireTime: record.expireTime ?? '',
  };
}

export default function TokenManage() {
  const { message } = App.useApp();
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const loadData = useCallback(async () => {
    try {
      const result = await tokenApi.list();
      setTokens(result.list.map(toTokenItem));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '令牌列表加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTokens = useMemo(() => {
    const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
    return tokens.filter((item) => {
      if (keyword && !`${item.token}${item.account}`.toLowerCase().includes(keyword)) return false;
      if (query.status === 'valid' && isExpired(item.expireTime)) return false;
      if (query.status === 'expired' && !isExpired(item.expireTime)) return false;
      return true;
    });
  }, [tokens, query]);

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setPageState(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setPageState(1);
  };

  const columns: ColumnsType<TokenItem> = [
    {
      title: '令牌',
      dataIndex: 'token',
      width: 300,
      render: (value: string) => (
        <Text code copyable={{ text: value }}>
          {maskToken(value)}
        </Text>
      ),
    },
    { title: '账户', dataIndex: 'account', width: 220, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'expireTime',
      width: 100,
      render: (value: string) =>
        isExpired(value) ? <Tag color="red">已过期</Tag> : <Tag color="green">有效</Tag>,
    },
    { title: '过期时间', dataIndex: 'expireTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除该令牌吗？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await tokenApi.delete(record.id);
              message.success('删除成功');
              await loadData();
            } catch (error) {
              message.error(error instanceof Error ? error.message : '删除失败');
            }
          }}
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const toolbar = useTableToolbar<TokenItem>(columns, loadData);

  return (
    <PageContainer title="令牌管理" contentBordered={false}>
      <SearchBar
        fields={[
          { name: 'keyword', label: '关键字', placeholder: '令牌 / 账户', width: 240 },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            width: 140,
            options: [
              { value: 'valid', label: '有效' },
              { value: 'expired', label: '已过期' },
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
          dataSource={filteredTokens}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize,
            total: filteredTokens.length,
            onChange: (nextPage, nextPageSize) => {
              setPageState(nextPage);
              setPageSizeState(nextPageSize);
            },
          }}
        />
      </div>
    </PageContainer>
  );
}

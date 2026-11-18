import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Popconfirm, Select, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import type { TokenItem } from './types';

const { Paragraph, Text } = Typography;

const expireOptions = [
  { value: 30, label: '30 天' },
  { value: 90, label: '90 天' },
  { value: 180, label: '180 天' },
  { value: 365, label: '365 天' },
];

interface TokenFormValues {
  account: string;
  days: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function createRandomToken(): string {
  const randomSegment = () => Math.random().toString(36).slice(2, 20);
  return `sk-${randomSegment()}${randomSegment()}`;
}

function createTokens(): TokenItem[] {
  return Array.from({ length: 46 }, (_, index) => ({
    id: index + 1,
    token: createRandomToken(),
    account: `user${index + 1}@example.com`,
    expireTime: formatTime(new Date(Date.now() + (index + 1) * 30 * 86400000)),
  }));
}

function maskToken(token: string): string {
  if (token.length <= 14) return token;
  return `${token.slice(0, 6)}****${token.slice(-6)}`;
}

function isExpired(expireTime: string): boolean {
  const parsed = new Date(expireTime.replace(/-/g, '/'));
  return Number.isNaN(parsed.getTime()) ? false : parsed.getTime() < Date.now();
}

export default function TokenManage() {
  const { message, modal } = App.useApp();
  const [tokens, setTokens] = useState<TokenItem[]>(createTokens);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [form] = Form.useForm<TokenFormValues>();

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

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ days: 30 });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const values = await form.validateFields();
    const token = createRandomToken();
    const expireTime = formatTime(new Date(Date.now() + values.days * 86400000));
    setTokens((prev) => [{ id: Date.now(), token, account: values.account, expireTime }, ...prev]);
    setCreateOpen(false);
    setPageState(1);
    modal.success({
      title: '令牌创建成功',
      content: (
        <div className="pt-2">
          <div className="mb-1 text-12px text-[var(--ant-color-text-tertiary)]">
            请立即复制保存，令牌仅展示一次
          </div>
          <Paragraph code copyable={{ text: token }} className="mb-1! break-all">
            {token}
          </Paragraph>
          <div className="text-12px text-[var(--ant-color-text-tertiary)]">
            账户：{values.account} · 过期时间：{expireTime}
          </div>
        </div>
      ),
    });
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
          onConfirm={() => {
            setTokens((prev) => prev.filter((item) => item.id !== record.id));
            message.success('删除成功');
          }}
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const toolbar = useTableToolbar<TokenItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新会重新生成令牌列表
    await new Promise((resolve) => setTimeout(resolve, 300));
    setTokens(createTokens());
    setPageState(1);
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer
      title="令牌管理"
      contentBordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增令牌
        </Button>
      }
    >
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

      <Modal
        width={520}
        destroyOnHidden
        open={createOpen}
        title="新增令牌"
        okText="创建"
        cancelText="取消"
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="account"
            label="关联账户"
            rules={[
              { required: true, message: '请输入关联账户' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="如：developer@example.com" maxLength={60} />
          </Form.Item>
          <Form.Item
            name="days"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <Select options={expireOptions} placeholder="请选择有效期" />
          </Form.Item>
          <div className="text-12px text-[var(--ant-color-text-tertiary)]">
            创建后令牌仅完整展示一次，请及时复制保存。
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

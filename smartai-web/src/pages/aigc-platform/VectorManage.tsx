import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type EmbedStoreRecord, embedStoreApi } from '@/api/aigc';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import type { VectorDBItem, VectorVendor } from './types';

const vendorColors: Record<VectorVendor, string> = {
  Redis: 'red',
  PgVector: 'blue',
  Milvus: 'green',
};

const vendorCodeMap: Record<string, string> = {
  Redis: 'redis',
  PgVector: 'pgvector',
  Milvus: 'milvus',
};

function toVendorName(provider?: string): VectorVendor {
  const matched = Object.entries(vendorCodeMap).find(
    ([, code]) => code === provider?.toLowerCase(),
  );
  return (matched?.[0] ?? provider ?? 'Milvus') as VectorVendor;
}

function mapRecord(record: EmbedStoreRecord): VectorDBItem {
  const vendor = toVendorName(record.provider);
  return {
    id: record.id,
    alias: record.name,
    vendor,
    providerCode: record.provider,
    dimension: record.dimension ?? 1024,
    host: record.host ?? '',
    port: record.port ?? 0,
    username: record.username,
    password: record.password,
    dbName: record.databaseName,
    tableName: record.tableName,
    redisIndex: vendor === 'Redis' ? record.tableName : undefined,
  };
}

const dimensionOptions = [512, 768, 1024, 1536].map((value) => ({ value, label: `${value}` }));

interface VectorFormValues {
  alias: string;
  vendor: VectorVendor;
  host: string;
  port: number;
  username?: string;
  password?: string;
  dbName?: string;
  tableName?: string;
  redisIndex?: string;
  dimension: number;
}

export default function VectorManage() {
  const { message } = App.useApp();
  const [dataSource, setDataSource] = useState<VectorDBItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VectorDBItem | null>(null);
  const [form] = Form.useForm<VectorFormValues>();
  const vendor = Form.useWatch('vendor', form);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const loadData = useCallback(async () => {
    try {
      const result = await embedStoreApi.list({ pageSize: 100 });
      setDataSource(result.list.map(mapRecord));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '向量库加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
    return dataSource.filter((item) => {
      if (keyword) {
        const haystack = `${item.alias}${item.host}${item.dbName ?? ''}${item.tableName ?? ''}`;
        if (!haystack.toLowerCase().includes(keyword)) return false;
      }
      if (typeof query.vendor === 'string' && item.vendor !== query.vendor) return false;
      if (typeof query.dimension === 'string' && String(item.dimension) !== query.dimension) {
        return false;
      }
      return true;
    });
  }, [dataSource, query]);

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setPageState(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setPageState(1);
  };

  const openModal = (record?: VectorDBItem) => {
    setEditing(record ?? null);
    setOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.alias,
      provider: vendorCodeMap[values.vendor] ?? values.vendor.toLowerCase(),
      host: values.host,
      port: values.port,
      dimension: values.dimension,
      username: values.vendor === 'Milvus' ? undefined : values.username,
      password: values.vendor === 'Milvus' ? undefined : values.password,
      databaseName: values.vendor === 'Redis' ? undefined : values.dbName,
      tableName: values.vendor === 'Redis' ? values.redisIndex : values.tableName,
    };
    try {
      if (editing) {
        await embedStoreApi.update({ ...payload, id: editing.id });
        message.success('编辑向量库成功');
      } else {
        await embedStoreApi.create(payload);
        message.success('新增向量库成功');
      }
      handleCancel();
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存向量库失败');
    }
  };

  const columns: ColumnsType<VectorDBItem> = [
    { title: '数据库别名', dataIndex: 'alias', width: 130 },
    {
      title: '供应商',
      dataIndex: 'vendor',
      width: 100,
      render: (value: VectorVendor) => <Tag color={vendorColors[value]}>{value}</Tag>,
    },
    { title: '向量纬度', dataIndex: 'dimension', width: 100 },
    { title: '数据库地址', dataIndex: 'host', width: 140 },
    { title: '数据库端口', dataIndex: 'port', width: 100 },
    { title: '数据库用户名', dataIndex: 'username', width: 120, render: (value) => value || '-' },
    { title: '数据库密码', dataIndex: 'password', width: 120, render: (value) => value || '-' },
    { title: '数据库名', dataIndex: 'dbName', width: 120, render: (value) => value || '-' },
    { title: '表名称', dataIndex: 'tableName', width: 130, render: (value) => value || '-' },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button type="link" size="small" onClick={() => openModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定删除向量库「${record.alias}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await embedStoreApi.delete(record.id);
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
        </div>
      ),
    },
  ];

  const toolbar = useTableToolbar<VectorDBItem>(columns, loadData);

  return (
    <PageContainer
      title="向量库管理"
      contentBordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          新增向量库
        </Button>
      }
    >
      <SearchBar
        fields={[
          { name: 'keyword', label: '关键字', placeholder: '别名 / 地址 / 库表名', width: 220 },
          {
            name: 'vendor',
            label: '供应商',
            type: 'select',
            options: [
              { value: 'Redis', label: 'Redis' },
              { value: 'PgVector', label: 'PgVector' },
              { value: 'Milvus', label: 'Milvus' },
            ],
          },
          {
            name: 'dimension',
            label: '向量纬度',
            type: 'select',
            options: dimensionOptions.map((item) => ({
              value: String(item.value),
              label: item.label,
            })),
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
          dataSource={filteredRecords}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total: filteredRecords.length,
            onChange: (nextPage, nextPageSize) => {
              setPageState(nextPage);
              setPageSizeState(nextPageSize);
            },
          }}
        />
      </div>

      <Modal
        width={600}
        destroyOnHidden
        open={open}
        title={editing ? '编辑向量库' : '新增向量库'}
        onCancel={handleCancel}
        onOk={handleOk}
        okText="确定"
        cancelText="取消"
      >
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          title="注意：请慎重修改模型的向量纬度参数（Dimension），此参数需要和向量库匹配（错误修改可能将影响已有的向量数据）"
        />
        <Form form={form} layout="vertical" initialValues={{ dimension: 1024 }}>
          <Form.Item
            name="vendor"
            label="供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select
              placeholder="请选择供应商"
              options={[
                { value: 'Redis', label: 'Redis' },
                { value: 'PgVector', label: 'PgVector' },
                { value: 'Milvus', label: 'Milvus' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="alias"
            label="数据库别名"
            rules={[{ required: true, message: '请输入数据库别名' }]}
          >
            <Input placeholder="请输入数据库别名" />
          </Form.Item>
          <Form.Item
            name="host"
            label="数据库地址"
            rules={[{ required: true, message: '请输入数据库地址' }]}
          >
            <Input placeholder="请输入数据库地址" />
          </Form.Item>
          <Form.Item
            name="port"
            label="数据库端口"
            rules={[{ required: true, message: '请输入数据库端口' }]}
          >
            <InputNumber min={1} max={65535} className="w-full!" placeholder="请输入数据库端口" />
          </Form.Item>
          {vendor === 'Redis' ? (
            <Form.Item
              name="redisIndex"
              label="Redis库索引名"
              rules={[{ required: true, message: '请输入Redis库索引名' }]}
            >
              <Input placeholder="请输入Redis库索引名" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="dbName"
                label="数据库名"
                rules={[{ required: true, message: '请输入数据库名' }]}
              >
                <Input placeholder="请输入数据库名" />
              </Form.Item>
              <Form.Item
                name="tableName"
                label="表名称"
                rules={[{ required: true, message: '请输入表名称' }]}
              >
                <Input placeholder="请输入表名称" />
              </Form.Item>
            </>
          )}
          {vendor !== 'Milvus' && (
            <>
              <Form.Item name="username" label="数据库用户名">
                <Input placeholder="请输入数据库用户名" />
              </Form.Item>
              <Form.Item name="password" label="数据库密码">
                <Input.Password placeholder="请输入数据库密码" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="dimension"
            label={
              <span className="flex items-center gap-1">
                向量纬度
                <Tooltip title="慎重修改此参数，纬度高会消耗更多的算力，但纬度高并不代表搜索更精确">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: '请选择向量纬度' }]}
          >
            <Select options={dimensionOptions} placeholder="请选择向量纬度" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

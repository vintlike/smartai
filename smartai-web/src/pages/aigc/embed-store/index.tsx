import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps, TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Tag,
} from 'antd';
import { useMemo, useState } from 'react';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { EmbedStoreItem } from '@/services/mock-data';
import { mockEmbedStores } from '@/services/mock-data';
import '@/pages/aigc/embed-store/embed-store.less';

type Vendor = 'Redis' | 'PgVector' | 'Milvus';

const vendorDefaults: Record<Vendor, { port: string; database?: string; table?: string }> = {
  Redis: { port: '6379' },
  PgVector: { port: '5432', database: 'smartai', table: 'embedding' },
  Milvus: { port: '19530', database: 'default', table: 'embedding' },
};

/** 向量库管理：按供应商新增 Redis / PgVector / Milvus 配置 */
export default function EmbedStorePage() {
  const { message, modal } = App.useApp();
  const [rows, setRows] = useState<EmbedStoreItem[]>(mockEmbedStores);
  const [alias, setAlias] = useState('');
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState<Vendor>('PgVector');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<EmbedStoreItem>>(
    () => [
      { title: '数据库别名', dataIndex: 'alias', key: 'alias' },
      {
        title: '供应商',
        dataIndex: 'provider',
        key: 'provider',
        render: (value: string) => <Tag color="processing">{value}</Tag>,
      },
      { title: '向量纬度', dataIndex: 'dimension', key: 'dimension', width: 100 },
      { title: '数据库地址', dataIndex: 'host', key: 'host' },
      { title: '数据库端口', dataIndex: 'port', key: 'port', width: 110 },
      {
        title: '数据库用户名',
        dataIndex: 'username',
        key: 'username',
        render: (value?: string) => value || '-',
      },
      {
        title: '数据库密码',
        dataIndex: 'password',
        key: 'password',
        render: (value?: string) => (value ? '••••••' : '-'),
      },
      {
        title: '数据库名',
        dataIndex: 'database',
        key: 'database',
        render: (value?: string) => value || '-',
      },
      {
        title: '表名称',
        dataIndex: 'table',
        key: 'table',
        render: (value?: string) => value || '-',
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_, record) => (
          <div className="sa-row-actions">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record)}
            />
          </div>
        ),
      },
    ],
    // 行操作只依赖稳定的状态函数
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const state = useTableToolbar(columns);

  const vendorItems: MenuProps['items'] = (['Redis', 'PgVector', 'Milvus'] as Vendor[]).map(
    (item) => ({ key: item, label: item }),
  );

  function openCreate(nextVendor: Vendor) {
    setEditingId(null);
    setVendor(nextVendor);
    form.resetFields();
    form.setFieldsValue({
      provider: nextVendor,
      port: vendorDefaults[nextVendor].port,
      database: vendorDefaults[nextVendor].database,
      table: vendorDefaults[nextVendor].table,
      dimension: 1024,
    });
    setOpen(true);
  }

  function openEdit(record: EmbedStoreItem) {
    setEditingId(record.id);
    setVendor(record.provider as Vendor);
    form.setFieldsValue({
      alias: record.alias,
      provider: record.provider,
      host: record.host,
      port: record.port,
      database: record.database,
      table: record.table,
      username: record.username,
      password: record.password,
      dimension: record.dimension,
    });
    setOpen(true);
  }

  function confirmDelete(record: EmbedStoreItem) {
    modal.confirm({
      title: '删除向量库',
      content: `确定要删除「${record.alias}」吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRows((list) => list.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  }

  const submit = async () => {
    const values = await form.validateFields();
    const record: EmbedStoreItem = {
      id: editingId ?? `store-${Date.now()}`,
      alias: values.alias,
      provider: vendor,
      dimension: Number(values.dimension),
      host: values.host,
      port: values.port,
      database: vendor === 'Redis' ? values.redisIndex : values.database,
      table: vendor === 'Redis' ? '' : values.table,
      username: values.username,
      password: values.password,
    };
    setRows((list) =>
      editingId ? list.map((item) => (item.id === editingId ? record : item)) : [...list, record],
    );
    setOpen(false);
    message.success('保存成功');
  };

  return (
    <PageContainer>
      <FilterBar onReset={() => setAlias('')}>
        <FilterItem label="数据库别名">
          <Input
            placeholder="请输入数据库别名"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <Alert
        type="warning"
        showIcon
        title="注意：请慎重修改模型的向量纬度参数（Dimension），此参数需要和向量库匹配（错误修改可能将影响已有的向量数据）"
      />

      <DataTable<EmbedStoreItem>
        state={state}
        dataSource={rows.filter((item) => item.alias.includes(alias.trim()))}
        toolbarExtra={
          <Dropdown
            trigger={['click']}
            menu={{ items: vendorItems, onClick: ({ key }) => openCreate(key as Vendor) }}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              新增向量数据库
            </Button>
          </Dropdown>
        }
      />

      <Modal
        title={editingId ? '编辑向量数据库' : '新增向量数据库'}
        open={open}
        width={640}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={submit}>
            提交
          </Button>,
          <Button key="reset" onClick={() => form.resetFields()}>
            重置
          </Button>,
        ]}
      >
        <Alert
          className="sa-embed-form__alert"
          type="warning"
          showIcon
          title="请慎重修改向量纬度参数（Dimension），此参数需要和向量库匹配"
        />
        <Form form={form} layout="vertical" className="sa-form-grid">
          <Form.Item
            name="alias"
            label="数据库别名"
            rules={[{ required: true, message: '请输入数据库别名' }]}
          >
            <Input placeholder="请输入数据库别名" />
          </Form.Item>
          <Form.Item name="provider" label="供应商" rules={[{ required: true }]}>
            <Select
              options={['Redis', 'PgVector', 'Milvus'].map((v) => ({ label: v, value: v }))}
              onChange={(value: Vendor) => setVendor(value)}
            />
          </Form.Item>
          <Form.Item
            name="host"
            label="数据库地址"
            rules={[{ required: true, message: '请输入数据库地址' }]}
          >
            <Input placeholder="127.0.0.1" />
          </Form.Item>
          <Form.Item
            name="port"
            label="数据库端口"
            rules={[{ required: true, message: '请输入数据库端口' }]}
          >
            <Input placeholder="5432" />
          </Form.Item>

          {vendor === 'Redis' ? (
            <Form.Item
              name="redisIndex"
              label="Redis库索引名"
              rules={[{ required: true, message: '请输入库索引名' }]}
            >
              <Input placeholder="0" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="database"
                label="数据库名"
                rules={[{ required: true, message: '请输入数据库名' }]}
              >
                <Input placeholder="smartai" />
              </Form.Item>
              <Form.Item
                name="table"
                label="表名称"
                rules={vendor === 'PgVector' ? [{ required: true, message: '请输入表名称' }] : []}
              >
                <Input placeholder="embedding" />
              </Form.Item>
            </>
          )}

          <Form.Item name="username" label="数据库用户名">
            <Input placeholder="请输入数据库用户名" />
          </Form.Item>
          <Form.Item name="password" label="数据库密码">
            <Input.Password placeholder="请输入数据库密码" />
          </Form.Item>
          <Form.Item
            name="dimension"
            label="向量纬度"
            rules={[{ required: true, message: '请输入向量纬度' }]}
          >
            <InputNumber min={1} max={4096} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

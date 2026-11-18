import { EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Slider,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockChatModels } from '../mockData';
import type { ChatModelItem } from '../types';
import SupplierFormModal, { type SupplierFormValues } from './SupplierFormModal';

const versionOptions = [
  { value: 'gpt-4o', label: 'gpt-4o' },
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
  { value: 'gpt-4', label: 'gpt-4' },
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
  { value: 'qwen-max', label: 'qwen-max' },
  { value: 'qwen-plus', label: 'qwen-plus' },
  { value: 'ERNIE-4.0', label: 'ERNIE-4.0' },
];

interface ChatModelFormValues {
  supplier: string;
  version: string[];
  baseUrl: string;
  alias: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}

interface SupplierItem extends SupplierFormValues {
  remark?: string;
}

const initialSuppliers: SupplierItem[] = [
  { name: 'OpenAI', code: 'openai', remark: '官方 OpenAI 接口' },
  { name: 'Azure OpenAI', code: 'azure-openai', remark: '微软云 OpenAI 服务' },
  { name: '通义千问', code: 'qwen', remark: '阿里云百炼平台' },
  { name: '文心一言', code: 'ernie', remark: '百度智能云千帆平台' },
];

function labelWithTip(text: string, tip: string) {
  return (
    <span className="inline-flex items-center gap-1">
      {text}
      <Tooltip title={tip}>
        <QuestionCircleOutlined className="text-[var(--ant-color-text-quaternary)]" />
      </Tooltip>
    </span>
  );
}

export default function ChatModelTab() {
  const { message } = App.useApp();
  const [models, setModels] = useState<ChatModelItem[]>(mockChatModels);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(initialSuppliers);
  const [activeSupplier, setActiveSupplier] = useState(initialSuppliers[0].name);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ChatModelItem | null>(null);
  const [form] = Form.useForm<ChatModelFormValues>();

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const currentModels = models.filter((item) => item.supplier === activeSupplier);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      supplier: activeSupplier,
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
    });
    setDrawerOpen(true);
  };

  const openEdit = (record: ChatModelItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      supplier: record.supplier,
      version: [record.version],
      baseUrl: record.baseUrl,
      alias: record.alias,
      apiKey: record.apiKey,
      maxTokens: record.maxTokens,
      temperature: record.temperature,
      topP: record.topP,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      supplier: values.supplier,
      version: values.version[0],
      baseUrl: values.baseUrl,
      alias: values.alias,
      apiKey: values.apiKey,
      maxTokens: values.maxTokens,
      temperature: values.temperature,
      topP: values.topP,
    };
    if (editing) {
      setModels((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...item, ...payload } : item)),
      );
      message.success('编辑模型成功');
    } else {
      setModels((prev) => [{ id: `cm-${Date.now()}`, ...payload }, ...prev]);
      message.success('新增模型成功');
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleSupplierSubmit = (values: SupplierFormValues) => {
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((item) => (item.name === editingSupplier.name ? { ...item, ...values } : item)),
      );
      setModels((prev) =>
        prev.map((item) =>
          item.supplier === editingSupplier.name ? { ...item, supplier: values.name } : item,
        ),
      );
      if (activeSupplier === editingSupplier.name) setActiveSupplier(values.name);
      message.success('编辑模型供应商成功');
    } else {
      setSuppliers((prev) => [...prev, values]);
      setActiveSupplier(values.name);
      message.success('新增模型供应商成功');
    }
    setSupplierOpen(false);
    setEditingSupplier(null);
  };

  const columns: ColumnsType<ChatModelItem> = [
    {
      title: '模型版本',
      dataIndex: 'version',
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '回复上限',
      dataIndex: 'maxTokens',
      render: (value: number) => `${value} tokens`,
    },
    {
      title: '生成随机性',
      dataIndex: 'temperature',
      render: (value: number) => (
        <InputNumber size="small" min={0} max={2} step={0.1} value={value} disabled />
      ),
    },
    {
      title: 'Top P',
      dataIndex: 'topP',
      render: (value: number) => (
        <InputNumber size="small" min={0} max={1} step={0.05} value={value} disabled />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该版本？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => {
              setModels((prev) => prev.filter((item) => item.id !== record.id));
              message.success('删除成功');
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

  const toolbar = useTableToolbar<ChatModelItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为按供应商查询
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  return (
    <div>
      <Alert
        type="info"
        showIcon
        className="mb-4"
        title="对于完全适配OpenAI接口格式的模型都可在OpenAI中配置（只需要定义BaseUrl）"
      />
      <div className="flex gap-4">
        <div className="w-220px flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-14px font-600">模型供应商</span>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSupplier(null);
                setSupplierOpen(true);
              }}
            >
              新增
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {suppliers.map((item) => {
              const count = models.filter((model) => model.supplier === item.name).length;
              const active = item.name === activeSupplier;
              return (
                <div
                  key={item.code}
                  className={`group flex items-center gap-1 px-3 py-2 rounded-6px text-14px cursor-pointer ${
                    active
                      ? 'bg-[var(--ant-color-primary-bg)] text-[var(--ant-color-primary)] font-500'
                      : 'hover:bg-[var(--ant-color-bg-text-hover)]'
                  }`}
                  onClick={() => setActiveSupplier(item.name)}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-12px text-[var(--ant-color-text-quaternary)]">
                    ({count})
                  </span>
                  <EditOutlined
                    className="ml-auto hidden group-hover:inline-flex text-12px"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingSupplier(item);
                      setSupplierOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-14px font-600">{activeSupplier} 模型列表</span>
            <Button type="primary" size="small" onClick={openCreate}>
              新增模型
            </Button>
          </div>
          <DataTable
            rowKey="id"
            state={toolbar}
            dataSource={currentModels}
            scroll={{ x: 800 }}
            pagination={false}
          />
        </div>
      </div>

      <Drawer
        size={480}
        open={drawerOpen}
        title={editing ? '编辑模型' : '新增模型'}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        extra={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setDrawerOpen(false);
                setEditing(null);
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              确定
            </Button>
          </div>
        }
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            name="supplier"
            label="模型供应商"
            rules={[{ required: true, message: '请选择模型供应商' }]}
          >
            <Select
              placeholder="请选择模型供应商"
              options={suppliers.map((item) => ({ value: item.name, label: item.name }))}
            />
          </Form.Item>
          <Form.Item
            name="version"
            label={labelWithTip('模型版本', '该LLM供应商对应的模型版本号')}
            rules={[{ required: true, message: '请选择或输入模型版本' }]}
          >
            <Select
              showSearch
              mode="tags"
              maxCount={1}
              tokenSeparators={[',']}
              placeholder="请选择或输入模型版本"
              options={versionOptions}
              filterOption={(input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label={labelWithTip('BaseUrl', '模型的基础请求URL地址（或中转地址）')}
            rules={[{ required: true, message: '请输入BaseUrl' }]}
          >
            <Input placeholder="请输入BaseUrl" />
          </Form.Item>
          <Form.Item
            name="alias"
            label="模型别名"
            rules={[{ required: true, message: '请输入模型别名' }]}
          >
            <Input placeholder="请输入模型别名" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label={labelWithTip('Api Key', '模型的ApiKey')}
            rules={[{ required: true, message: '请输入Api Key' }]}
          >
            <Input.Password placeholder="请输入Api Key" />
          </Form.Item>
          <Form.Item
            name="maxTokens"
            label={labelWithTip(
              '回复上限',
              '控制模型输出的Tokens长度上限。通常 100 Tokens 约等于150个中文汉字',
            )}
          >
            <Slider min={100} max={8000} step={100} />
          </Form.Item>
          <Form.Item
            name="temperature"
            label={labelWithTip(
              '生成随机性',
              '调高参数会使得模型的输出更多样性和创新性，反之降低参数将会减少多样性',
            )}
          >
            <Slider min={0} max={2} step={0.1} />
          </Form.Item>
          <Form.Item
            name="topP"
            label={labelWithTip(
              'Top P',
              '模型在生成输出时会从概率最高的词汇开始选择，直到这些词汇的总概率累积达到Top p值。这样可以限制模型只选择这些高概率的词汇，从而控制输出内容的多样性。建议不要与"生成随机性"同时调整',
            )}
          >
            <Slider min={0} max={1} step={0.05} />
          </Form.Item>
        </Form>
      </Drawer>

      <SupplierFormModal
        open={supplierOpen}
        supplier={editingSupplier}
        onCancel={() => {
          setSupplierOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleSupplierSubmit}
      />
    </div>
  );
}

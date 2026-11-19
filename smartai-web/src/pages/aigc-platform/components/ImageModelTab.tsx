import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Drawer, Form, Input, Popconfirm, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import type { ModelProviderRecord, ModelRecord } from '@/api/aigc';
import { modelApi, modelProviderApi } from '@/api/aigc';
import { DataTable } from '@/components/DataTable';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import type { ImageModelItem } from '../types';
import SupplierFormModal, { type SupplierFormValues } from './SupplierFormModal';

const versionOptions = [
  { value: 'dall-e-3', label: 'dall-e-3' },
  { value: 'dall-e-2', label: 'dall-e-2' },
  { value: 'stable-diffusion-v1.5', label: 'stable-diffusion-v1.5' },
  { value: 'stable-diffusion-xl', label: 'stable-diffusion-xl' },
  { value: 'midjourney-v5', label: 'midjourney-v5' },
];

const imageSizeOptions = [
  { value: '1024*1024', label: '1024*1024' },
  { value: '1024*1792', label: '1024*1792' },
  { value: '1792*1024', label: '1792*1024' },
];

const imageQualityOptions = [
  { value: 'standard', label: 'standard' },
  { value: 'hd', label: 'hd' },
];

const imageStyleOptions = [
  { value: 'vivid', label: 'vivid' },
  { value: 'natural', label: 'natural' },
];

interface ImageFormValues {
  name: string;
  version: string[];
  baseUrl: string;
  alias: string;
  apiKey: string;
  imageSize: string;
  imageQuality: string;
  imageStyle: string;
}

interface SupplierItem extends SupplierFormValues {
  id: string;
  remark?: string;
}

function toViewModel(record: ModelRecord, suppliers: ModelProviderRecord[]): ImageModelItem {
  return {
    id: record.id,
    name: suppliers.find((item) => item.code === record.provider)?.name ?? record.provider ?? '',
    alias: record.name,
    version: record.model,
    apiKey: record.apiKey ?? '',
    endpoint: record.baseUrl ?? record.endpoint ?? '',
    deploymentName: record.azureDeploymentName ?? '',
    imageSize: record.imageSize,
    imageQuality: record.imageQuality,
    imageStyle: record.imageStyle,
  };
}

export default function ImageModelTab() {
  const { message } = App.useApp();
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [suppliers, setSuppliers] = useState<ModelProviderRecord[]>([]);
  const [activeSupplier, setActiveSupplier] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ImageModelItem | null>(null);
  const [form] = Form.useForm<ImageFormValues>();

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [providerResult, modelResult] = await Promise.all([
        modelProviderApi.list({ pageSize: 100 }),
        modelApi.list({ type: 'image', pageSize: 100 }),
      ]);
      setSuppliers(providerResult.list);
      setModels(modelResult.list);
      setActiveSupplier((prev) => {
        if (prev && providerResult.list.some((item) => item.name === prev)) return prev;
        return providerResult.list[0]?.name ?? '';
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '模型列表加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentModels = models
    .filter((item) => {
      const providerName =
        suppliers.find((provider) => provider.code === item.provider)?.name ?? item.provider;
      return providerName === activeSupplier;
    })
    .map((item) => toViewModel(item, suppliers));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      name: activeSupplier,
      imageSize: '1024*1024',
      imageQuality: 'standard',
      imageStyle: 'vivid',
    });
    setDrawerOpen(true);
  };

  const openEdit = (record: ImageModelItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      version: [record.version],
      baseUrl: record.endpoint,
      alias: record.alias,
      apiKey: record.apiKey,
      imageSize: record.imageSize ?? '1024*1024',
      imageQuality: record.imageQuality ?? 'standard',
      imageStyle: record.imageStyle ?? 'vivid',
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const provider = suppliers.find((item) => item.name === values.name)?.code;
    const payload = {
      type: 'image',
      provider: provider ?? values.name,
      model: values.version[0],
      name: values.alias,
      baseUrl: values.baseUrl,
      endpoint: values.baseUrl,
      apiKey: values.apiKey,
      azureDeploymentName: values.alias,
      imageSize: values.imageSize,
      imageQuality: values.imageQuality,
      imageStyle: values.imageStyle,
      status: 1,
      showStatus: 1,
    };
    try {
      if (editing) {
        await modelApi.update({ ...payload, id: editing.id });
        message.success('编辑模型成功');
      } else {
        await modelApi.create(payload);
        message.success('新增模型成功');
      }
      setDrawerOpen(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存模型失败');
    }
  };

  const handleSupplierSubmit = async (values: SupplierFormValues) => {
    try {
      if (editingSupplier) {
        await modelProviderApi.update({ ...values, id: editingSupplier.id });
        message.success('编辑模型供应商成功');
      } else {
        await modelProviderApi.create(values);
        setActiveSupplier(values.name);
        message.success('新增模型供应商成功');
      }
      setSupplierOpen(false);
      setEditingSupplier(null);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存供应商失败');
    }
  };

  const columns: ColumnsType<ImageModelItem> = [
    { title: '模型别名', dataIndex: 'alias' },
    { title: '模型版本', dataIndex: 'version' },
    {
      title: 'Api Key',
      dataIndex: 'apiKey',
      render: (value: string) => (
        <span className="text-[var(--ant-color-text-secondary)]">{value}</span>
      ),
    },
    { title: 'Endpoint', dataIndex: 'endpoint', ellipsis: true },
    { title: 'Deployment Name', dataIndex: 'deploymentName' },
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
            onConfirm={async () => {
              try {
                await modelApi.delete(record.id);
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

  const toolbar = useTableToolbar<ImageModelItem>(columns, loadData);

  return (
    <div>
      <Alert
        type="info"
        showIcon
        className="mb-4"
        title="鉴于很多模型的文生图效果很差甚至没有，这里只建议使用OpenAI的DALL-E模型"
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
              const count = models.filter((model) => {
                const providerName =
                  suppliers.find((provider) => provider.code === model.provider)?.name ??
                  model.provider;
                return providerName === item.name;
              }).length;
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
            scroll={{ x: 1000 }}
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
            name="name"
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
            label="模型版本"
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
            label="BaseUrl"
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
            label="Api Key"
            rules={[{ required: true, message: '请输入Api Key' }]}
          >
            <Input.Password placeholder="请输入Api Key" />
          </Form.Item>
          <Form.Item name="imageSize" label="图片尺寸">
            <Select options={imageSizeOptions} />
          </Form.Item>
          <Form.Item name="imageQuality" label="图片质量">
            <Select options={imageQualityOptions} />
          </Form.Item>
          <Form.Item name="imageStyle" label="图片风格">
            <Select options={imageStyleOptions} />
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

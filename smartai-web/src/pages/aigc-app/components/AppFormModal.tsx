import { CloudUploadOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select, Upload } from 'antd';
import { useEffect } from 'react';
import type { AIApp, ModelOption } from '../types';

export interface AppFormValues {
  name: string;
  model: string;
  logo: string;
  description: string;
  cover?: Array<{ originFileObj?: File }>;
}

export interface AppFormModalProps {
  open: boolean;
  app?: AIApp | null;
  modelOptions: ModelOption[];
  onCancel: () => void;
  onSubmit: (values: AppFormValues) => void | Promise<void>;
}

const logoOptions = [
  { value: '🤖', label: '🤖 机器人' },
  { value: '✍️', label: '✍️ 写作' },
  { value: '🔍', label: '🔍 搜索' },
  { value: '📊', label: '📊 数据' },
  { value: '💬', label: '💬 对话' },
  { value: '🎯', label: '🎯 目标' },
  { value: '📝', label: '📝 笔记' },
  { value: '🧠', label: '🧠 智能' },
  { value: '⚡', label: '⚡ 效率' },
  { value: '🛠️', label: '🛠️ 工具' },
];

export default function AppFormModal({
  open,
  app,
  modelOptions,
  onCancel,
  onSubmit,
}: AppFormModalProps) {
  const [form] = Form.useForm<AppFormValues>();

  useEffect(() => {
    if (!open) return;
    if (app) {
      form.setFieldsValue({
        name: app.name,
        model: app.model,
        logo: app.logo,
        description: app.description,
      });
    } else {
      form.resetFields();
    }
  }, [open, app, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      width={600}
      destroyOnHidden
      open={open}
      title={app ? '编辑应用' : '创建应用'}
      okText={app ? '保存' : '创建'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="name"
          label="应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称" maxLength={50} showCount />
        </Form.Item>
        <Form.Item
          name="model"
          label="关联模型"
          rules={[{ required: true, message: '请选择关联模型' }]}
        >
          <Select placeholder="请选择关联模型" options={modelOptions} />
        </Form.Item>
        <Form.Item
          name="logo"
          label="应用 LOGO"
          rules={[{ required: true, message: '请选择应用 LOGO' }]}
        >
          <Select placeholder="请选择应用 LOGO" options={logoOptions} />
        </Form.Item>
        <Form.Item
          name="cover"
          label="应用封面"
          valuePropName="fileList"
          getValueFromEvent={(event) => event?.fileList}
        >
          <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
            <div className="flex flex-col items-center gap-1">
              <CloudUploadOutlined />
              <span>上传封面</span>
            </div>
          </Upload>
        </Form.Item>
        <Form.Item
          name="description"
          label="应用简介"
          rules={[{ required: true, message: '请输入应用简介' }]}
        >
          <Input.TextArea placeholder="请输入应用简介" rows={3} maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

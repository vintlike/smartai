import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { KnowledgeBaseItem } from '../types';

export interface KnowledgeFormValues {
  name: string;
  vectorDb: string;
  embeddingModel: string;
  description: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export interface KnowledgeFormModalProps {
  open: boolean;
  knowledge?: KnowledgeBaseItem | null;
  vectorDbOptions: SelectOption[];
  embeddingModelOptions: SelectOption[];
  onCancel: () => void;
  onSubmit: (values: KnowledgeFormValues) => void;
}

export default function KnowledgeFormModal({
  open,
  knowledge,
  vectorDbOptions,
  embeddingModelOptions,
  onCancel,
  onSubmit,
}: KnowledgeFormModalProps) {
  const [form] = Form.useForm<KnowledgeFormValues>();

  useEffect(() => {
    if (!open) return;
    if (knowledge) {
      form.setFieldsValue({
        name: knowledge.name,
        vectorDb: knowledge.embedStoreId ?? knowledge.vectorDb,
        embeddingModel: knowledge.embedModelId ?? knowledge.embeddingModel,
        description: knowledge.description,
      });
    } else {
      form.resetFields();
    }
  }, [open, knowledge, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      width={520}
      destroyOnHidden
      open={open}
      title={knowledge ? '编辑知识库' : '创建知识库'}
      okText={knowledge ? '保存' : '创建'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="name"
          label="知识库名称"
          rules={[{ required: true, message: '请输入知识库名称' }]}
        >
          <Input placeholder="请输入知识库名称" maxLength={50} showCount />
        </Form.Item>
        <Form.Item
          name="vectorDb"
          label="向量数据库"
          rules={[{ required: true, message: '请选择向量数据库' }]}
        >
          <Select placeholder="请选择向量数据库" options={vectorDbOptions} />
        </Form.Item>
        <Form.Item
          name="embeddingModel"
          label="向量模型"
          rules={[{ required: true, message: '请选择向量模型' }]}
        >
          <Select placeholder="请选择向量模型" options={embeddingModelOptions} />
        </Form.Item>
        <Form.Item
          name="description"
          label="知识库描述"
          rules={[{ required: true, message: '请输入知识库描述' }]}
        >
          <Input.TextArea placeholder="请输入知识库描述" rows={3} maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

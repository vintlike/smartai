import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

export interface SupplierFormValues {
  name: string;
  code: string;
  remark?: string;
}

export interface SupplierFormModalProps {
  open: boolean;
  supplier?: SupplierFormValues | null;
  onCancel: () => void;
  onSubmit: (values: SupplierFormValues) => void;
}

export default function SupplierFormModal({
  open,
  supplier,
  onCancel,
  onSubmit,
}: SupplierFormModalProps) {
  const [form] = Form.useForm<SupplierFormValues>();

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      form.setFieldsValue(supplier);
    } else {
      form.resetFields();
    }
  }, [open, supplier, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      width={520}
      destroyOnHidden
      open={open}
      title={supplier ? '编辑模型供应商' : '新增模型供应商'}
      okText={supplier ? '保存' : '确定'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="name"
          label="供应商名称"
          rules={[{ required: true, message: '请输入供应商名称' }]}
        >
          <Input placeholder="请输入供应商名称" maxLength={50} showCount />
        </Form.Item>
        <Form.Item
          name="code"
          label="供应商标识"
          rules={[{ required: true, message: '请输入供应商标识' }]}
        >
          <Input placeholder="请输入供应商标识，例如：openai" maxLength={50} />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="请输入备注信息" rows={3} maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

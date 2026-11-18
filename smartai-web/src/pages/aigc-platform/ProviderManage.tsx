import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { type ModelProviderRecord, modelProviderApi } from '@/api/aigc';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import { useTableQuery } from '@/hooks/useTableQuery';
import { useTableToolbar } from '@/hooks/useTableToolbar';

// TODO: 接入权限体系后根据当前登录用户的角色动态计算
const isAdmin = true;

interface ProviderFormValues {
  name: string;
  code: string;
  remark?: string;
}

export default function ProviderManage() {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModelProviderRecord | null>(null);
  const [form] = Form.useForm<ProviderFormValues>();
  const { dataSource, total, loading, error, page, pageSize, setPage, refresh } =
    useTableQuery<ModelProviderRecord>({
      fetcher: (query) => modelProviderApi.list(query),
    });

  useEffect(() => {
    if (error) message.error('获取供应商列表失败');
  }, [error, message]);

  const openModal = (record?: ModelProviderRecord) => {
    setEditing(record ?? null);
    setOpen(true);
    if (record) {
      form.setFieldsValue({ name: record.name, code: record.code, remark: record.remark });
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
    try {
      if (editing) {
        await modelProviderApi.update(editing.id, values);
        message.success('编辑成功');
      } else {
        await modelProviderApi.create(values);
        message.success('新增成功');
      }
      handleCancel();
      refresh();
    } catch {
      message.error(editing ? '编辑失败' : '新增失败');
    }
  };

  const handleDelete = async (record: ModelProviderRecord) => {
    try {
      await modelProviderApi.delete(record.id);
      message.success('删除成功');
      refresh();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<ModelProviderRecord> = [
    { title: '供应商名称', dataIndex: 'name', width: 200 },
    { title: '供应商标识', dataIndex: 'code', width: 180 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', width: 180, render: (value) => value || '-' },
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
            description={`确定删除供应商「${record.name}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const toolbar = useTableToolbar<ModelProviderRecord>(columns, refresh);

  return (
    <PageContainer
      title="模型供应商管理"
      extra={
        isAdmin ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增供应商
          </Button>
        ) : undefined
      }
    >
      <DataTable
        rowKey="id"
        bordered
        state={toolbar}
        loading={loading}
        dataSource={dataSource}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (nextPage, nextPageSize) => setPage(nextPage, nextPageSize),
        }}
      />

      {open && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={handleCancel}
        >
          <div
            className="rounded-8px bg-[var(--ant-color-bg-container)] p-6"
            style={{ width: 520 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 text-16px font-500">
              {editing ? '编辑模型供应商' : '新增模型供应商'}
            </div>
            <Form form={form} layout="vertical">
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
                <Input placeholder="请输入供应商标识，例如：openai" />
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea placeholder="请输入备注" rows={3} maxLength={200} showCount />
              </Form.Item>
            </Form>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" onClick={handleOk}>
                {editing ? '保存' : '确定'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

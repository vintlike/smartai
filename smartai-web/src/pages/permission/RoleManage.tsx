import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Tree } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { menuPermissionTree, mockRoles } from './mockData';
import type { RoleItem } from './types';

interface RoleFormValues {
  roleName: string;
  roleKey: string;
  roleDesc?: string;
  menuPermissions: string[];
}

export default function RoleManage() {
  const { message, modal } = App.useApp();
  const [roles, setRoles] = useState<RoleItem[]>(mockRoles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [form] = Form.useForm<RoleFormValues>();
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const filteredRoles = useMemo(() => {
    const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
    return roles.filter((item) => {
      if (keyword) {
        const haystack = `${item.roleName}${item.roleKey}${item.roleDesc ?? ''}`;
        if (!haystack.toLowerCase().includes(keyword)) return false;
      }
      return true;
    });
  }, [roles, query]);

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setPageState(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setPageState(1);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ menuPermissions: [] });
    setModalOpen(true);
  };

  const openEdit = (record: RoleItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      roleName: record.roleName,
      roleKey: record.roleKey,
      roleDesc: record.roleDesc,
      menuPermissions: record.menuPermissions,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      setRoles((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...item, ...values } : item)),
      );
      message.success('编辑角色成功');
    } else {
      setRoles((prev) => [
        { id: `role-${Date.now()}`, ...values, roleDesc: values.roleDesc ?? '' },
        ...prev,
      ]);
      message.success('新建角色成功');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = (record: RoleItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${record.roleName}」吗？删除后关联用户将失去该角色权限。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRoles((prev) => prev.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<RoleItem> = [
    { title: '角色名称', dataIndex: 'roleName', width: 200 },
    { title: '角色标识', dataIndex: 'roleKey', width: 200 },
    { title: '角色描述', dataIndex: 'roleDesc', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => confirmDelete(record)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  const toolbar = useTableToolbar<RoleItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer
      title="角色管理"
      contentBordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建角色
        </Button>
      }
    >
      <SearchBar
        fields={[
          { name: 'keyword', label: '关键字', placeholder: '角色名称 / 标识 / 描述', width: 240 },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      <div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">
        <DataTable
          rowKey="id"
          bordered
          state={toolbar}
          dataSource={filteredRoles}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize,
            total: filteredRoles.length,
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
        open={modalOpen}
        title={editing ? '编辑角色' : '新建角色'}
        okText={editing ? '保存' : '确定'}
        cancelText="取消"
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="roleName"
              label="角色名称"
              rules={[{ required: true, message: '请输入角色名称' }]}
            >
              <Input placeholder="请输入角色名称" maxLength={20} />
            </Form.Item>
            <Form.Item
              name="roleKey"
              label="角色标识"
              rules={[{ required: true, message: '请输入角色标识' }]}
            >
              <Input
                placeholder="请输入角色标识，如：admin"
                maxLength={30}
                disabled={editing?.roleKey === 'admin'}
              />
            </Form.Item>
          </div>
          <Form.Item name="roleDesc" label="角色描述">
            <Input.TextArea placeholder="请输入角色描述" rows={3} maxLength={100} showCount />
          </Form.Item>
          <Form.Item label="菜单权限" required>
            <Form.Item
              name="menuPermissions"
              valuePropName="checkedKeys"
              trigger="onCheck"
              noStyle
              rules={[{ type: 'array', required: true, message: '请勾选菜单权限' }]}
            >
              <Tree
                checkable
                defaultExpandAll
                selectable={false}
                treeData={menuPermissionTree}
                className="max-h-300px overflow-y-auto rounded-6px border border-solid border-[var(--ant-color-border-secondary)] p-3"
              />
            </Form.Item>
            <div className="mt-2 text-12px text-[var(--ant-color-text-tertiary)]">
              勾选父级会同时授权其子菜单；保存后用户重新登录即可生效。
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

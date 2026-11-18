import { KeyOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Select, Switch, Tag, TreeSelect } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockDepartments, mockRoles, mockUsers } from './mockData';
import type { DeptItem, UserItem } from './types';

interface UserFormValues {
  username: string;
  password?: string;
  realName: string;
  role: string;
  deptName: string;
  status: boolean;
  email?: string;
  phone?: string;
}

interface DeptTreeSelectNode {
  title: string;
  value: string;
  children?: DeptTreeSelectNode[];
}

function toDeptTreeSelect(nodes: DeptItem[]): DeptTreeSelectNode[] {
  return nodes.map((node) => ({
    title: node.deptName,
    value: node.deptName,
    children: node.children ? toDeptTreeSelect(node.children) : undefined,
  }));
}

export default function UserManage() {
  const { message, modal } = App.useApp();
  const [users, setUsers] = useState<UserItem[]>(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [resetForm] = Form.useForm<{ password: string; confirm: string }>();
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const filteredUsers = useMemo(() => {
    const keyword = typeof query.username === 'string' ? query.username.toLowerCase() : '';
    return users.filter((item) => {
      if (keyword && !`${item.username}${item.realName}`.toLowerCase().includes(keyword)) {
        return false;
      }
      if (typeof query.role === 'string' && item.role !== query.role) return false;
      if (typeof query.status === 'string' && String(item.status) !== query.status) return false;
      return true;
    });
  }, [users, query]);

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
    form.setFieldsValue({ status: true });
    setModalOpen(true);
  };

  const openEdit = (record: UserItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      username: record.username,
      realName: record.realName,
      role: record.role,
      deptName: record.deptName,
      status: record.status === 1,
      email: record.email,
      phone: record.phone,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (editing) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                username: values.username,
                realName: values.realName,
                role: values.role,
                deptName: values.deptName,
                status: values.status ? 1 : 0,
                email: values.email ?? '',
                phone: values.phone ?? '',
              }
            : item,
        ),
      );
      message.success('编辑用户成功');
    } else {
      setUsers((prev) => [
        {
          id: `user-${Date.now()}`,
          username: values.username,
          realName: values.realName,
          role: values.role,
          deptName: values.deptName,
          status: values.status ? 1 : 0,
          email: values.email ?? '',
          phone: values.phone ?? '',
        },
        ...prev,
      ]);
      message.success('新建用户成功');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const openReset = (record: UserItem) => {
    resetForm.resetFields();
    setResetTarget(record);
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    try {
      await resetForm.validateFields();
    } catch {
      return;
    }
    // mock 环境仅做交互演示，真实项目在此调用重置密码接口
    message.success(`已重置「${resetTarget.realName}」的密码`);
    setResetTarget(null);
  };

  const columns: ColumnsType<UserItem> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'realName', width: 120 },
    { title: '角色', dataIndex: 'role', width: 120 },
    { title: '部门', dataIndex: 'deptName', width: 120 },
    {
      title: '账号状态',
      dataIndex: 'status',
      width: 100,
      render: (value: 0 | 1) => (
        <Tag color={value === 1 ? 'success' : 'error'}>{value === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    { title: '手机', dataIndex: 'phone', width: 140 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => openReset(record)}>
            重置密码
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除用户「${record.realName}」吗？`,
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => {
                  setUsers((prev) => prev.filter((item) => item.id !== record.id));
                  message.success('删除成功');
                },
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const toolbar = useTableToolbar<UserItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer
      title="用户管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建用户
        </Button>
      }
    >
      <SearchBar
        fields={[
          { name: 'username', label: '关键字', placeholder: '用户名 / 真实姓名' },
          {
            name: 'role',
            label: '角色',
            type: 'select',
            options: mockRoles.map((item) => ({ value: item.roleName, label: item.roleName })),
          },
          {
            name: 'status',
            label: '账号状态',
            type: 'select',
            options: [
              { value: '1', label: '启用' },
              { value: '0', label: '禁用' },
            ],
          },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      <DataTable
        rowKey="id"
        bordered
        state={toolbar}
        dataSource={filteredUsers}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize,
          onChange: (nextPage, nextPageSize) => {
            setPageState(nextPage);
            setPageSizeState(nextPageSize);
          },
        }}
      />
      <Modal
        width={600}
        destroyOnHidden
        open={modalOpen}
        title={editing ? '编辑用户' : '新建用户'}
        okText={editing ? '保存' : '确定'}
        cancelText="取消"
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical" initialValues={{ status: true }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" maxLength={50} />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能少于6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" maxLength={100} />
            </Form.Item>
          )}
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" maxLength={20} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              placeholder="请选择角色"
              options={mockRoles.map((item) => ({ value: item.roleName, label: item.roleName }))}
            />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <TreeSelect
              placeholder="请选择部门"
              treeData={toDeptTreeSelect(mockDepartments)}
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>
          <Form.Item name="status" label="账号状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
          >
            <Input placeholder="请输入邮箱" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机"
            rules={[{ pattern: /^1\d{10}$/, message: '请输入正确的手机号' }]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        width={480}
        destroyOnHidden
        open={Boolean(resetTarget)}
        title={`重置密码 - ${resetTarget?.realName ?? ''}`}
        okText="确认重置"
        cancelText="取消"
        onCancel={() => setResetTarget(null)}
        onOk={submitReset}
      >
        <div className="mb-3 text-13px text-[var(--ant-color-text-secondary)]">
          重置后原密码立即失效，用户需使用新密码重新登录。
        </div>
        <Form form={resetForm} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || getFieldValue('password') === value
                    ? Promise.resolve()
                    : Promise.reject(new Error('两次输入的密码不一致')),
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

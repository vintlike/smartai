import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { App, Button, Form, Input, Modal, Radio, Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { UserItem } from '@/services/mock-data';
import { mockUsers, roleOptions } from '@/services/mock-data';
import '@/pages/upms/user/user.less';

const deptOptions = [
  '事业部',
  '北区事业部',
  '销售团队',
  '产品研发部',
  '前端研发团队',
  '后端研发团队',
].map((value) => ({ label: value, value }));

interface UserFormValues {
  username: string;
  password: string;
  role: string;
  dept: string;
  realName: string;
  status: '启用' | '禁用';
  gender?: '男' | '女';
  phone?: string;
  email?: string;
}

/** 用户管理：筛选 + 账户列表 + 新增/编辑 + 重置密码 */
export default function UserPage() {
  const { message, modal } = App.useApp();
  const [users, setUsers] = useState<UserItem[]>(mockUsers);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<UserItem | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [pwdForm] = Form.useForm<{ newPassword: string; confirmPassword: string }>();

  const columns = useMemo<TableColumnsType<UserItem>>(
    () => [
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        render: (value: string) => <Tag color="processing">{value}</Tag>,
      },
      { title: '部门', dataIndex: 'dept', key: 'dept' },
      {
        title: '账号状态',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (value: string) => (
          <Tag color={value === '启用' ? 'success' : 'default'}>{value}</Tag>
        ),
      },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '手机', dataIndex: 'phone', key: 'phone', width: 140 },
      {
        title: '操作',
        key: 'action',
        width: 130,
        render: (_, record) => (
          <div className="sa-row-actions">
            <Button
              type="text"
              size="small"
              className="sa-user__reset-icon"
              icon={<SafetyCertificateOutlined />}
              onClick={() => {
                setPwdUser(record);
                pwdForm.resetFields();
                setPwdOpen(true);
              }}
            />
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
    // 操作列仅依赖稳定的状态函数
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const state = useTableToolbar(columns);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: '启用', gender: '男' });
    setOpen(true);
  }

  function openEdit(record: UserItem) {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      username: record.username,
      realName: record.realName,
      role: record.role,
      dept: record.dept,
      status: record.status,
    });
    setOpen(true);
  }

  function confirmDelete(record: UserItem) {
    modal.confirm({
      title: '删除用户',
      content: `确定要删除用户「${record.username}」吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setUsers((list) => list.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  }

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      setUsers((list) =>
        list.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                username: values.username,
                realName: values.realName,
                role: values.role,
                dept: values.dept,
                status: values.status,
                email: values.email ?? item.email,
                phone: values.phone ?? item.phone,
              }
            : item,
        ),
      );
      message.success('用户信息已更新');
    } else {
      setUsers((list) => [
        ...list,
        {
          id: `user-${Date.now()}`,
          username: values.username,
          realName: values.realName,
          role: values.role,
          dept: values.dept,
          status: values.status,
          email: values.email ?? '-',
          phone: values.phone ?? '-',
        },
      ]);
      message.success('账户创建成功');
    }
    setOpen(false);
  };

  const submitPassword = async () => {
    await pwdForm.validateFields();
    setPwdOpen(false);
    message.success(`已重置「${pwdUser?.username}」的密码`);
  };

  return (
    <PageContainer>
      <FilterBar onReset={() => setKeyword('')}>
        <FilterItem label="用户名">
          <Input
            placeholder="请输入用户名"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <DataTable<UserItem>
        state={state}
        dataSource={users.filter((item) => item.username.includes(keyword.trim()))}
        toolbarExtra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增账户
          </Button>
        }
      />

      <Modal
        title="新增/编辑用户"
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
        <Form form={form} layout="vertical" className="sa-form-grid">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editing ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editing ? '不修改请留空' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={roleOptions} />
          </Form.Item>
          <Form.Item name="dept" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
            <Select placeholder="请选择部门" options={deptOptions} />
          </Form.Item>
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item name="status" label="账号状态">
            <Radio.Group
              options={[
                { label: '启用', value: '启用' },
                { label: '禁用', value: '禁用' },
              ]}
            />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Radio.Group
              options={[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ]}
            />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={pwdOpen}
        width={460}
        onCancel={() => setPwdOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={submitPassword}>
            确认重置
          </Button>,
          <Button key="reset" onClick={() => pwdForm.resetFields()}>
            重置
          </Button>,
        ]}
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

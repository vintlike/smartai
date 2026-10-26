import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType, TreeDataNode } from 'antd';
import { App, Button, Form, Input, Modal, Tree } from 'antd';
import { useMemo, useState } from 'react';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { RoleItem } from '@/services/mock-data';
import { mockRoles, permissionTree } from '@/services/mock-data';
import '@/pages/upms/role/role.less';

interface RoleFormValues {
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
}

/** 角色管理：角色列表 + 菜单/按钮权限树 */
export default function RolePage() {
  const { message, modal } = App.useApp();
  const [roles, setRoles] = useState<RoleItem[]>(mockRoles);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [form] = Form.useForm<RoleFormValues>();

  const columns = useMemo<TableColumnsType<RoleItem>>(
    () => [
      { title: '角色名称', dataIndex: 'name', key: 'name' },
      { title: '角色标识', dataIndex: 'code', key: 'code' },
      { title: '角色描述', dataIndex: 'description', key: 'description' },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_, record) => {
          if (record.code === 'administrator') return <span className="sa-text-muted">-</span>;
          return (
            <div className="sa-row-actions">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
              />
              {record.builtin ? null : (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => confirmDelete(record)}
                />
              )}
            </div>
          );
        },
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
    setCheckedKeys([]);
    setOpen(true);
  }

  function openEdit(record: RoleItem) {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
    });
    setCheckedKeys([]);
    setOpen(true);
  }

  function confirmDelete(record: RoleItem) {
    modal.confirm({
      title: '删除角色',
      content: `确定要删除角色「${record.name}」吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRoles((list) => list.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  }

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      setRoles((list) =>
        list.map((item) =>
          item.id === editing.id
            ? { ...item, name: values.name, code: values.code, description: values.description ?? '' }
            : item,
        ),
      );
      message.success('角色已更新');
    } else {
      setRoles((list) => [
        ...list,
        {
          id: `role-${Date.now()}`,
          name: values.name,
          code: values.code,
          description: values.description ?? '',
        },
      ]);
      message.success('角色已创建');
    }
    setOpen(false);
  };

  return (
    <PageContainer>
      <FilterBar onReset={() => setKeyword('')}>
        <FilterItem label="角色名称">
          <Input
            placeholder="请输入角色名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <DataTable<RoleItem>
        state={state}
        dataSource={roles.filter((item) => item.name.includes(keyword.trim()))}
        toolbarExtra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增角色
          </Button>
        }
      />

      <Modal
        title="新增/编辑角色"
        open={open}
        width={460}
        styles={{ body: { maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' } }}
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
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色标识"
            rules={[{ required: true, message: '请输入角色标识' }]}
          >
            <Input placeholder="请输入角色标识" />
          </Form.Item>
          <Form.Item label="菜单权限" name="permissions">
            <div className="sa-role__tree">
              <Tree
                checkable
                defaultExpandAll
                treeData={permissionTree as TreeDataNode[]}
                checkedKeys={checkedKeys}
                onCheck={(keys) =>
                  setCheckedKeys((Array.isArray(keys) ? keys : keys.checked).map(String))
                }
              />
            </div>
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

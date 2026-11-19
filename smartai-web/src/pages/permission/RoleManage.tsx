import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Tree } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SysMenuRecord, SysRoleRecord } from '@/api/system';
import { menuApi, roleApi } from '@/api/system';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import type { MenuPermissionNode, RoleItem } from './types';

interface RoleFormValues {
  roleName: string;
  roleKey: string;
  roleDesc?: string;
  menuPermissions: string[];
}

function buildMenuTree(records: SysMenuRecord[]): MenuPermissionNode[] {
  const nodes = new Map<string, MenuPermissionNode>();
  records.forEach((record) => {
    nodes.set(record.id, { key: record.id, title: record.name });
  });
  const roots: MenuPermissionNode[] = [];
  records.forEach((record) => {
    const node = nodes.get(record.id);
    const parent =
      record.parentId && record.parentId !== '0' ? nodes.get(record.parentId) : undefined;
    if (!node) return;
    if (parent) {
      parent.children = [...(parent.children ?? []), node];
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export default function RoleManage() {
  const { message, modal } = App.useApp();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [menuTree, setMenuTree] = useState<MenuPermissionNode[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [form] = Form.useForm<RoleFormValues>();
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const loadData = useCallback(async () => {
    try {
      const [roleResult, menuResult] = await Promise.all([roleApi.list(), menuApi.list()]);
      const menuTreeData = buildMenuTree(menuResult.list);
      const roleItems = await Promise.all(
        roleResult.list.map(async (record: SysRoleRecord) => {
          const menus = await menuApi.listByRoleId(record.id).catch(() => []);
          return {
            id: record.id,
            roleName: record.name,
            roleKey: record.code,
            roleDesc: record.description ?? '',
            menuPermissions: menus.map((item) => item.id),
          } satisfies RoleItem;
        }),
      );
      setMenuTree(menuTreeData);
      setRoles(roleItems);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '角色列表加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    const payload = {
      name: values.roleName,
      code: values.roleKey,
      description: values.roleDesc ?? '',
    };
    try {
      let roleId: string;
      if (editing) {
        await roleApi.update({ ...payload, id: editing.id });
        roleId = editing.id;
        message.success('编辑角色成功');
      } else {
        const created = await roleApi.create(payload);
        roleId = created.id;
        message.success('新建角色成功');
      }
      await roleApi.assignMenus(roleId, values.menuPermissions ?? []);
      setModalOpen(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存角色失败');
    }
  };

  const confirmDelete = (record: RoleItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色「${record.roleName}」吗？删除后关联用户将失去该角色权限。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await roleApi.delete(record.id);
          message.success('删除成功');
          await loadData();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
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

  const toolbar = useTableToolbar<RoleItem>(columns, loadData);

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
                treeData={menuTree}
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

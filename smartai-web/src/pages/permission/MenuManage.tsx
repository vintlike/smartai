import {
  ApartmentOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  ControlOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  KeyOutlined,
  MenuOutlined,
  MessageOutlined,
  PlusOutlined,
  RobotOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Popover,
  Radio,
  Switch,
  Tag,
  TreeSelect,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockMenus } from './mockData';
import type { MenuItem, MenuType } from './types';

const { Text } = Typography;

const ICON_MAP: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  SettingOutlined: <SettingOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  FolderOpenOutlined: <FolderOpenOutlined />,
  CreditCardOutlined: <CreditCardOutlined />,
  UserOutlined: <UserOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  KeyOutlined: <KeyOutlined />,
  MessageOutlined: <MessageOutlined />,
  RobotOutlined: <RobotOutlined />,
  CloudServerOutlined: <CloudServerOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  MenuOutlined: <MenuOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  TeamOutlined: <TeamOutlined />,
  ControlOutlined: <ControlOutlined />,
};

const menuTypeMeta: Record<MenuType, { label: string; color: string }> = {
  catalog: { label: '目录', color: 'blue' },
  menu: { label: '菜单', color: 'green' },
  button: { label: '按钮', color: 'orange' },
};

/** 图标选择器：弹出网格选图标，作为 Form.Item 受控字段使用（value/onChange 由表单注入） */
function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex flex-col gap-2 p-1">
          <div className="grid grid-cols-6 gap-1">
            {Object.entries(ICON_MAP).map(([name, node]) => (
              <button
                key={name}
                type="button"
                title={name}
                className={`h-8 w-8 flex items-center justify-center rounded-6px border border-solid cursor-pointer ${
                  value === name
                    ? 'border-[var(--ant-color-primary)] bg-[var(--ant-color-primary-bg)] text-[var(--ant-color-primary)]'
                    : 'border-transparent text-[var(--ant-color-text-secondary)] hover:bg-[var(--ant-color-fill-quaternary)]'
                }`}
                onClick={() => {
                  onChange?.(name);
                  setOpen(false);
                }}
              >
                {node}
              </button>
            ))}
          </div>
          <Button
            size="small"
            type="link"
            className="self-end"
            disabled={!value}
            onClick={() => {
              onChange?.(undefined);
              setOpen(false);
            }}
          >
            清除图标
          </Button>
        </div>
      }
    >
      <Button className="w-full flex items-center justify-start gap-2">
        {value ? (
          <>
            {ICON_MAP[value]}
            <span>{value}</span>
          </>
        ) : (
          '点击选择图标'
        )}
      </Button>
    </Popover>
  );
}

interface MenuFormValues {
  parentId?: string;
  menuType: MenuType;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  order: number;
  perms?: string;
  status: boolean;
  external: boolean;
  keepalive: boolean;
}

interface MenuTreeSelectNode {
  title: string;
  value: string;
  disabled?: boolean;
  children?: MenuTreeSelectNode[];
}

function flattenTree(nodes: MenuItem[]): MenuItem[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function toTreeSelectData(nodes: MenuItem[]): MenuTreeSelectNode[] {
  return nodes.map((node) => ({
    title: node.name,
    value: node.id,
    disabled: node.menuType === 'button',
    children: node.children ? toTreeSelectData(node.children) : undefined,
  }));
}

function addChildToTree(nodes: MenuItem[], parentId: string, child: MenuItem): MenuItem[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), child] };
    }
    if (node.children) {
      return { ...node, children: addChildToTree(node.children, parentId, child) };
    }
    return node;
  });
}

function updateTree(nodes: MenuItem[], id: string, payload: Partial<MenuItem>): MenuItem[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...payload };
    if (node.children) return { ...node, children: updateTree(node.children, id, payload) };
    return node;
  });
}

function removeFromTree(nodes: MenuItem[], id: string): MenuItem[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children ? { ...node, children: removeFromTree(node.children, id) } : node,
    );
}

/** 单节点是否命中搜索条件 */
function matchMenu(node: MenuItem, keyword: string, menuType?: string, status?: string): boolean {
  if (keyword) {
    const haystack = `${node.name}${node.path}${node.component ?? ''}${node.perms ?? ''}`;
    if (!haystack.toLowerCase().includes(keyword)) return false;
  }
  if (menuType && node.menuType !== menuType) return false;
  if (status && String(node.status) !== status) return false;
  return true;
}

/** 按条件过滤树：命中节点保留整棵子树，子节点命中则保留祖先链路 */
function filterMenuTree(nodes: MenuItem[], query: QueryParams): MenuItem[] {
  const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
  const menuType = typeof query.menuType === 'string' ? query.menuType : undefined;
  const status = typeof query.status === 'string' ? query.status : undefined;
  if (!keyword && !menuType && !status) return nodes;

  return nodes.flatMap((node) => {
    if (matchMenu(node, keyword, menuType, status)) return [node];
    const children = node.children ? filterMenuTree(node.children, query) : [];
    if (children.length) return [{ ...node, children }];
    return [];
  });
}

export default function MenuManage() {
  const { message } = App.useApp();
  const [menus, setMenus] = useState<MenuItem[]>(mockMenus);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form] = Form.useForm<MenuFormValues>();
  const menuType = Form.useWatch('menuType', form);
  const external = Form.useWatch('external', form);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const filteredMenus = useMemo(() => filterMenuTree(menus, query), [menus, query]);
  const flatMenus = flattenTree(filteredMenus);

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
    form.setFieldsValue({
      menuType: 'catalog',
      status: true,
      order: 1,
      external: false,
      keepalive: true,
    });
    setModalOpen(true);
  };

  const openCreateChild = (parent: MenuItem) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      parentId: parent.id,
      menuType: parent.menuType === 'catalog' ? 'menu' : 'button',
      status: true,
      order: 1,
      external: false,
      keepalive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (record: MenuItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      parentId: record.parentId,
      menuType: record.menuType,
      name: record.name,
      path: record.path,
      component: record.component,
      icon: record.icon,
      order: record.order,
      perms: record.perms,
      status: record.status === 1,
      external: Boolean(record.external),
      keepalive: record.keepalive !== false,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      parentId: values.parentId === '__root__' ? undefined : values.parentId,
      menuType: values.menuType,
      name: values.name,
      path: values.path,
      component: values.component,
      icon: values.icon,
      order: values.order,
      perms: values.perms,
      status: (values.status ? 1 : 0) as 0 | 1,
      external: Boolean(values.external),
      keepalive: Boolean(values.keepalive),
    };
    if (editing) {
      setMenus((prev) => updateTree(prev, editing.id, payload));
      message.success('编辑成功');
    } else {
      const newMenu: MenuItem = { id: `m-${Date.now()}`, ...payload };
      if (payload.parentId) {
        setMenus((prev) => addChildToTree(prev, payload.parentId as string, newMenu));
      } else {
        setMenus((prev) => [...prev, newMenu]);
      }
      message.success('新增菜单成功');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const columns: ColumnsType<MenuItem> = [
    { title: '菜单名称', dataIndex: 'name', width: 200 },
    {
      title: '菜单路径',
      dataIndex: 'path',
      width: 200,
      render: (value: string) => <Text code>{value}</Text>,
    },
    {
      title: '菜单类型',
      dataIndex: 'menuType',
      width: 90,
      render: (value: MenuType) => (
        <Tag color={menuTypeMeta[value].color}>{menuTypeMeta[value].label}</Tag>
      ),
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      width: 220,
      render: (value?: string) => value || '-',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      align: 'center',
      render: (value?: string) => (value ? (ICON_MAP[value] ?? '-') : '-'),
    },
    { title: '排序', dataIndex: 'order', width: 70, align: 'center' },
    {
      title: '权限标识',
      dataIndex: 'perms',
      width: 200,
      render: (value?: string) => (value ? <Text code>{value}</Text> : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (value: 0 | 1) => (
        <Text type={value === 1 ? 'success' : 'danger'}>{value === 1 ? '启用' : '禁用'}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.menuType !== 'button' && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openCreateChild(record)}
            />
          )}
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={
              record.children && record.children.length > 0
                ? `该菜单下存在子菜单，删除后子菜单将一并删除，确定删除「${record.name}」吗？`
                : `确定删除「${record.name}」吗？`
            }
            okText="删除"
            cancelText="取消"
            onConfirm={() => {
              setMenus((prev) => removeFromTree(prev, record.id));
              message.success('删除成功');
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

  const toolbar = useTableToolbar<MenuItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer
      title="菜单管理"
      contentBordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增菜单
        </Button>
      }
    >
      <SearchBar
        fields={[
          { name: 'keyword', label: '关键字', placeholder: '名称 / 路径 / 权限标识', width: 240 },
          {
            name: 'menuType',
            label: '菜单类型',
            type: 'select',
            options: [
              { value: 'catalog', label: '目录' },
              { value: 'menu', label: '菜单' },
              { value: 'button', label: '按钮' },
            ],
          },
          {
            name: 'status',
            label: '状态',
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
      <div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">
        <DataTable
          key={JSON.stringify(query)}
          rowKey="id"
          bordered
          state={toolbar}
          dataSource={filteredMenus}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 1400 }}
          pagination={{
            current: page,
            pageSize,
            total: flatMenus.length,
            onChange: (nextPage, nextPageSize) => {
              setPageState(nextPage);
              setPageSizeState(nextPageSize);
            },
          }}
        />
      </div>
      <Modal
        width={640}
        destroyOnHidden
        open={modalOpen}
        title={editing ? '编辑菜单' : '新增菜单'}
        okText={editing ? '保存' : '确定'}
        cancelText="取消"
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="name"
              label="菜单名称"
              rules={[{ required: true, message: '请输入菜单名称' }]}
            >
              <Input placeholder="请输入菜单名称" maxLength={20} />
            </Form.Item>
            <Form.Item name="parentId" label="上级菜单">
              <TreeSelect
                className="w-full"
                placeholder="不选则为顶级菜单"
                treeData={[
                  { title: '顶级菜单', value: '__root__', disabled: true },
                  ...toTreeSelectData(menus),
                ]}
                treeDefaultExpandAll
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="menuType"
              label="菜单类型"
              rules={[{ required: true, message: '请选择菜单类型' }]}
            >
              <Radio.Group
                options={[
                  { value: 'catalog', label: '目录' },
                  { value: 'menu', label: '菜单' },
                  { value: 'button', label: '按钮' },
                ]}
              />
            </Form.Item>
            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
            <Form.Item
              name="path"
              label="菜单路径"
              rules={[{ required: true, message: '请输入菜单路径' }]}
            >
              <Input
                placeholder={
                  external
                    ? '请输入外链地址，如 https://example.com'
                    : '请输入菜单路径，如 /permission/menu'
                }
              />
            </Form.Item>
            {/* 外链菜单不渲染本地组件 */}
            {menuType === 'menu' && !external && (
              <Form.Item name="component" label="组件路径">
                <Input placeholder="请输入组件路径，如 pages/permission/MenuManage" />
              </Form.Item>
            )}
            <Form.Item name="icon" label="菜单图标">
              <IconPicker />
            </Form.Item>
            <Form.Item name="order" label="排序">
              <InputNumber min={1} max={999} className="w-full!" />
            </Form.Item>
            <Form.Item name="perms" label="权限标识">
              <Input placeholder="请输入权限标识，如 /permission/menu:add" />
            </Form.Item>
            <Form.Item name="external" label="是否外链">
              <Radio.Group
                options={[
                  { value: false, label: '组件' },
                  { value: true, label: '外链' },
                ]}
              />
            </Form.Item>
            <Form.Item name="keepalive" label="是否缓存">
              <Radio.Group
                options={[
                  { value: true, label: '缓存' },
                  { value: false, label: '不缓存' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

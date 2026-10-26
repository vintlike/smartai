import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Select,
  Tag,
} from 'antd';
import { useState } from 'react';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import { MenuIcon } from '@/framework';
import type { MenuItem } from '@/framework';
import mockMenus from '@/services/mock-menu';
import '@/pages/upms/menu/menu.less';

/** 图标选择器可选图标（均已在 menuIconMap 注册） */
const iconChoices = [
  'DashboardOutlined',
  'AppstoreOutlined',
  'ClusterOutlined',
  'KeyOutlined',
  'SettingOutlined',
  'RobotOutlined',
  'MessageOutlined',
  'DatabaseOutlined',
  'ReadOutlined',
  'FileTextOutlined',
  'TeamOutlined',
  'UserOutlined',
  'BarChartOutlined',
  'MoneyCollectOutlined',
  'FolderOutlined',
  'LockOutlined',
  'ApiOutlined',
  'CloudServerOutlined',
  'SearchOutlined',
  'SendOutlined',
];

interface MenuOption {
  label: string;
  value: string;
}

function cloneMenus(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    meta: { ...item.meta },
    children: item.children ? cloneMenus(item.children) : undefined,
  }));
}

function updateMenu(items: MenuItem[], id: string, patch: MenuItem): MenuItem[] {
  return items.map((item) => {
    if (item.id === id) return { ...patch, children: item.children };
    if (item.children?.length) {
      return { ...item, children: updateMenu(item.children, id, patch) };
    }
    return item;
  });
}

function addMenu(items: MenuItem[], parentId: string, node: MenuItem): MenuItem[] {
  return items.map((item) => {
    if (item.id === parentId) return { ...item, children: [...(item.children ?? []), node] };
    if (item.children?.length) {
      return { ...item, children: addMenu(item.children, parentId, node) };
    }
    return item;
  });
}

function removeMenu(items: MenuItem[], id: string): MenuItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => (item.children ? { ...item, children: removeMenu(item.children, id) } : item));
}

function filterMenus(items: MenuItem[], keyword: string): MenuItem[] {
  const result: MenuItem[] = [];
  for (const item of items) {
    const children = item.children ? filterMenus(item.children, keyword) : [];
    if (item.name.includes(keyword) || children.length > 0) {
      result.push({ ...item, children: children.length > 0 ? children : item.children });
    }
  }
  return result;
}

function collectMenuOptions(
  items: MenuItem[],
  level = 0,
  excludeId?: string,
): MenuOption[] {
  const options: MenuOption[] = [];
  for (const item of items) {
    if (item.id === excludeId) continue;
    options.push({ label: `${'\u3000'.repeat(level)}${item.name}`, value: item.id });
    if (item.children?.length) {
      options.push(...collectMenuOptions(item.children, level + 1, excludeId));
    }
  }
  return options;
}

function findMenu(items: MenuItem[], id: string): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const found = findMenu(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** 菜单管理：树形表格 + 菜单/按钮配置 */
export default function MenuPage() {
  const { message, modal } = App.useApp();
  const [menus, setMenus] = useState<MenuItem[]>(() => cloneMenus(mockMenus));
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [icon, setIcon] = useState<string | undefined>();
  const [iconOpen, setIconOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: TableColumnsType<MenuItem> = [
    { title: '菜单名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '菜单路径', dataIndex: 'path', key: 'path', width: 180 },
    {
      title: '菜单类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (value: string) => (
        <Tag color={value === 'button' ? 'warning' : 'processing'}>
          {value === 'button' ? '按钮' : '菜单'}
        </Tag>
      ),
    },
    { title: '组件路径', dataIndex: 'component', key: 'component', width: 180 },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 70,
      render: (_, record) => <MenuIcon icon={record.meta?.icon} />,
    },
    { title: '排序', dataIndex: 'orderNo', key: 'orderNo', width: 70 },
    { title: '权限标识', dataIndex: 'perms', key: 'perms', width: 180 },
    {
      title: '状态',
      dataIndex: 'disabled',
      key: 'disabled',
      width: 90,
      render: (value?: boolean) => (
        <Tag color={value ? 'default' : 'success'}>{value ? '禁用' : '启用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <div className="sa-row-actions">
          <Button
            type="text"
            size="small"
            className="sa-menu__add-icon"
            icon={<PlusOutlined />}
            onClick={() => openCreate(record.id)}
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
  ];

  const state = useTableToolbar(columns);

  function openCreate(parentId?: string) {
    setEditing(null);
    setIcon(undefined);
    form.resetFields();
    form.setFieldsValue({
      parentId: parentId ?? '0',
      type: 'menu',
      disabled: false,
      component: 'Layout',
      orderNo: 1,
      isExt: false,
      keepalive: true,
    });
    setOpen(true);
  }

  function openEdit(record: MenuItem) {
    setEditing(record);
    setIcon(record.meta?.icon ?? undefined);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      parentId: record.parentId,
      type: record.type,
      disabled: Boolean(record.disabled),
      perms: record.perms,
      path: record.path,
      component: record.component,
      orderNo: record.orderNo ?? 0,
      isExt: Boolean(record.isExt),
      keepalive: record.keepalive !== false,
    });
    setOpen(true);
  }

  function confirmDelete(record: MenuItem) {
    modal.confirm({
      title: '删除菜单',
      content: `确定要删除「${record.name}」吗？子菜单会一并删除。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setMenus((list) => removeMenu(list, record.id));
        message.success('删除成功');
      },
    });
  }

  const submit = async () => {
    const values = await form.validateFields();
    const parentId: string = values.parentId ?? '0';
    const node: MenuItem = {
      id: editing?.id ?? `menu-${Date.now()}`,
      parentId,
      name: values.name,
      path: values.path,
      type: values.type,
      component: values.component ?? (values.type === 'button' ? '' : 'Layout'),
      perms: values.perms,
      meta: { ...editing?.meta, title: values.name, icon: icon ?? null },
      orderNo: Number(values.orderNo ?? 0),
      disabled: Boolean(values.disabled),
      isExt: Boolean(values.isExt),
      keepalive: Boolean(values.keepalive),
      show: true,
    };

    if (editing) {
      const existing = findMenu(menus, editing.id);
      setMenus((list) =>
        updateMenu(list, editing.id, {
          ...node,
          parentId: existing?.parentId ?? node.parentId,
        }),
      );
      message.success('菜单已更新');
    } else {
      setMenus((list) =>
        parentId === '0' ? [...list, node] : addMenu(list, parentId, node),
      );
      message.success('菜单已新增');
    }
    setOpen(false);
  };

  const iconPicker = (
    <div className="sa-icon-picker">
      {iconChoices.map((name) => (
        <button
          key={name}
          type="button"
          className={['sa-icon-picker__item', name === icon ? 'is-active' : ''].filter(Boolean).join(' ')}
          title={name}
          onClick={() => {
            setIcon(name);
            setIconOpen(false);
          }}
        >
          <MenuIcon icon={name} size={18} />
        </button>
      ))}
    </div>
  );

  return (
    <PageContainer>
      <FilterBar onReset={() => setKeyword('')}>
        <FilterItem label="菜单名称">
          <Input
            placeholder="请输入菜单名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <DataTable<MenuItem>
        state={state}
        dataSource={keyword.trim() ? filterMenus(menus, keyword.trim()) : menus}
        pagination={false}
        toolbarExtra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
            新增菜单
          </Button>
        }
      />

      <Modal
        title="新增/编辑菜单"
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
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级菜单">
            <Select
              placeholder="请选择上级菜单"
              options={[
                { label: '根目录', value: '0' },
                ...collectMenuOptions(menus, 0, editing?.id),
              ]}
            />
          </Form.Item>
          <Form.Item name="type" label="菜单类型">
            <Radio.Group
              options={[
                { label: '菜单', value: 'menu' },
                { label: '按钮', value: 'button' },
              ]}
            />
          </Form.Item>
          <Form.Item name="disabled" label="是否禁用">
            <Radio.Group
              options={[
                { label: '启用', value: false },
                { label: '禁用', value: true },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="perms"
            label="权限标识"
            rules={[{ required: true, message: '请输入权限标识' }]}
          >
            <Input placeholder="例如 upms:user:add" />
          </Form.Item>
          <Form.Item
            name="path"
            label="菜单路径"
            rules={[{ required: true, message: '请输入菜单路径' }]}
          >
            <Input placeholder="例如 user" />
          </Form.Item>
          <Form.Item label="菜单图标">
            <Popover
              content={iconPicker}
              trigger="click"
              open={iconOpen}
              onOpenChange={setIconOpen}
              placement="bottomLeft"
            >
              <Button className="sa-menu__icon-btn">
                {icon ? (
                  <>
                    <MenuIcon icon={icon} size={16} />
                    <span>{icon}</span>
                  </>
                ) : (
                  '点击选择图标'
                )}
              </Button>
            </Popover>
          </Form.Item>
          <Form.Item
            name="component"
            label="组件路径"
            rules={[{ required: true, message: '请输入组件路径' }]}
          >
            <Input placeholder="Layout 或 /app/index" />
          </Form.Item>
          <Form.Item
            name="orderNo"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={0} max={999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isExt" label="是否外链">
            <Radio.Group
              options={[
                { label: '组件', value: false },
                { label: '外链', value: true },
              ]}
            />
          </Form.Item>
          <Form.Item name="keepalive" label="是否缓存">
            <Radio.Group
              options={[
                { label: '缓存', value: true },
                { label: '不缓存', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

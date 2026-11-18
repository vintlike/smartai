import {
  CompressOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
  TreeSelect,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import { OrgChart, type OrgChartNode } from '@/components/OrgChart';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useI18n } from '@/framework';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockDepartments } from './mockData';
import type { DeptItem } from './types';

interface DeptFormValues {
  parentDept?: string;
  deptName: string;
  deptDesc?: string;
}

interface TreeSelectNode {
  title: string;
  value: string;
  children?: TreeSelectNode[];
}

type DeptLayout = 'new' | 'old';

const LAYOUT_STORAGE_KEY = 'smartai:dept-layout';

function readLayout(): DeptLayout {
  if (typeof window === 'undefined') return 'new';
  return window.localStorage.getItem(LAYOUT_STORAGE_KEY) === 'old' ? 'old' : 'new';
}

function flattenTree(nodes: DeptItem[]): DeptItem[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function toTreeSelectData(nodes: DeptItem[]): TreeSelectNode[] {
  return nodes.map((node) => ({
    title: node.deptName,
    value: node.id,
    children: node.children ? toTreeSelectData(node.children) : undefined,
  }));
}

/** 旧版布局的组织架构图节点 */
function toOrgNodes(nodes: DeptItem[]): OrgChartNode[] {
  return nodes.map((node) => ({
    id: node.id,
    title: node.deptName,
    children: node.children ? toOrgNodes(node.children) : undefined,
  }));
}

function addChildToTree(nodes: DeptItem[], parentId: string, child: DeptItem): DeptItem[] {
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

function updateTree(nodes: DeptItem[], id: string, payload: Partial<DeptItem>): DeptItem[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...payload };
    if (node.children) return { ...node, children: updateTree(node.children, id, payload) };
    return node;
  });
}

function removeFromTree(nodes: DeptItem[], id: string): DeptItem[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children ? { ...node, children: removeFromTree(node.children, id) } : node,
    );
}

/** 按关键字过滤部门树：命中节点保留整棵子树，子节点命中则保留祖先链路 */
function filterDeptTree(nodes: DeptItem[], keyword: string): DeptItem[] {
  if (!keyword) return nodes;

  return nodes.flatMap((node) => {
    const haystack = `${node.deptName}${node.parentDept}${node.deptDesc ?? ''}`;
    if (haystack.toLowerCase().includes(keyword)) return [node];
    const children = node.children ? filterDeptTree(node.children, keyword) : [];
    if (children.length) return [{ ...node, children }];
    return [];
  });
}

export default function DepartmentManage() {
  const { message, modal } = App.useApp();
  const { t } = useI18n();
  const [departments, setDepartments] = useState<DeptItem[]>(mockDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DeptItem | null>(null);
  const [form] = Form.useForm<DeptFormValues>();
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [layout, setLayout] = useState<DeptLayout>(readLayout);
  const [selectedId, setSelectedId] = useState<string>();
  const [orgZoom, setOrgZoom] = useState(1);

  const isLegacy = layout === 'old';

  const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
  const filteredDepartments = useMemo(
    () => filterDeptTree(departments, keyword),
    [departments, keyword],
  );
  // 表单的上级部门查找始终基于完整树，避免被搜索条件裁剪
  const flatDepartments = useMemo(() => flattenTree(departments), [departments]);
  const filteredTotal = flattenTree(filteredDepartments).length;
  const selected = flatDepartments.find((item) => item.id === selectedId);
  const orgNodes = useMemo(() => toOrgNodes(filteredDepartments), [filteredDepartments]);

  /** 新旧布局互换，选择结果持久化，刷新后保持 */
  const toggleLayout = () => {
    const next: DeptLayout = isLegacy ? 'new' : 'old';
    setLayout(next);
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
  };

  // 旧版布局右侧展示详情，进入旧版时若没有有效选中项，默认选中第一个部门
  useEffect(() => {
    if (!isLegacy) return;
    if (selectedId && flatDepartments.some((item) => item.id === selectedId)) return;
    const first = flattenTree(filteredDepartments)[0] ?? departments[0];
    setSelectedId(first?.id);
  }, [isLegacy, selectedId, flatDepartments, filteredDepartments, departments]);

  const removeDepartment = (record: DeptItem) => {
    modal.confirm({
      title: '确认删除',
      content:
        record.children && record.children.length > 0
          ? `该部门下存在子部门，删除后子部门将一并删除，确定删除「${record.deptName}」吗？`
          : `确定删除「${record.deptName}」吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setDepartments((prev) => removeFromTree(prev, record.id));
        setSelectedId((prev) => (prev === record.id ? undefined : prev));
        message.success('删除成功');
      },
    });
  };

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
    setModalOpen(true);
  };

  const openCreateChild = (parent: DeptItem) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ parentDept: parent.id });
    setModalOpen(true);
  };

  const openEdit = (record: DeptItem) => {
    setEditing(record);
    const parent = flatDepartments.find((item) => item.deptName === record.parentDept);
    form.resetFields();
    form.setFieldsValue({
      parentDept: parent?.id,
      deptName: record.deptName,
      deptDesc: record.deptDesc,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const parentDept = values.parentDept
      ? (flatDepartments.find((item) => item.id === values.parentDept)?.deptName ?? '-')
      : '-';
    if (editing) {
      setDepartments((prev) =>
        updateTree(prev, editing.id, {
          deptName: values.deptName,
          deptDesc: values.deptDesc ?? '',
          parentDept,
        }),
      );
      message.success('编辑成功');
    } else {
      const newDept: DeptItem = {
        id: `dept-${Date.now()}`,
        deptName: values.deptName,
        parentDept,
        deptDesc: values.deptDesc ?? '',
      };
      if (values.parentDept) {
        setDepartments((prev) => addChildToTree(prev, values.parentDept as string, newDept));
      } else {
        setDepartments((prev) => [...prev, newDept]);
      }
      message.success('新建部门成功');
    }
    setModalOpen(false);
    setEditing(null);
  };

  const columns: ColumnsType<DeptItem> = [
    { title: '部门名称', dataIndex: 'deptName', width: 220 },
    { title: '上级部门', dataIndex: 'parentDept', width: 180 },
    { title: '部门描述', dataIndex: 'deptDesc', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openCreateChild(record)}
          />
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={
              record.children && record.children.length > 0
                ? `该部门下存在子部门，删除后子部门将一并删除，确定删除「${record.deptName}」吗？`
                : `确定删除「${record.deptName}」吗？`
            }
            okText="删除"
            cancelText="取消"
            onConfirm={() => {
              setDepartments((prev) => removeFromTree(prev, record.id));
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

  const toolbar = useTableToolbar<DeptItem>(columns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer
      title="部门管理"
      contentBordered={false}
      extra={
        <>
          <Tooltip
            title={
              isLegacy ? '当前为旧版布局，点击切换为新版布局' : '当前为新版布局，点击切换为旧版布局'
            }
          >
            <Button icon={<SwapOutlined />} onClick={toggleLayout}>
              布局切换
            </Button>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建部门
          </Button>
        </>
      }
    >
      <SearchBar
        fields={[
          {
            name: 'keyword',
            label: '关键字',
            placeholder: '部门名称 / 上级部门 / 描述',
            width: 260,
          },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      {isLegacy ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-10">
          <Card
            title="组织架构"
            className="lg:col-span-4"
            styles={{ body: { minHeight: 420 } }}
            extra={
              <Space size={2}>
                <Tooltip title={t('org.zoomOut')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ZoomOutOutlined />}
                    disabled={orgZoom <= 0.5}
                    onClick={() =>
                      setOrgZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))
                    }
                  />
                </Tooltip>
                <span className="inline-block w-34px text-center text-12px text-[var(--ant-color-text-secondary)]">
                  {Math.round(orgZoom * 100)}%
                </span>
                <Tooltip title={t('org.zoomIn')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ZoomInOutlined />}
                    disabled={orgZoom >= 2}
                    onClick={() =>
                      setOrgZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))))
                    }
                  />
                </Tooltip>
                <Tooltip title={t('org.resetZoom')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CompressOutlined />}
                    disabled={orgZoom === 1}
                    onClick={() => setOrgZoom(1)}
                  />
                </Tooltip>
              </Space>
            }
          >
            {orgNodes.length ? (
              <div className="min-h-420px p-2">
                <OrgChart
                  nodes={orgNodes}
                  zoom={orgZoom}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            ) : (
              <Empty description="暂无部门" />
            )}
          </Card>

          <Card
            title="部门详情"
            className="lg:col-span-6"
            styles={{ body: { minHeight: 420 } }}
            extra={
              selected ? (
                <Space size={2}>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openCreateChild(selected)}
                  >
                    新增子部门
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(selected)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeDepartment(selected)}
                  >
                    删除
                  </Button>
                </Space>
              ) : null
            }
          >
            {selected ? (
              <Descriptions column={1} styles={{ label: { width: 120 } }}>
                <Descriptions.Item label="部门名称">{selected.deptName}</Descriptions.Item>
                <Descriptions.Item label="上级部门">{selected.parentDept || '-'}</Descriptions.Item>
                <Descriptions.Item label="子部门数量">
                  {selected.children?.length ?? 0}
                </Descriptions.Item>
                <Descriptions.Item label="部门描述">{selected.deptDesc || '-'}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="选择左侧部门查看详情" />
            )}
          </Card>
        </div>
      ) : (
        <div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">
          <DataTable
            key={keyword}
            rowKey="id"
            bordered
            state={toolbar}
            dataSource={filteredDepartments}
            expandable={{ defaultExpandAllRows: true }}
            scroll={{ x: 900 }}
            pagination={{
              current: page,
              pageSize,
              total: filteredTotal,
              onChange: (nextPage, nextPageSize) => {
                setPageState(nextPage);
                setPageSizeState(nextPageSize);
              },
            }}
          />
        </div>
      )}
      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editing ? '编辑部门' : '新建部门'}
        okText={editing ? '保存' : '确定'}
        cancelText="取消"
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="parentDept"
            label="上级部门"
            rules={[{ required: true, message: '请选择上级部门' }]}
          >
            <TreeSelect
              placeholder="请选择上级部门"
              treeData={toTreeSelectData(departments)}
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" maxLength={20} />
          </Form.Item>
          <Form.Item name="deptDesc" label="部门描述">
            <Input.TextArea placeholder="请输入部门描述" rows={3} maxLength={100} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

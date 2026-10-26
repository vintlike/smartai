import {
  CompressOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Select, Tooltip } from 'antd';
import { useState } from 'react';
import { OrgChart } from '@/components/org/OrgChart';
import { PageContainer, PageHeading, Panel } from '@/components/page/PageContainer';
import type { DeptNode } from '@/services/mock-data';
import { mockDeptTree } from '@/services/mock-data';
import '@/pages/upms/dept/dept.less';

interface DeptOption {
  label: string;
  value: string;
}

/** 递归更新节点 */
function updateDept(node: DeptNode, id: string, patch: Partial<DeptNode>): DeptNode {
  if (node.id === id) return { ...node, ...patch };
  if (!node.children?.length) return node;
  return { ...node, children: node.children.map((child) => updateDept(child, id, patch)) };
}

/** 递归新增子节点 */
function addDept(node: DeptNode, parentId: string, child: DeptNode): DeptNode {
  if (node.id === parentId) {
    return { ...node, children: [...(node.children ?? []), child] };
  }
  if (!node.children?.length) return node;
  return { ...node, children: node.children.map((item) => addDept(item, parentId, child)) };
}

/** 收集下拉选项，支持排除某一子树 */
function collectDeptOptions(
  node: DeptNode,
  level = 0,
  excludeId?: string,
): DeptOption[] {
  if (node.id === excludeId) return [];
  const current: DeptOption[] = [
    { label: `${'\u3000'.repeat(level)}${node.name}`, value: node.id },
  ];
  for (const child of node.children ?? []) {
    current.push(...collectDeptOptions(child, level + 1, excludeId));
  }
  return current;
}

/** 查找节点的父级 id */
function findParentId(node: DeptNode, id: string, parentId?: string): string | undefined {
  if (node.id === id) return parentId;
  for (const child of node.children ?? []) {
    const found = findParentId(child, id, node.id);
    if (found) return found;
  }
  return undefined;
}

/** 部门管理：组织架构树 + 新增/编辑部门 */
export default function DeptPage() {
  const { message } = App.useApp();
  const [tree, setTree] = useState<DeptNode>(mockDeptTree);
  const [expanded, setExpanded] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DeptNode | null>(null);
  const [form] = Form.useForm();

  const displayRoot = expanded
    ? tree
    : { ...tree, children: tree.children?.map((child) => ({ ...child, children: [] })) };

  const openCreate = (parentId?: string) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ parentId: parentId ?? tree.id });
    setOpen(true);
  };

  const openEdit = (node: DeptNode) => {
    setEditing(node);
    form.resetFields();
    form.setFieldsValue({
      parentId: findParentId(tree, node.id) ?? undefined,
      name: node.name,
      description: node.description,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      setTree((current) =>
        updateDept(current, editing.id, {
          name: values.name,
          description: values.description,
        }),
      );
      message.success('部门已更新');
    } else {
      const node: DeptNode = {
        id: `dept-${Date.now()}`,
        name: values.name,
        description: values.description,
      };
      setTree((current) => addDept(current, values.parentId ?? current.id, node));
      message.success('部门已新增');
    }
    setOpen(false);
  };

  return (
    <div className="sa-dept">
      <PageContainer className="sa-dept__header">
        <PageHeading
          title="部门管理"
          hint="点击组织架构中的节点可以编辑部门信息"
          extra={
            <div className="sa-dept__actions">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
                新增
              </Button>
              <Button onClick={() => setExpanded((value) => !value)}>
                {expanded ? '折叠' : '展开'}
              </Button>
            </div>
          }
        />
      </PageContainer>

      <Panel className="sa-dept__canvas">
        <OrgChart root={displayRoot} zoom={zoom} onNodeClick={openEdit} />

        <div className="sa-dept__zoom">
          <span className="sa-dept__zoom-value">{Math.round(zoom * 100)}%</span>
          <Tooltip title="适配画布" placement="left">
            <Button size="small" icon={<CompressOutlined />} onClick={() => setZoom(1)} />
          </Tooltip>
          <Tooltip title="放大" placement="left">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))}
            />
          </Tooltip>
          <Tooltip title="缩小" placement="left">
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))}
            />
          </Tooltip>
          <Tooltip title="导出" placement="left">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.info('演示环境暂不支持导出')}
            />
          </Tooltip>
          <Tooltip title="全屏" placement="left">
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={() => message.info('演示环境暂不支持全屏')}
            />
          </Tooltip>
        </div>
      </Panel>

      <Modal
        title={editing ? '编辑部门' : '新增部门'}
        open={open}
        width={396}
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
          <Form.Item name="parentId" label="上级部门">
            <Select
              placeholder="请选择上级部门"
              options={collectDeptOptions(tree, 0, editing?.id)}
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="description" label="部门描述">
            <Input.TextArea rows={3} placeholder="请输入部门描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

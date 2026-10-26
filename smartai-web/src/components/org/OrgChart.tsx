import type { DeptNode } from '@/services/mock-data';
import '@/components/org/org-chart.less';

export interface OrgChartProps {
  root: DeptNode;
  /** 缩放比例，1 为原始大小 */
  zoom?: number;
  /** 点击节点回调 */
  onNodeClick?: (node: DeptNode) => void;
}

function renderChildren(nodes: DeptNode[], onNodeClick?: (node: DeptNode) => void) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.id}>
          <button type="button" className="sa-org__node" onClick={() => onNodeClick?.(node)}>
            {node.name}
          </button>
          {node.children?.length ? renderChildren(node.children, onNodeClick) : null}
        </li>
      ))}
    </ul>
  );
}

/** 部门组织架构树：纯 CSS 连线 + 缩放容器 */
export function OrgChart({ root, zoom = 1, onNodeClick }: OrgChartProps) {
  return (
    <div className="sa-org" style={{ transform: `scale(${zoom})` }}>
      <div className="sa-org__root">
        <button
          type="button"
          className="sa-org__node sa-org__node--root"
          onClick={() => onNodeClick?.(root)}
        >
          {root.name}
        </button>
      </div>
      {root.children?.length ? renderChildren(root.children, onNodeClick) : null}
    </div>
  );
}

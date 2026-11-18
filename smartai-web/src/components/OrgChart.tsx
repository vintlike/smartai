import { type ReactNode, useLayoutEffect, useRef } from 'react';
import './org-chart.less';

export interface OrgChartNode {
  id: string;
  title: ReactNode;
  children?: OrgChartNode[];
}

export interface OrgChartProps {
  /** 根节点列表（支持多个根部门） */
  nodes: OrgChartNode[];
  /** 缩放比例，1 为原始大小 */
  zoom?: number;
  /** 当前选中节点 */
  selectedId?: string;
  /** 点击节点回调 */
  onSelect?: (id: string) => void;
}

function renderChildren(
  nodes: OrgChartNode[],
  selectedId: string | undefined,
  onSelect: ((id: string) => void) | undefined,
) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            className={`app-org-node${selectedId === node.id ? ' is-selected' : ''}`}
            onClick={() => onSelect?.(node.id)}
          >
            {node.title}
          </button>
          {node.children?.length ? renderChildren(node.children, selectedId, onSelect) : null}
        </li>
      ))}
    </ul>
  );
}

/** 部门组织架构图：纯 CSS 连线 + 缩放容器，无第三方依赖 */
export function OrgChart({ nodes, zoom = 1, selectedId, onSelect }: OrgChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /** 根节点位于整棵树的水平中心：内容超宽时把滚动位置居中，避免初始只看到最左侧分支 */
  // biome-ignore lint/correctness/useExhaustiveDependencies: 节点或缩放变化后内容宽度会变，需要重新居中滚动
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2);
  }, [nodes, zoom]);

  if (nodes.length === 0) return null;

  return (
    <div ref={scrollRef} className="app-org-chart-scroll">
      <div className="app-org-chart" style={{ zoom }}>
        <div className="app-org-chart__roots">
          {nodes.map((node) => (
            <div key={node.id} className="app-org-chart__tree">
              <button
                type="button"
                className={`app-org-node app-org-node--root${
                  selectedId === node.id ? ' is-selected' : ''
                }`}
                onClick={() => onSelect?.(node.id)}
              >
                {node.title}
              </button>
              {node.children?.length ? renderChildren(node.children, selectedId, onSelect) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

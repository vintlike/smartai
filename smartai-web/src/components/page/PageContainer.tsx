import type { ReactNode } from 'react';
import { Button, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import '@/components/page/page.less';

export type PagePadding = 'default' | 'compact' | 'none';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  padding?: PagePadding;
}

/** 页面级白色容器：统一圆角、内边距，作为业务页面的最外层卡片 */
export function PageContainer({ children, className, padding = 'default' }: PageContainerProps) {
  return (
    <div
      className={['sa-page-container', `sa-page-container--${padding}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export interface PanelProps {
  children: ReactNode;
  /** 面板标题，为空时不渲染标题栏 */
  title?: ReactNode;
  /** 标题右侧内容 */
  extra?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** 标题栏是否带下边框 */
  divider?: boolean;
}

/** 区块卡片：用于页面内部拆分出的独立白色区块 */
export function Panel({ children, title, extra, className, bodyClassName, divider }: PanelProps) {
  return (
    <section className={['sa-panel', className].filter(Boolean).join(' ')}>
      {title || extra ? (
        <header className={['sa-panel__header', divider ? 'sa-panel__header--divider' : ''].filter(Boolean).join(' ')}>
          <div className="sa-panel__title">{title}</div>
          <div className="sa-panel__extra">{extra}</div>
        </header>
      ) : null}
      <div className={['sa-panel__body', bodyClassName].filter(Boolean).join(' ')}>{children}</div>
    </section>
  );
}

export interface PageHeadingProps {
  title: ReactNode;
  description?: ReactNode;
  /** 标题后的虚线提示图标 */
  hint?: string;
  extra?: ReactNode;
}

/** 页面标题区：标题 + 描述 + 右侧操作 */
export function PageHeading({ title, description, hint, extra }: PageHeadingProps) {
  return (
    <div className="sa-page-heading">
      <div className="sa-page-heading__main">
        <div className="sa-page-heading__title">
          {title}
          {hint ? (
            <Tooltip title={hint}>
              <InfoCircleOutlined className="sa-page-heading__hint" />
            </Tooltip>
          ) : null}
        </div>
        {description ? <div className="sa-page-heading__desc">{description}</div> : null}
      </div>
      {extra ? <div className="sa-page-heading__extra">{extra}</div> : null}
    </div>
  );
}

export interface FilterBarProps {
  children?: ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  /** 是否隐藏操作按钮（如仅需要筛选字段时） */
  hideActions?: boolean;
}

/** 列表筛选区：左侧筛选项，右侧「查询 / 重置」 */
export function FilterBar({ children, onSearch, onReset, hideActions }: FilterBarProps) {
  return (
    <div className="sa-filter-bar">
      <div className="sa-filter-bar__fields">{children}</div>
      {hideActions ? null : (
        <div className="sa-filter-bar__actions">
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
          <Button onClick={onReset}>重置</Button>
        </div>
      )}
    </div>
  );
}

export interface FilterItemProps {
  label: ReactNode;
  children: ReactNode;
  /** 控件宽度 */
  width?: number;
}

/** 单个筛选项：标签 + 控件 */
export function FilterItem({ label, children, width = 220 }: FilterItemProps) {
  return (
    <div className="sa-filter-item">
      <span className="sa-filter-item__label">{label}</span>
      <div className="sa-filter-item__control" style={{ width }}>
        {children}
      </div>
    </div>
  );
}

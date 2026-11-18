import { Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

const { Title } = Typography;

export interface PageContainerProps {
  /** 页面标题 */
  title?: ReactNode;
  /** 标题左侧附加内容（如返回按钮），渲染在 title 之前 */
  titleBefore?: ReactNode;
  /** 头部右侧操作区（如：新增、批量删除...） */
  extra?: ReactNode;
  /** 页面底部区域（如分页） */
  footer?: ReactNode;
  /** 页面主体内容 */
  children?: ReactNode;
  /** 是否给 page-content 加卡片容器样式（圆角阴影背景），默认 true */
  contentBordered?: boolean;
  /** page-content 额外类名 */
  contentClassName?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * 通用页面容器，统一各模块页面结构：
 * page-container
 *   page-header
 *     page-header-heading
 *       page-header-heading-left
 *         page-header-heading-title
 *       page-header-heading-extra
 *         page-header-heading-action
 *   page-content
 *   page-footer
 */
export default function PageContainer({
  title,
  titleBefore,
  extra,
  footer,
  children,
  contentBordered = true,
  contentClassName,
  className,
  style,
}: PageContainerProps) {
  return (
    <div className={`page-container ${className ?? ''}`} style={style}>
      {(title || titleBefore || extra) && (
        <div className="page-header">
          <div className="page-header-heading flex items-center justify-between mb-5">
            <div className="page-header-heading-left flex items-center gap-2">
              {titleBefore}
              {title && (
                <Title level={4} className="page-header-heading-title mb-0!">
                  {title}
                </Title>
              )}
            </div>
            {extra && (
              <div className="page-header-heading-extra flex items-center gap-2">
                <div className="page-header-heading-action flex items-center gap-2">{extra}</div>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        className={`page-content ${contentBordered ? 'rounded-12px shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)] bg-[var(--ant-color-bg-container)] p-4' : ''} ${contentClassName ?? ''}`}
      >
        {children}
      </div>
      {footer && <div className="page-footer mt-4">{footer}</div>}
    </div>
  );
}

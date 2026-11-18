import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Markdown 渲染：支持 GFM 表格与链接，样式见 index.less 的 .app-markdown。
 * 与旧项目保持一致只用于 AI 回答；未引入数学公式与代码高亮依赖以控制体积，
 * react-markdown 默认不渲染原始 HTML，可避免 XSS。
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={`app-markdown ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export default Markdown;

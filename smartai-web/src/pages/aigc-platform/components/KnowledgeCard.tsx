import { DatabaseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { App, Button, Card, Space, Tag } from 'antd';
import type { KnowledgeBaseItem } from '../types';

export function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export interface KnowledgeCardProps {
  knowledge: KnowledgeBaseItem;
  onOpen: (knowledge: KnowledgeBaseItem) => void;
  onEdit: (knowledge: KnowledgeBaseItem) => void;
  onDelete: (knowledge: KnowledgeBaseItem) => void;
}

export default function KnowledgeCard({ knowledge, onOpen, onEdit, onDelete }: KnowledgeCardProps) {
  const { modal } = App.useApp();

  const confirmDelete = () => {
    modal.confirm({
      title: '删除知识库',
      content: `删除「${knowledge.name}」会同时移除其文档与切片，确定继续吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => onDelete(knowledge),
    });
  };

  return (
    <Card hoverable className="cursor-pointer" onClick={() => onOpen(knowledge)}>
      <div className="flex items-start gap-3">
        <div className="flex h-48px w-48px shrink-0 items-center justify-center rounded-12px bg-[var(--ant-color-fill-quaternary)] text-20px text-[var(--ant-color-primary)]">
          <DatabaseOutlined />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-15px font-600" title={knowledge.name}>
              {knowledge.name}
            </span>
            <Tag color="blue" className="m-0 shrink-0">
              {knowledge.docCount} 文档
            </Tag>
          </div>
          <div className="mt-1 line-clamp-2 min-h-36px text-12px text-[var(--ant-color-text-tertiary)]">
            {knowledge.description || '暂无描述'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <Tag>{knowledge.vectorDb || '未绑定向量库'}</Tag>
        <Tag color="purple">{knowledge.embeddingModel || '未绑定模型'}</Tag>
      </div>

      <div className="mt-3 flex items-center justify-between border-0 border-t border-solid border-[var(--ant-color-border-secondary)] pt-2">
        <span
          className="text-12px text-[var(--ant-color-text-tertiary)]"
          title={`创建者：${knowledge.createdBy}`}
        >
          {formatSize(knowledge.totalSize)} · {knowledge.createdAt.slice(0, 10)}
        </span>
        <Space size={2}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(knowledge);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              confirmDelete();
            }}
          >
            删除
          </Button>
        </Space>
      </div>
    </Card>
  );
}

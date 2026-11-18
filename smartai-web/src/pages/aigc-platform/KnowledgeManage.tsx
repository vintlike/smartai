import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Pagination } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QueryParams } from '@/api/types';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import KnowledgeCard from './components/KnowledgeCard';
import KnowledgeFormModal, { type KnowledgeFormValues } from './components/KnowledgeFormModal';
import { mockEmbeddingModels, mockKnowledgeBases, mockVectorDBs } from './mockData';
import type { KnowledgeBaseItem } from './types';

const PAGE_SIZE = 12;

function formatNow(): string {
  return new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\//g, '-');
}

export default function KnowledgeManage() {
  const navigate = useNavigate();
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeBaseItem[]>(mockKnowledgeBases);
  const [query, setQuery] = useState<QueryParams>({});
  const [current, setCurrent] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBaseItem | null>(null);

  const filteredList = useMemo(() => {
    const keyword = typeof query.keyword === 'string' ? query.keyword.toLowerCase() : '';
    return knowledgeList.filter((item) => {
      if (keyword) {
        const haystack = `${item.name}${item.description}${item.createdBy}`;
        if (!haystack.toLowerCase().includes(keyword)) return false;
      }
      if (typeof query.vectorDb === 'string' && item.vectorDb !== query.vectorDb) return false;
      if (
        typeof query.embeddingModel === 'string' &&
        item.embeddingModel !== query.embeddingModel
      ) {
        return false;
      }
      return true;
    });
  }, [knowledgeList, query]);

  const total = filteredList.length;
  const pagedList = filteredList.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setCurrent(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setCurrent(1);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (knowledge: KnowledgeBaseItem) => {
    setEditing(knowledge);
    setModalOpen(true);
  };

  const handleSubmit = (values: KnowledgeFormValues) => {
    if (editing) {
      setKnowledgeList((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...item, ...values } : item)),
      );
    } else {
      const newKnowledge: KnowledgeBaseItem = {
        id: String(Date.now()),
        name: values.name,
        description: values.description,
        vectorDb: values.vectorDb,
        embeddingModel: values.embeddingModel,
        docCount: 0,
        totalSize: 0,
        createdAt: formatNow(),
        createdBy: '当前用户',
      };
      setKnowledgeList((prev) => [newKnowledge, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <PageContainer
      title="知识库管理"
      contentBordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增知识库
        </Button>
      }
      footer={
        total > PAGE_SIZE ? (
          <div className="flex justify-end">
            <Pagination
              showQuickJumper
              current={current}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={(page) => setCurrent(page)}
              showTotal={(value) => `共${value}条记录`}
            />
          </div>
        ) : undefined
      }
    >
      <SearchBar
        fields={[
          { name: 'keyword', label: '知识库名称', placeholder: '名称 / 描述 / 创建者', width: 220 },
          {
            name: 'vectorDb',
            label: '向量库',
            type: 'select',
            width: 180,
            options: mockVectorDBs.map((item) => ({ value: item.alias, label: item.alias })),
          },
          {
            name: 'embeddingModel',
            label: '向量化模型',
            type: 'select',
            width: 200,
            options: mockEmbeddingModels.map((item) => ({
              value: `${item.name} - ${item.alias}`,
              label: `${item.name} - ${item.alias}`,
            })),
          },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <button
          type="button"
          className="flex min-h-180px cursor-pointer flex-col items-center justify-center gap-2 rounded-12px border border-dashed border-[var(--ant-color-border)] bg-transparent transition-colors hover:border-[var(--ant-color-primary)] hover:bg-[var(--ant-color-primary-bg)]"
          onClick={openCreate}
        >
          <span className="flex h-48px w-48px items-center justify-center rounded-12px bg-[var(--ant-color-fill-quaternary)] text-20px text-[var(--ant-color-primary)]">
            <PlusOutlined />
          </span>
          <span className="text-15px font-600">新建知识库</span>
          <span className="text-12px text-[var(--ant-color-text-quaternary)]">创建新的知识库</span>
        </button>
        {pagedList.map((knowledge) => (
          <KnowledgeCard
            key={knowledge.id}
            knowledge={knowledge}
            onOpen={(item) => navigate(`/aigc-platform/knowledge/${item.id}`)}
            onEdit={openEdit}
            onDelete={(item) =>
              setKnowledgeList((prev) => prev.filter((entry) => entry.id !== item.id))
            }
          />
        ))}
      </div>
      {pagedList.length ? null : (
        <Card className="mt-3">
          <Empty
            description={
              Object.keys(query).length ? '没有匹配的知识库' : '暂无知识库，先创建一个吧'
            }
          />
        </Card>
      )}
      <KnowledgeFormModal
        open={modalOpen}
        knowledge={editing}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}

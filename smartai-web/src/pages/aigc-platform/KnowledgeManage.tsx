import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Empty, Pagination } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EmbedStoreRecord, KnowledgeRecord, ModelRecord } from '@/api/aigc';
import { embedStoreApi, knowledgeApi, modelApi } from '@/api/aigc';
import type { QueryParams } from '@/api/types';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import KnowledgeCard from './components/KnowledgeCard';
import KnowledgeFormModal, { type KnowledgeFormValues } from './components/KnowledgeFormModal';
import type { KnowledgeBaseItem } from './types';

const PAGE_SIZE = 12;

export default function KnowledgeManage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeBaseItem[]>([]);
  const [stores, setStores] = useState<EmbedStoreRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [query, setQuery] = useState<QueryParams>({});
  const [current, setCurrent] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBaseItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [knowledgeResult, storeResult, modelResult] = await Promise.all([
        knowledgeApi.list({ pageSize: 100 }),
        embedStoreApi.list({ pageSize: 100 }),
        modelApi.list({ type: 'embedding', pageSize: 100 }),
      ]);
      setStores(storeResult.list);
      setModels(modelResult.list);
      setKnowledgeList(
        knowledgeResult.list.map((record: KnowledgeRecord) => ({
          id: record.id,
          name: record.name,
          description: record.description ?? '',
          vectorDb:
            record.embedStoreName ??
            storeResult.list.find((item) => item.id === record.embedStoreId)?.name ??
            '',
          embeddingModel:
            record.embedModelName ??
            modelResult.list.find((item) => item.id === record.embedModelId)?.name ??
            '',
          embedStoreId: record.embedStoreId,
          embedModelId: record.embedModelId,
          docCount: record.docCount ?? 0,
          totalSize: record.totalSize ?? 0,
          createdAt: record.createTime ?? '',
          createdBy: record.username ?? '',
        })),
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : '知识库加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const handleSubmit = async (values: KnowledgeFormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        embedStoreId: values.vectorDb,
        embedModelId: values.embeddingModel,
      };
      if (editing) {
        await knowledgeApi.update({ ...payload, id: editing.id });
        message.success('知识库已保存');
      } else {
        await knowledgeApi.create(payload);
        message.success('知识库已创建');
      }
      setModalOpen(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存知识库失败');
    }
  };

  const handleDelete = async (item: KnowledgeBaseItem) => {
    try {
      await knowledgeApi.delete(item.id);
      message.success('删除成功');
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
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
            options: stores.map((item) => ({ value: item.name, label: item.name })),
          },
          {
            name: 'embeddingModel',
            label: '向量化模型',
            type: 'select',
            width: 200,
            options: models.map((item) => ({
              value: item.name,
              label: item.name,
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
            onDelete={handleDelete}
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
        vectorDbOptions={stores.map((item) => ({ value: item.id, label: item.name }))}
        embeddingModelOptions={models.map((item) => ({ value: item.id, label: item.name }))}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}

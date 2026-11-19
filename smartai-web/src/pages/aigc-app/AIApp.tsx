import { PlusOutlined } from '@ant-design/icons';
import { App, Pagination } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppRecord, ModelRecord } from '@/api/aigc';
import { appApi, modelApi } from '@/api/aigc';
import PageContainer from '@/components/PageContainer';
import {
  mapAppRecord,
  parseCover,
  readFileAsDataUrl,
  serializeCover,
  toModelOptions,
} from './appUtils';
import AppCard from './components/AppCard';
import AppFormModal, { type AppFormValues } from './components/AppFormModal';
import type { AIApp } from './types';

const PAGE_SIZE = 11;

export default function AIAppManage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AIApp[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [current, setCurrent] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AIApp | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await appApi.list();
      setApps(result.list.map((item: AppRecord) => mapAppRecord(item, models)));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '应用列表加载失败');
    }
  }, [message, models]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const modelResult = await modelApi.list({ pageSize: 100 });
        if (cancelled) return;
        setModels(modelResult.list);
        const appResult = await appApi.list();
        if (cancelled) return;
        setApps(appResult.list.map((item: AppRecord) => mapAppRecord(item, modelResult.list)));
      } catch (error) {
        if (!cancelled) message.error(error instanceof Error ? error.message : '应用列表加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [message]);

  const total = apps.length;
  const pagedApps = apps.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (app: AIApp) => {
    setEditing(app);
    setModalOpen(true);
  };

  const handleSubmit = async (values: AppFormValues) => {
    try {
      const file = values.cover?.[0]?.originFileObj;
      const image = file ? await readFileAsDataUrl(file) : parseCover(editing?.cover).image;
      const payload = {
        name: values.name,
        modelId: values.model,
        description: values.description,
        prompt: editing?.prompt ?? '',
        knowledgeIds: (editing?.knowledgeBaseIds ?? []).join(','),
        cover: serializeCover(values.logo, image),
      };
      if (editing) {
        await appApi.update({ ...payload, id: editing.id });
        message.success('保存成功');
      } else {
        await appApi.create(payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      setEditing(null);
      await refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleDelete = async (app: AIApp) => {
    try {
      await appApi.delete(app.id);
      message.success('删除成功');
      if (pagedApps.length === 1 && current > 1) setCurrent(current - 1);
      await refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  return (
    <PageContainer
      title="AI应用管理"
      contentBordered={false}
      contentClassName="rounded-12px shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)] bg-[var(--ant-color-bg-container)] p-6"
      footer={
        total > PAGE_SIZE ? (
          <div className="flex justify-end">
            <Pagination
              showSizeChanger
              showQuickJumper
              defaultCurrent={1}
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        <button
          type="button"
          className="h-220px flex flex-col items-center justify-center gap-2 rounded-12px border border-dashed border-[var(--ant-color-border)] bg-transparent transition-colors hover:border-[var(--ant-color-primary)] hover:bg-[var(--ant-color-primary-bg)]"
          onClick={openCreate}
        >
          <span className="flex h-48px w-48px items-center justify-center rounded-12px bg-[var(--ant-color-fill-tertiary)] text-[var(--ant-color-text-tertiary)]">
            <PlusOutlined style={{ fontSize: 22 }} />
          </span>
          <span className="text-15px font-500">创建应用</span>
          <span className="text-12px text-[var(--ant-color-text-quaternary)]">创建空白应用</span>
        </button>
        {pagedApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onOpen={(item) => navigate(`/aigc-app/config/${item.id}`)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <AppFormModal
        open={modalOpen}
        app={editing}
        modelOptions={toModelOptions(models)}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}

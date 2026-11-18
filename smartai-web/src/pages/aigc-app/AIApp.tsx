import { PlusOutlined } from '@ant-design/icons';
import { Pagination } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import AppCard from './components/AppCard';
import AppFormModal, { type AppFormValues } from './components/AppFormModal';
import { mockApps } from './mockData';
import type { AIApp } from './types';

const PAGE_SIZE = 11;

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

export default function AIAppManage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AIApp[]>(mockApps);
  const [current, setCurrent] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AIApp | null>(null);

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

  const handleSubmit = (values: AppFormValues) => {
    if (editing) {
      setApps((prev) =>
        prev.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name: values.name,
                model: values.model,
                logo: values.logo,
                description: values.description,
              }
            : item,
        ),
      );
    } else {
      const newApp: AIApp = {
        id: Date.now().toString(),
        name: values.name,
        logo: values.logo,
        model: values.model,
        description: values.description,
        prompt: '',
        knowledgeBaseIds: [],
        createdAt: formatNow(),
        createdBy: '当前用户',
      };
      setApps((prev) => [newApp, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <PageContainer
      title="AI应用管理"
      contentBordered={false}
      contentClassName="rounded-12px shadow-[0_1px_2px_0_rgba(0,0,0,0.03),0_1px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_0_rgba(0,0,0,0.02)] bg-[var(--ant-color-bg-container)] p-6"
      footer={
        total > 11 ? (
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
            onDelete={(item) => setApps((prev) => prev.filter((current) => current.id !== item.id))}
          />
        ))}
      </div>
      <AppFormModal
        open={modalOpen}
        app={editing}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}

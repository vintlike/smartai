import { EllipsisOutlined } from '@ant-design/icons';
import { App, Dropdown, type MenuProps, Typography } from 'antd';
import { modelOptions } from '../mockData';
import type { AIApp } from '../types';

const { Paragraph } = Typography;

export interface AppCardProps {
  app: AIApp;
  onOpen: (app: AIApp) => void;
  onEdit: (app: AIApp) => void;
  onDelete: (app: AIApp) => void;
}

export default function AppCard({ app, onOpen, onEdit, onDelete }: AppCardProps) {
  const { modal } = App.useApp();
  const modelLabel = modelOptions.find((item) => item.value === app.model)?.label ?? app.model;

  const items: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑应用',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onEdit(app);
      },
    },
    {
      key: 'delete',
      label: '删除应用',
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        modal.confirm({
          title: '确认删除',
          content: `确定要删除应用「${app.name}」吗？删除后不可恢复。`,
          okText: '删除',
          okButtonProps: { danger: true },
          cancelText: '取消',
          onOk: () => onDelete(app),
        });
      },
    },
    { type: 'divider' },
    { key: 'createdAt', label: `创建时间：${app.createdAt}`, disabled: true },
    { key: 'createdBy', label: `创建者：${app.createdBy}`, disabled: true },
  ];

  return (
    <div
      className="h-220px p-5 rounded-12px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] transition-all hover:border-[var(--ant-color-primary)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] cursor-pointer flex flex-col"
      onClick={() => onOpen(app)}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-40px w-40px flex-shrink-0 items-center justify-center rounded-8px bg-[var(--ant-color-primary-bg)] text-20px">
          {app.logo}
        </span>
        <Paragraph
          className="mb-0! text-16px font-600"
          ellipsis={{ tooltip: app.name }}
          style={{ maxWidth: '70%' }}
        >
          {app.name}
        </Paragraph>
      </div>
      <div className="mt-3 text-12px text-[var(--ant-color-text-secondary)]">
        关联模型：{modelLabel}
      </div>
      <Paragraph
        className="mt-2 mb-0! text-13px text-[var(--ant-color-text-secondary)]"
        ellipsis={{ rows: 3 }}
      >
        {app.description}
      </Paragraph>
      <div className="mt-auto flex justify-end">
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <EllipsisOutlined
            className="text-16px text-[var(--ant-color-text-tertiary)] cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );
}

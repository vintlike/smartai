import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { App, Button, Descriptions, Drawer, Empty, Space, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import { Markdown } from '@/components/Markdown';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { mockConversationMessages, mockConversationSessions } from './mockData';
import type { ConversationMessageItem, ConversationRole, ConversationSessionItem } from './types';

const roleColors: Record<ConversationRole, string> = {
  user: 'blue',
  assistant: 'green',
  system: 'orange',
};

const roleLabels: Record<ConversationRole, string> = {
  user: '提问',
  assistant: '回答',
  system: '系统',
};

const PAGE_SIZE = 10;

/** 搜索值归一化：去空格并转小写，空值视为不参与过滤 */
function normalizeQuery(value: QueryParams[string]): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** 详情抽屉里的消息正文：AI 回答按 Markdown 渲染，其余角色保留换行，长文本可滚动 */
function MessageContent({ role, content }: { role: ConversationRole; content: string }) {
  return (
    <div className="max-h-360px overflow-y-auto rounded-8px border border-solid border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-fill-quaternary)] p-3">
      {role === 'assistant' ? (
        <Markdown content={content || '暂无内容'} />
      ) : (
        <div className="text-13px leading-6 whitespace-pre-wrap text-[var(--ant-color-text)]">
          {content || '暂无内容'}
        </div>
      )}
    </div>
  );
}

export default function ConversationManage() {
  const { message, modal } = App.useApp();
  const [messages, setMessages] = useState<ConversationMessageItem[]>(mockConversationMessages);
  const [sessions, setSessions] = useState<ConversationSessionItem[]>(mockConversationSessions);
  const [messageQuery, setMessageQuery] = useState<QueryParams>({});
  const [sessionQuery, setSessionQuery] = useState<QueryParams>({});
  const [messagePage, setMessagePage] = useState(1);
  const [messagePageSize, setMessagePageSize] = useState(PAGE_SIZE);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(PAGE_SIZE);
  const [messageDetail, setMessageDetail] = useState<ConversationMessageItem | null>(null);
  const [sessionDetail, setSessionDetail] = useState<ConversationSessionItem | null>(null);

  const filteredMessages = useMemo(() => {
    const content = normalizeQuery(messageQuery.content);
    const username = normalizeQuery(messageQuery.username);
    const role = typeof messageQuery.role === 'string' ? messageQuery.role : '';
    return messages.filter((item) => {
      if (role && item.role !== role) return false;
      if (username && !item.username.toLowerCase().includes(username)) return false;
      if (content && !item.content.toLowerCase().includes(content)) return false;
      return true;
    });
  }, [messages, messageQuery]);

  const filteredSessions = useMemo(() => {
    const title = normalizeQuery(sessionQuery.title);
    const username = normalizeQuery(sessionQuery.username);
    return sessions.filter((item) => {
      if (title && !item.title.toLowerCase().includes(title)) return false;
      if (username && !item.username.toLowerCase().includes(username)) return false;
      return true;
    });
  }, [sessions, sessionQuery]);

  /** 会话详情：按所属会话聚合消息，按时间正序还原对话过程 */
  const sessionMessages = useMemo(() => {
    if (!sessionDetail) return [];
    return messages
      .filter((item) => item.sessionId === sessionDetail.id)
      .slice()
      .sort((a, b) => a.conversationTime.localeCompare(b.conversationTime));
  }, [messages, sessionDetail]);

  const removeMessage = (record: ConversationMessageItem) => {
    modal.confirm({
      title: '删除消息',
      content: '删除后不可恢复，确定继续吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setMessages((prev) => prev.filter((item) => item.id !== record.id));
        setMessageDetail((prev) => (prev?.id === record.id ? null : prev));
        message.success('消息已删除');
      },
    });
  };

  const removeSession = (record: ConversationSessionItem) => {
    modal.confirm({
      title: '删除会话',
      content: `删除「${record.title}」会同时清空该会话下的全部消息，确定继续吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setSessions((prev) => prev.filter((item) => item.id !== record.id));
        setMessages((prev) => prev.filter((item) => item.sessionId !== record.id));
        setSessionDetail((prev) => (prev?.id === record.id ? null : prev));
        message.success('会话已删除');
      },
    });
  };

  const messageColumns: ColumnsType<ConversationMessageItem> = [
    { title: '用户名', dataIndex: 'username', width: 100 },
    { title: '请求IP', dataIndex: 'ip', width: 140 },
    {
      title: '对话角色',
      dataIndex: 'role',
      width: 100,
      render: (role: ConversationRole) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    { title: '模型名称', dataIndex: 'modelName', width: 130 },
    { title: 'Token消耗', dataIndex: 'tokenUsed', width: 110 },
    { title: '提示词Token消耗', dataIndex: 'promptTokenUsed', width: 140 },
    { title: '消息内容', dataIndex: 'content', ellipsis: true, width: 260 },
    { title: '会话时间', dataIndex: 'conversationTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={2}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setMessageDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeMessage(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const sessionColumns: ColumnsType<ConversationSessionItem> = [
    { title: '会话标题', dataIndex: 'title', ellipsis: true, width: 200 },
    { title: '用户', dataIndex: 'username', width: 100 },
    { title: '对话次数', dataIndex: 'messageCount', width: 100 },
    { title: 'Token消耗量', dataIndex: 'tokenUsed', width: 120 },
    { title: '最后一次对话时间', dataIndex: 'lastConversationTime', width: 170 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={2}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSessionDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeSession(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const messageToolbar = useTableToolbar<ConversationMessageItem>(messageColumns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setMessageQuery((prev) => ({ ...prev }));
  });

  const sessionToolbar = useTableToolbar<ConversationSessionItem>(sessionColumns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSessionQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer title="对话数据管理">
      <Tabs
        defaultActiveKey="messages"
        items={[
          {
            key: 'messages',
            label: '会话消息',
            children: (
              <div>
                <SearchBar
                  fields={[
                    {
                      name: 'content',
                      label: '消息内容',
                      placeholder: '请输入消息内容关键字',
                      width: 240,
                    },
                    {
                      name: 'username',
                      label: '用户',
                      placeholder: '请输入用户名',
                      width: 160,
                    },
                    {
                      name: 'role',
                      label: '角色',
                      type: 'select',
                      width: 140,
                      options: [
                        { label: '提问', value: 'user' },
                        { label: '回答', value: 'assistant' },
                        { label: '系统', value: 'system' },
                      ],
                    },
                  ]}
                  onSearch={(values) => {
                    setMessageQuery(values);
                    setMessagePage(1);
                  }}
                  onReset={() => {
                    setMessageQuery({});
                    setMessagePage(1);
                  }}
                />
                <DataTable
                  rowKey="id"
                  bordered
                  state={messageToolbar}
                  dataSource={filteredMessages}
                  scroll={{ x: 1280 }}
                  pagination={{
                    current: messagePage,
                    pageSize: messagePageSize,
                    total: filteredMessages.length,
                    onChange: (nextPage, nextPageSize) => {
                      setMessagePage(nextPage);
                      setMessagePageSize(nextPageSize);
                    },
                  }}
                />
              </div>
            ),
          },
          {
            key: 'sessions',
            label: '会话窗口',
            children: (
              <div>
                <SearchBar
                  fields={[
                    {
                      name: 'title',
                      label: '会话标题',
                      placeholder: '请输入会话标题',
                      width: 240,
                    },
                    {
                      name: 'username',
                      label: '用户',
                      placeholder: '请输入用户名',
                      width: 160,
                    },
                  ]}
                  onSearch={(values) => {
                    setSessionQuery(values);
                    setSessionPage(1);
                  }}
                  onReset={() => {
                    setSessionQuery({});
                    setSessionPage(1);
                  }}
                />
                <DataTable
                  rowKey="id"
                  bordered
                  state={sessionToolbar}
                  dataSource={filteredSessions}
                  scroll={{ x: 1000 }}
                  pagination={{
                    current: sessionPage,
                    pageSize: sessionPageSize,
                    total: filteredSessions.length,
                    onChange: (nextPage, nextPageSize) => {
                      setSessionPage(nextPage);
                      setSessionPageSize(nextPageSize);
                    },
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      <Drawer
        title="消息详情"
        size={520}
        open={Boolean(messageDetail)}
        onClose={() => setMessageDetail(null)}
      >
        {messageDetail ? (
          <div className="flex flex-col gap-3">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="用户">{messageDetail.username}</Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color={roleColors[messageDetail.role]}>{roleLabels[messageDetail.role]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="模型" span={2}>
                {messageDetail.modelName}
              </Descriptions.Item>
              <Descriptions.Item label="Tokens">{messageDetail.tokenUsed}</Descriptions.Item>
              <Descriptions.Item label="提示词 Tokens">
                {messageDetail.promptTokenUsed}
              </Descriptions.Item>
              <Descriptions.Item label="IP">{messageDetail.ip}</Descriptions.Item>
              <Descriptions.Item label="时间">{messageDetail.conversationTime}</Descriptions.Item>
              <Descriptions.Item label="所属会话" span={2}>
                {sessions.find((item) => item.id === messageDetail.sessionId)?.title ??
                  messageDetail.sessionId}
              </Descriptions.Item>
            </Descriptions>
            <div>
              <div className="mb-2 text-13px text-[var(--ant-color-text-secondary)]">消息内容</div>
              <MessageContent role={messageDetail.role} content={messageDetail.content} />
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        title={sessionDetail ? `会话：${sessionDetail.title}` : '会话记录'}
        size={620}
        open={Boolean(sessionDetail)}
        onClose={() => setSessionDetail(null)}
      >
        {sessionDetail ? (
          <div className="flex flex-col gap-3">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="用户">{sessionDetail.username}</Descriptions.Item>
              <Descriptions.Item label="对话次数">{sessionDetail.messageCount}</Descriptions.Item>
              <Descriptions.Item label="消耗 Tokens">{sessionDetail.tokenUsed}</Descriptions.Item>
              <Descriptions.Item label="已加载消息">{sessionMessages.length} 条</Descriptions.Item>
              <Descriptions.Item label="创建时间">{sessionDetail.createTime}</Descriptions.Item>
              <Descriptions.Item label="最后活跃">
                {sessionDetail.lastConversationTime}
              </Descriptions.Item>
            </Descriptions>
            {sessionMessages.length ? (
              <div className="flex flex-col gap-3">
                {sessionMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`border-l-3 border-solid pl-3 ${
                      item.role === 'user'
                        ? 'border-[var(--ant-color-primary)]'
                        : 'border-[var(--ant-color-success)]'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-12px text-[var(--ant-color-text-tertiary)]">
                      <Tag color={roleColors[item.role]}>{roleLabels[item.role]}</Tag>
                      <span>{item.modelName}</span>
                      <span>{item.conversationTime}</span>
                      <span>{item.tokenUsed} tokens</span>
                    </div>
                    {item.role === 'assistant' ? (
                      <Markdown content={item.content} />
                    ) : (
                      <div className="text-13px leading-6 whitespace-pre-wrap text-[var(--ant-color-text)]">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无消息" />
            )}
          </div>
        ) : null}
      </Drawer>
    </PageContainer>
  );
}

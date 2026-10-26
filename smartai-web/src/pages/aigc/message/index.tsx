import { DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Button, Input, Tabs } from 'antd';
import { useMemo, useState } from 'react';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { ChatWindowItem, MessageItem } from '@/services/mock-data';
import { mockChatWindows, mockMessages } from '@/services/mock-data';
import '@/pages/aigc/message/message.less';

/** 对话数据：会话消息列表 / 会话窗口列表 */
export default function MessagePage() {
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [windowKeyword, setWindowKeyword] = useState('');

  const messageColumns = useMemo<TableColumnsType<MessageItem>>(
    () => [
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '请求ip', dataIndex: 'ip', key: 'ip', width: 130 },
      { title: '对话角色', dataIndex: 'role', key: 'role', width: 100 },
      { title: '模型名称', dataIndex: 'model', key: 'model' },
      { title: 'Token消耗', dataIndex: 'tokens', key: 'tokens', width: 120 },
      { title: '提示词Token消耗', dataIndex: 'promptTokens', key: 'promptTokens', width: 150 },
      { title: '消息内容', dataIndex: 'content', key: 'content', width: 260, ellipsis: true },
      { title: '会话时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: () => (
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        ),
      },
    ],
    [],
  );

  const windowColumns = useMemo<TableColumnsType<ChatWindowItem>>(
    () => [
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '窗口标题', dataIndex: 'title', key: 'title' },
      { title: '对话次数', dataIndex: 'count', key: 'count', width: 110 },
      { title: 'Token消耗量', dataIndex: 'tokens', key: 'tokens', width: 130 },
      { title: '最后一次对话时间', dataIndex: 'lastAt', key: 'lastAt', width: 190 },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 190 },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: () => (
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        ),
      },
    ],
    [],
  );

  const messageState = useTableToolbar(messageColumns);
  const windowState = useTableToolbar(windowColumns);

  return (
    <PageContainer>
      <Tabs
        defaultActiveKey="message"
        items={[
          {
            key: 'message',
            label: '会话消息列表',
            children: (
              <div className="sa-message-tab">
                <FilterBar
                  onReset={() => {
                    setContent('');
                    setUsername('');
                  }}
                >
                  <FilterItem label="内容">
                    <Input
                      placeholder="请输入内容查询"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      allowClear
                    />
                  </FilterItem>
                  <FilterItem label="用户名">
                    <Input
                      placeholder="请输入用户名查询"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      allowClear
                    />
                  </FilterItem>
                </FilterBar>
                <DataTable<MessageItem>
                  state={messageState}
                  dataSource={mockMessages.filter(
                    (item) =>
                      item.content.includes(content.trim()) &&
                      item.username.includes(username.trim()),
                  )}
                />
              </div>
            ),
          },
          {
            key: 'window',
            label: '会话窗口列表',
            children: (
              <div className="sa-message-tab">
                <FilterBar onReset={() => setWindowKeyword('')}>
                  <FilterItem label="内容">
                    <Input
                      placeholder="请输入内容"
                      value={windowKeyword}
                      onChange={(event) => setWindowKeyword(event.target.value)}
                      allowClear
                    />
                  </FilterItem>
                </FilterBar>
                <DataTable<ChatWindowItem>
                  state={windowState}
                  dataSource={mockChatWindows.filter((item) =>
                    item.title.includes(windowKeyword.trim()),
                  )}
                />
              </div>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}

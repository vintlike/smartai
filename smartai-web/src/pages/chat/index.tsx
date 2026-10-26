import { ClearOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Select, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@/components/page/PageContainer';
import { modelOptions } from '@/services/mock-data';
import '@/pages/chat/chat.less';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

/** 演示回复：真实项目在此调用流式对话接口 */
const demoReply =
  '当前是前端演示环境，对话数据均为本地模拟。接入真实模型后，这里会展示流式返回的回答内容。';

/** AI 聊天助手：模型选择 + 对话区 + 输入框 */
export default function ChatPage() {
  const { message } = App.useApp();
  const [model, setModel] = useState<string>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const element = bodyRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);

  const send = () => {
    const content = draft.trim();
    if (!content) return;
    idRef.current += 1;
    const userId = idRef.current;
    setMessages((list) => [...list, { id: userId, role: 'user', content }]);
    setDraft('');
    window.setTimeout(() => {
      idRef.current += 1;
      setMessages((list) => [...list, { id: idRef.current, role: 'assistant', content: demoReply }]);
    }, 400);
  };

  const clear = () => {
    if (messages.length === 0) return;
    setMessages([]);
    message.success('已清空当前对话');
  };

  return (
    <PageContainer className="sa-chat" padding="none">
      <header className="sa-chat__header">
        <div className="sa-chat__title">
          <RobotOutlined className="sa-chat__title-icon" />
          AI聊天助手
        </div>
        <div className="sa-chat__actions">
          <Select
            className="sa-chat__model"
            placeholder="请选择关联模型"
            options={modelOptions}
            value={model}
            onChange={setModel}
            allowClear
          />
          <Button className="sa-chat__clear" icon={<ClearOutlined />} onClick={clear}>
            清空聊天
          </Button>
        </div>
      </header>

      <div className="sa-chat__body" ref={bodyRef}>
        {messages.length === 0 ? (
          <div className="sa-chat__empty">
            <RobotOutlined className="sa-chat__empty-icon" />
            <p className="sa-chat__empty-title">我是 SmartAI 助手</p>
            <p className="sa-chat__empty-desc">选择关联模型后，在下方输入内容开始对话</p>
          </div>
        ) : (
          <div className="sa-chat__messages">
            {messages.map((item) => (
              <div key={item.id} className={`sa-chat__message sa-chat__message--${item.role}`}>
                <span className="sa-chat__avatar">
                  {item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </span>
                <div className="sa-chat__bubble">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sa-chat__footer">
        <div className="sa-chat__composer">
          <textarea
            className="sa-chat__input"
            rows={1}
            placeholder="今天想聊些什么~"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <Tooltip title="发送">
            <Button type="text" className="sa-chat__send" icon={<SendOutlined />} onClick={send} />
          </Tooltip>
        </div>
      </div>
    </PageContainer>
  );
}

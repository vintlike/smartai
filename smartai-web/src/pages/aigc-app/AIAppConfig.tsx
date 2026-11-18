import {
  ApiOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  LinkOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Input, Select, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import ApiChannelPanel from './components/ApiChannelDrawer';
import { mockApps, modelOptions } from './mockData';

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAppConfig() {
  const { message } = App.useApp();
  const { appId } = useParams();
  const navigate = useNavigate();
  const app = mockApps.find((item) => item.id === appId) ?? mockApps[0];

  const [activeView, setActiveView] = useState<'config' | 'api'>('config');
  const [prompt, setPrompt] = useState(app.prompt);
  const [model, setModel] = useState(app.model);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testInput, setTestInput] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setPrompt(app.prompt);
    setModel(app.model);
    setTestMessages([]);
    setTestInput('');
  }, [app]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleSavePrompt = () => {
    message.success('提示词已保存');
  };

  const handleSendTest = () => {
    const value = testInput.trim();
    if (!value) return;
    setTestMessages((prev) => [
      ...prev,
      { id: `test-${Date.now()}`, role: 'user', content: value },
    ]);
    setTestInput('');
    timerRef.current = window.setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          id: `test-${Date.now()}-reply`,
          role: 'assistant',
          content: `这是来自「${app.name}」的模拟回复。实际接入后将根据 Prompt 和知识库内容生成回答。`,
        },
      ]);
    }, 800);
  };

  return (
    <PageContainer
      className="flex flex-col h-full"
      titleBefore={
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/aigc-app/manage')}
          />
          <span className="flex h-36px w-36px items-center justify-center rounded-8px bg-[var(--ant-color-primary-bg)] text-18px">
            {app.logo}
          </span>
        </div>
      }
      title={app.name}
      extra={
        <>
          <Button
            type={activeView === 'config' ? 'primary' : 'default'}
            icon={<SettingOutlined />}
            onClick={() => setActiveView('config')}
          >
            应用配置
          </Button>
          <Button
            type={activeView === 'api' ? 'primary' : 'default'}
            icon={<ApiOutlined />}
            onClick={() => setActiveView('api')}
          >
            API 接入渠道
          </Button>
        </>
      }
      contentBordered={false}
      contentClassName="flex-1 flex flex-col min-h-0"
    >
      {activeView === 'config' ? (
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-30% flex flex-col rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] p-4">
            <div className="text-14px font-600 mb-3">Prompt 提示词</div>
            <Input.TextArea
              className="flex-1!"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="请输入系统提示词，定义 AI 的行为和回答风格..."
            />
            <div className="flex justify-end mt-3">
              <Button type="primary" size="small" onClick={handleSavePrompt}>
                保存
              </Button>
            </div>
          </div>

          <div className="w-40% flex-shrink-0 flex flex-col rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] p-4">
            <div className="text-14px font-600 mb-3">基础配置</div>
            <div className="text-12px text-[var(--ant-color-text-secondary)] mb-2">对话模型</div>
            <Select
              className="w-full"
              value={model}
              onChange={(value) => setModel(value)}
              options={modelOptions}
            />
            <div className="text-14px font-600 mt-4 mb-2">知识库</div>
            <div className="text-12px text-[var(--ant-color-text-secondary)] mb-3">
              将文档、URL、三方数据源上传为文本知识库后，用户发送消息时，Bot
              能够引用文本知识中的内容回答用户问题。
            </div>
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              showUploadList={false}
              className="flex-1!"
            >
              <div className="flex flex-col items-center gap-2">
                <CloudUploadOutlined style={{ fontSize: 24, color: 'var(--ant-color-primary)' }} />
                <span className="text-13px text-[var(--ant-color-text-secondary)]">
                  点击或拖拽上传文档
                </span>
              </div>
            </Upload.Dragger>
            <Button icon={<LinkOutlined />} block className="mt-3">
              添加 URL 数据源
            </Button>
          </div>

          <div className="flex-1 min-w-0 flex flex-col rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] p-4">
            <div className="text-14px font-600 mb-3">聊天测试</div>
            <div className="flex-1 overflow-auto min-h-0">
              {testMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-13px text-[var(--ant-color-text-quaternary)]">
                  发送消息开始测试
                </div>
              ) : (
                testMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`mb-3 flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-80% px-3 py-2 rounded-8px text-13px whitespace-pre-wrap ${
                        item.role === 'user'
                          ? 'bg-[var(--ant-color-primary)] text-white'
                          : 'bg-[var(--ant-color-bg-text-secondary)]'
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3">
              <Input.TextArea
                rows={4}
                value={testInput}
                onChange={(event) => setTestInput(event.target.value)}
                placeholder="输入消息进行测试..."
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  disabled={!testInput.trim()}
                  onClick={handleSendTest}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ApiChannelPanel appName={app.name} appId={app.id} />
      )}
    </PageContainer>
  );
}

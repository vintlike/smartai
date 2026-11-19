import {
  ApiOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  LinkOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Input, Select, Spin, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { appApi, type ChatStreamTask, type ModelRecord, modelApi, streamChat } from '@/api/aigc';
import PageContainer from '@/components/PageContainer';
import { mapAppRecord, toModelOptions } from './appUtils';
import ApiChannelPanel from './components/ApiChannelDrawer';
import type { AIApp } from './types';

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAppConfig() {
  const { message } = App.useApp();
  const { appId } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState<AIApp | null>(null);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [activeView, setActiveView] = useState<'config' | 'api'>('config');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testInput, setTestInput] = useState('');
  const [sending, setSending] = useState(false);
  const streamRef = useRef<ChatStreamTask | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const modelResult = await modelApi.list({ type: 'chat', pageSize: 100 });
        if (cancelled) return;
        setModels(modelResult.list);
        if (!appId) return;
        const record = await appApi.getById(appId);
        if (cancelled) return;
        const next = mapAppRecord(record, modelResult.list);
        setApp(next);
        setPrompt(next.prompt);
        setModel(next.model);
      } catch (error) {
        if (!cancelled) message.error(error instanceof Error ? error.message : '应用加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appId, message]);

  useEffect(
    () => () => {
      streamRef.current?.abort();
    },
    [],
  );

  const handleSavePrompt = async () => {
    if (!app) return;
    try {
      await appApi.update({ id: app.id, prompt, modelId: model });
      setApp({ ...app, prompt, model });
      message.success('提示词已保存');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleSendTest = () => {
    const value = testInput.trim();
    if (!value || !app || sending) return;
    const userMessage: TestMessage = { id: `test-${Date.now()}`, role: 'user', content: value };
    const replyId = `test-${Date.now()}-reply`;
    const history = [...testMessages, userMessage];
    setTestMessages([...history, { id: replyId, role: 'assistant', content: '' }]);
    setTestInput('');
    setSending(true);

    const selectedModel = models.find((item) => item.id === model);
    const task = streamChat(
      {
        model: selectedModel?.model,
        systemPrompt: prompt,
        messages: history.map((item) => ({ role: item.role, content: item.content })),
      },
      {
        onDelta: (delta) => {
          setTestMessages((prev) =>
            prev.map((item) =>
              item.id === replyId ? { ...item, content: item.content + delta } : item,
            ),
          );
        },
        onError: (errorMessage) => {
          message.error(errorMessage);
          setSending(false);
        },
        onDone: () => setSending(false),
      },
    );
    streamRef.current = task;
    task.done.catch((error: unknown) => {
      setSending(false);
      message.error(error instanceof Error ? error.message : '测试对话失败');
    });
  };

  if (!app) {
    return (
      <PageContainer className="flex flex-col h-full" title="应用配置" contentBordered={false}>
        <div className="flex justify-center py-20">
          <Spin />
        </div>
      </PageContainer>
    );
  }

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
              options={toModelOptions(models)}
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
                      {item.content || '正在思考...'}
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
                  disabled={!testInput.trim() || sending}
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

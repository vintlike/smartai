import {
  ApiOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  FileTextOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Alert, App, Button, Collapse, Select, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLayout } from '@/framework';
import { PageContainer, Panel } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import { mockApps, modelOptions } from '@/services/mock-data';
import '@/pages/app/app-detail.less';

interface ApiKeyItem {
  id: string;
  token: string;
  createdAt: string;
}

const apiUrl = window.location.origin;

/** 掩码展示秘钥：保留前后各 8 位 */
function maskToken(token: string): string {
  return `${token.slice(0, 13)}****${token.slice(-4)}`;
}

/** 应用配置：Prompt / 基础配置 / 知识库 / 聊天预览，以及 API 接入渠道 */
export default function AppDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { addTab } = useLayout();
  const { message, modal } = App.useApp();
  const app = mockApps.find((item) => item.id === id) ?? mockApps[0];

  // 详情页不在菜单树中，需自行注册多 Tab
  useEffect(() => {
    addTab({ key: pathname, path: pathname, title: '应用配置', closable: true });
    document.title = `应用配置 - ${app.name}`;
  }, [addTab, pathname, app.name]);

  const [tab, setTab] = useState<'config' | 'api'>('config');
  const [prompt, setPrompt] = useState(app.prompt);
  const [model, setModel] = useState<string>(app.model);
  const [knowledge, setKnowledge] = useState(['SmartAI文档']);
  const [preview, setPreview] = useState('');
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);

  const columns = useMemo<TableColumnsType<ApiKeyItem>>(
    () => [
      {
        title: '秘钥',
        key: 'token',
        dataIndex: 'token',
        render: (value: string) => <span className="sa-mono">{maskToken(value)}</span>,
      },
      { title: '创建时间', key: 'createdAt', dataIndex: 'createdAt', width: 200 },
      {
        title: '操作',
        key: 'action',
        width: 90,
        render: (_, record) => (
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDeleteKey(record)}
          />
        ),
      },
    ],
    // 删除回调仅依赖 modal/message，均为稳定引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tableState = useTableToolbar(columns);

  function confirmDeleteKey(record: ApiKeyItem) {
    modal.confirm({
      title: '提示!',
      content: '你确定重置Key吗？删除后原Key将立即失效，请谨慎操作',
      okText: '是',
      cancelText: '否',
      onOk: () => {
        setKeys((list) => list.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  }

  const createKey = () => {
    const token = `smartai-${Math.random().toString(36).slice(2, 14)}`;
    setKeys((list) => [
      ...list,
      {
        id: `key-${Date.now()}`,
        token,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
    ]);
    message.success('新增成功');
  };

  return (
    <div className="sa-app-detail">
      <PageContainer className="sa-app-detail__header">
        <div className="sa-app-detail__identity">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/app/list')}
            aria-label="返回应用列表"
          />
          <div className="sa-app-detail__cover">
            <RobotOutlined />
            <Tag className="sa-app-detail__cover-tag">AI</Tag>
          </div>
          <div className="sa-app-detail__meta">
            <h2>{app.name}</h2>
            <span>自动保存：{app.createdAt}</span>
          </div>
        </div>
        <div className="sa-app-detail__tabs">
          <Button
            type={tab === 'config' ? 'primary' : 'default'}
            icon={<SettingOutlined />}
            onClick={() => setTab('config')}
          >
            应用配置
          </Button>
          <Button
            type={tab === 'api' ? 'primary' : 'default'}
            icon={<ApiOutlined />}
            onClick={() => setTab('api')}
          >
            API接入渠道
          </Button>
        </div>
      </PageContainer>

      {tab === 'config' ? (
        <div className="sa-app-detail__grid">
          <Panel className="sa-app-detail__panel" title="Prompt 提示词">
            <textarea
              className="sa-app-detail__prompt"
              value={prompt}
              placeholder="请输入 Prompt 提示词"
              onChange={(event) => setPrompt(event.target.value)}
              onBlur={() => message.success('已自动保存')}
            />
          </Panel>

          <Panel className="sa-app-detail__panel">
            <Collapse
              ghost
              defaultActiveKey={['base', 'knowledge']}
              items={[
                {
                  key: 'base',
                  label: '基础配置',
                  children: (
                    <div className="sa-app-detail__field">
                      <span className="sa-app-detail__field-label">对话模型：</span>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="请选择关联模型"
                        options={modelOptions}
                        value={model}
                        onChange={setModel}
                      />
                    </div>
                  ),
                },
                {
                  key: 'knowledge',
                  label: (
                    <div className="sa-app-detail__collapse-label">
                      <span>知识库</span>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!knowledge.includes('SmartAI文档')) {
                            setKnowledge((list) => [...list, 'SmartAI文档']);
                            message.success('已关联知识库');
                          } else {
                            message.info('暂无更多可关联的知识库');
                          }
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="sa-app-detail__knowledge">
                      {knowledge.length === 0 ? (
                        <span className="sa-text-muted">暂未关联知识库</span>
                      ) : (
                        knowledge.map((item) => (
                          <div className="sa-app-detail__knowledge-item" key={item}>
                            <FileTextOutlined className="sa-app-detail__knowledge-icon" />
                            <span>{item}</span>
                            <Button
                              type="text"
                              size="small"
                              icon={<MinusCircleOutlined />}
                              onClick={() =>
                                setKnowledge((list) => list.filter((name) => name !== item))
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Panel>

          <Panel className="sa-app-detail__panel sa-app-detail__preview">
            <div className="sa-app-detail__preview-body">
              <div className="sa-app-detail__preview-hint">
                <RobotOutlined />
                <span>应用聊天预览</span>
              </div>
            </div>
            <div className="sa-app-detail__composer">
              <textarea
                rows={1}
                placeholder="今天想聊些什么~"
                value={preview}
                onChange={(event) => setPreview(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (!preview.trim()) return;
                    setPreview('');
                    message.success('预览消息已发送（演示）');
                  }
                }}
              />
              <Button
                type="text"
                icon={<SendOutlined />}
                className="sa-app-detail__send"
                onClick={() => {
                  if (!preview.trim()) return;
                  setPreview('');
                  message.success('预览消息已发送（演示）');
                }}
              />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="sa-app-detail__api">
          <Panel className="sa-app-detail__panel sa-app-detail__keys">
            <DataTable<ApiKeyItem>
              state={tableState}
              dataSource={keys}
              toolbarExtra={
                <Button type="primary" icon={<PlusOutlined />} onClick={createKey}>
                  创建秘钥
                </Button>
              }
            />
          </Panel>

          <Panel className="sa-app-detail__panel sa-app-detail__docs">
            <div className="sa-app-detail__docs-content">
              <Alert type="info" showIcon title="API URL（API接口格式遵循OpenAI格式）" />
              <pre className="sa-code-block">{apiUrl}</pre>

              <div className="sa-app-detail__docs-title">Request</div>
              <pre className="sa-code-block">{`POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": true
}`}</pre>

              <div className="sa-app-detail__docs-title">Response (Stream)</div>
              <pre className="sa-code-block">{`data: {"choices":[{"delta":{"content":"你好"}}]}

data: {"choices":[{"delta":{"content":"，有什么可以帮你？"}}]}

data: [DONE]`}</pre>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

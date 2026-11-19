import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { appApiCredentialApi } from '@/api/aigc';
import { DataTable } from '@/components/DataTable';
import { useTableToolbar } from '@/hooks/useTableToolbar';

interface ApiKeyItem {
  id: string;
  key: string;
  createdAt: string;
}

interface CodeBlockProps {
  title: string;
  code: string;
}

function CodeBlock({ title, code }: CodeBlockProps) {
  return (
    <div className="rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-layout)] p-4 overflow-auto">
      <div className="text-14px font-600 mb-2">{title}</div>
      <pre className="text-13px m-0 whitespace-pre-wrap break-all font-mono">{code}</pre>
    </div>
  );
}

export interface ApiChannelPanelProps {
  appName: string;
  appId: string;
}

export default function ApiChannelPanel({ appName, appId }: ApiChannelPanelProps) {
  const { message, modal } = App.useApp();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const baseUrl = `${window.location.origin}/api/aigc/app-api`;

  const loadKeys = useCallback(async () => {
    try {
      const list = await appApiCredentialApi.listByAppId(appId);
      setKeys(
        list.map((item) => ({
          id: item.id,
          key: item.apiKey ?? '',
          createdAt: item.createTime ?? '-',
        })),
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : '秘钥加载失败');
    }
  }, [appId, message]);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    try {
      await appApiCredentialApi.create({ appId });
      message.success('秘钥创建成功');
      await loadKeys();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '秘钥创建失败');
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败');
    }
  };

  const handleDelete = (record: ApiKeyItem) => {
    modal.confirm({
      title: '删除秘钥',
      content: '删除后该秘钥将无法使用，确定要删除吗？',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await appApiCredentialApi.delete(record.id);
          message.success('删除成功');
          await loadKeys();
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      },
    });
  };

  const columns: ColumnsType<ApiKeyItem> = [
    {
      title: '秘钥',
      dataIndex: 'key',
      width: 220,
      ellipsis: true,
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{value}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record.key)}
          >
            复制
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const toolbar = useTableToolbar<ApiKeyItem>(columns, loadKeys);

  const requestBody = `{
  "model": "${appId}",
  "messages": [
    {
      "role": "system",
      "content": "你是${appName}的AI助手。"
    },
    {
      "role": "user",
      "content": "你好，请介绍一下你自己"
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 2048
}`;

  const responseStream = `data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"你好"},"finish_reason":null}]}

data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"，我是"},"finish_reason":null}]}

data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"${appName}"},"finish_reason":null}]}

data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"AI助手。"},"finish_reason":"stop"}]}

data: [DONE]`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxxxxxxxxxxxxxxx",
    base_url="${baseUrl}"
)

response = client.chat.completions.create(
    model="${appId}",
    messages=[
        {"role": "system", "content": "你是${appName}的AI助手。"},
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ],
    stream=True,
    temperature=0.7,
    max_tokens=2048
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`;

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      <div className="w-40% flex-shrink-0 rounded-8px border border-solid border-[var(--ant-color-border)] bg-[var(--ant-color-bg-container)] p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-14px font-600">API 秘钥</span>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleCreate}>
            创建秘钥
          </Button>
        </div>
        <DataTable
          rowKey="id"
          bordered
          state={toolbar}
          dataSource={keys}
          scroll={{ x: 500 }}
          pagination={{ pageSize: 5 }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-auto">
        <CodeBlock title="API URL" code={`${baseUrl}/chat/completions`} />
        <CodeBlock title="Request" code={requestBody} />
        <CodeBlock title="Response (Stream)" code={responseStream} />
        <CodeBlock title="API 请求示例" code={pythonExample} />
      </div>
    </div>
  );
}

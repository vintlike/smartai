import {
  CommentOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  PictureOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Tabs,
  Tag,
} from 'antd';
import { useMemo, useState } from 'react';
import { PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { ProviderItem } from '@/services/mock-data';
import { chatProviders, embeddingProviders, imageProviders } from '@/services/mock-data';
import '@/pages/aigc/model/model.less';

type ModelKind = 'chat' | 'embedding' | 'image';

interface ModelRow {
  id: string;
  alias: string;
  version: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  dimension?: number;
}

const kindMeta: Record<
  ModelKind,
  { listTitle: string; alert: string; providers: ProviderItem[]; drawerTitle: string }
> = {
  chat: {
    listTitle: '聊天模型列表',
    alert: '对于完全适配OpenAI接口格式的模型都可在OpenAI中配置（只需要定义BaseUrl）',
    providers: chatProviders,
    drawerTitle: '新增聊天模型',
  },
  embedding: {
    listTitle: '向量模型列表',
    alert: '为了实现向量数据库的动态切换，这里Embedding供应商统一选择支持1024纬度的模型',
    providers: embeddingProviders,
    drawerTitle: '新增向量模型',
  },
  image: {
    listTitle: '文生图模型列表',
    alert: '鉴于很多模型的文生图效果很差甚至没有，这里只建议使用OpenAI的DALL-E模型',
    providers: imageProviders,
    drawerTitle: '新增文生图模型',
  },
};

const versionOptions = {
  chat: ['gpt-4o', 'gpt-4o-mini', 'deepseek-chat', 'qwen-max', 'glm-4'],
  embedding: ['text-embedding-3-small', 'text-embedding-3-large', 'bge-m3'],
  image: ['dall-e-3', 'dall-e-2'],
};

/** 单个供应商下的模型表格与新增抽屉 */
function ModelPanel({ kind }: { kind: ModelKind }) {
  const { message } = App.useApp();
  const meta = kindMeta[kind];
  const [provider, setProvider] = useState(meta.providers[0].key);
  const [rows, setRows] = useState<ModelRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = useMemo<TableColumnsType<ModelRow>>(() => {
    const actionColumn = {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: ModelRow) => (
        <div className="sa-row-actions">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => setRows((list) => list.filter((item) => item.id !== record.id))}
          />
        </div>
      ),
    };

    if (kind === 'chat') {
      return [
        { title: '模型别名', dataIndex: 'alias', key: 'alias' },
        { title: '模型版本', dataIndex: 'version', key: 'version' },
        { title: '回复上限', dataIndex: 'maxTokens', key: 'maxTokens', width: 110 },
        { title: '生成随机性', dataIndex: 'temperature', key: 'temperature', width: 120 },
        { title: 'Top P', dataIndex: 'topP', key: 'topP', width: 100 },
        { title: 'Api Key', dataIndex: 'apiKey', key: 'apiKey', render: maskKey },
        actionColumn,
      ];
    }

    if (kind === 'embedding') {
      return [
        { title: '模型别名', dataIndex: 'alias', key: 'alias' },
        { title: '模型版本', dataIndex: 'version', key: 'version' },
        { title: '向量纬度', dataIndex: 'dimension', key: 'dimension', width: 110 },
        { title: 'Api Key', dataIndex: 'apiKey', key: 'apiKey', render: maskKey },
        { title: 'Base Url', dataIndex: 'baseUrl', key: 'baseUrl' },
        actionColumn,
      ];
    }

    return [
      { title: '模型别名', dataIndex: 'alias', key: 'alias' },
      { title: '模型版本', dataIndex: 'version', key: 'version' },
      { title: 'Api Key', dataIndex: 'apiKey', key: 'apiKey', render: maskKey },
      actionColumn,
    ];
  }, [kind]);

  const state = useTableToolbar(columns);

  const providerName = meta.providers.find((item) => item.key === provider)?.name ?? '';

  const openDrawer = () => {
    form.resetFields();
    form.setFieldsValue({
      version: versionOptions[kind][0],
      maxTokens: 2000,
      temperature: 0.2,
      topP: 0.8,
      dimension: 1024,
      baseUrl: '',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setRows((list) => [
      ...list,
      {
        id: `model-${Date.now()}`,
        alias: values.alias,
        version: values.version,
        apiKey: values.apiKey ?? '',
        baseUrl: values.baseUrl,
        maxTokens: values.maxTokens,
        temperature: values.temperature,
        topP: values.topP,
        dimension: values.dimension,
      },
    ]);
    setOpen(false);
    message.success('模型已保存');
  };

  return (
    <div className="sa-model">
      <aside className="sa-model__providers">
        {meta.providers.map((item) => (
          <button
            key={item.key}
            type="button"
            className={['sa-model__provider', item.key === provider ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setProvider(item.key)}
          >
            {item.name}
          </button>
        ))}
      </aside>

      <section className="sa-model__content">
        <div className="sa-section-title">{meta.listTitle}</div>
        <Alert className="sa-model__alert" type="info" showIcon title={meta.alert} />
        <DataTable<ModelRow>
          state={state}
          dataSource={rows}
          toolbarExtra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
              新增模型
            </Button>
          }
        />
      </section>

      <Drawer
        title={`${meta.drawerTitle}（${providerName}）`}
        size={480}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="sa-drawer-footer">
            <Button type="primary" onClick={submit}>
              提交
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="alias"
            label="模型别名"
            rules={[{ required: true, message: '请输入模型别名' }]}
          >
            <Input placeholder="请输入模型别名" />
          </Form.Item>
          <Form.Item
            name="version"
            label="模型版本"
            rules={[{ required: true, message: '请选择或输入模型版本' }]}
          >
            {kind === 'chat' ? (
              <Select
                showSearch
                placeholder="请选择模型版本"
                options={versionOptions.chat.map((value) => ({ label: value, value }))}
              />
            ) : (
              <Select
                placeholder="请选择模型版本"
                options={versionOptions[kind].map((value) => ({ label: value, value }))}
              />
            )}
          </Form.Item>
          <Form.Item name="apiKey" label="Api Key">
            <Input.Password placeholder="请输入 Api Key" />
          </Form.Item>

          {kind === 'chat' ? (
            <>
              <Form.Item name="maxTokens" label="回复上限">
                <Slider min={100} max={4000} step={100} />
              </Form.Item>
              <Form.Item name="temperature" label="生成随机性">
                <Slider min={0} max={1} step={0.1} />
              </Form.Item>
              <Form.Item name="topP" label="Top P">
                <Slider min={0} max={1} step={0.1} />
              </Form.Item>
            </>
          ) : null}

          {kind === 'embedding' ? (
            <>
              <Form.Item name="dimension" label="向量纬度">
                <InputNumber min={1} max={4096} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="baseUrl" label="Base Url">
                <Input placeholder="请输入 Base Url" />
              </Form.Item>
            </>
          ) : null}

          {kind === 'image' ? (
            <>
              <Form.Item name="size" label="图片大小" rules={[{ required: true }]}>
                <Select
                  options={['1024x1024', '1792x1024', '1024x1792'].map((value) => ({
                    label: value,
                    value,
                  }))}
                />
              </Form.Item>
              <Form.Item name="quality" label="图片质量" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'standard', value: 'standard' },
                    { label: 'hd', value: 'hd' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="style" label="图片风格" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'vivid', value: 'vivid' },
                    { label: 'natural', value: 'natural' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="baseUrl" label="Base Url">
                <Input placeholder="请输入 Base Url" />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Drawer>
    </div>
  );
}

function maskKey(value?: string) {
  if (!value) return <span className="sa-text-muted">-</span>;
  return (
    <Tag bordered={false} className="sa-model__key">
      {value.length > 10 ? `${value.slice(0, 6)}****` : '******'}
    </Tag>
  );
}

/** 模型管理：Chat / Embedding / Image 三类供应商与模型配置 */
export default function ModelPage() {
  return (
    <PageContainer>
      <Tabs
        centered
        defaultActiveKey="chat"
        items={[
          {
            key: 'chat',
            label: (
              <span className="sa-model__tab">
                <CommentOutlined /> Chat模型供应商
              </span>
            ),
            children: <ModelPanel kind="chat" />,
          },
          {
            key: 'embedding',
            label: (
              <span className="sa-model__tab">
                <DatabaseOutlined /> Embedding向量模型
              </span>
            ),
            children: <ModelPanel kind="embedding" />,
          },
          {
            key: 'image',
            label: (
              <span className="sa-model__tab">
                <PictureOutlined /> Image文生图模型
              </span>
            ),
            children: <ModelPanel kind="image" />,
          },
        ]}
      />
    </PageContainer>
  );
}

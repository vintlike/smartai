import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import { useTableToolbar } from '@/hooks/useTableToolbar';
import { formatSize } from './components/KnowledgeCard';
import { mockKnowledgeBases, mockKnowledgeDocuments, mockKnowledgeSlices } from './mockData';
import type { KnowledgeDocumentItem, KnowledgeSliceItem } from './types';

const { Text, Title, Paragraph } = Typography;

type ImportMode = 'upload' | 'manual';

/** 检索结果：在切片基础上补充相似度 */
interface SearchHit extends KnowledgeSliceItem {
  score: number;
}

/** 示例文档的初始体积，用于把文档增删折算回知识库自身的数据总量口径 */
const INITIAL_DOC_SIZE = mockKnowledgeDocuments.reduce((sum, item) => sum + item.fileSize, 0);

/**
 * 相似度计算：按关键词去重字符在切片内容中的命中率估算，
 * 保证同一关键词多次检索结果稳定，不受随机数影响。
 */
function scoreSlice(content: string, keyword: string): number {
  const text = content.toLowerCase();
  const chars = Array.from(new Set(keyword.replace(/\s+/g, '').toLowerCase()));
  if (!chars.length) return 0;
  const hit = chars.filter((char) => text.includes(char)).length;
  return hit / chars.length;
}

export default function KnowledgeData() {
  const { message, modal } = App.useApp();
  const { knowledgeId } = useParams();
  const navigate = useNavigate();
  const knowledge =
    mockKnowledgeBases.find((item) => item.id === knowledgeId) ?? mockKnowledgeBases[0];

  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>(mockKnowledgeDocuments);
  const [slices] = useState<KnowledgeSliceItem[]>(mockKnowledgeSlices);
  const [importMode, setImportMode] = useState<ImportMode>('upload');
  const [form] = Form.useForm<{ docName: string; docContent: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocumentItem | null>(null);
  const [editForm] = Form.useForm<{ name: string; content: string }>();
  const [docKeyword, setDocKeyword] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(10);
  const [sliceDoc, setSliceDoc] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [searchHits, setSearchHits] = useState<SearchHit[] | null>(null);

  /**
   * 概览统计：以知识库自身口径（与知识库列表卡片一致）为基准，
   * 叠加本次会话内文档的新增 / 删除，保证两处数字始终对得上。
   */
  const totalSize = useMemo(
    () => documents.reduce((sum, item) => sum + item.fileSize, 0),
    [documents],
  );
  const docCount = Math.max(
    knowledge.docCount + (documents.length - mockKnowledgeDocuments.length),
    0,
  );
  const dataTotalSize = Math.max(knowledge.totalSize + (totalSize - INITIAL_DOC_SIZE), 0);

  const filteredDocuments = useMemo(() => {
    const value = docKeyword.trim().toLowerCase();
    if (!value) return documents;
    return documents.filter((item) => item.name.toLowerCase().includes(value));
  }, [documents, docKeyword]);

  const filteredSlices = useMemo(
    () => (sliceDoc ? slices.filter((item) => item.docName === sliceDoc) : slices),
    [slices, sliceDoc],
  );

  const addDocument = (doc: KnowledgeDocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
    setDocPage(1);
    setDocKeyword('');
  };

  const handleUpload = (file: File) => {
    addDocument({
      id: `doc-${Date.now()}`,
      name: file.name,
      url: `https://docs.smartai.com/knowledge/${file.name}`,
      source: '上传',
      sliceCount: 0,
      sliceStatus: '未训练',
      fileSize: file.size,
    });
    message.success(`「${file.name}」上传成功`);
    return false;
  };

  const handleManualSubmit = async () => {
    const values = await form.validateFields();
    if (!values.docName?.trim() || !values.docContent?.trim()) {
      message.warning('请填写文档名称和内容');
      return;
    }
    const fileSize = new Blob([values.docContent]).size;
    addDocument({
      id: `doc-${Date.now()}`,
      name: values.docName,
      url: `https://docs.smartai.com/knowledge/${values.docName}`,
      source: '录入',
      sliceCount: 0,
      sliceStatus: '未训练',
      fileSize,
    });
    message.success('文档录入成功');
    form.resetFields();
  };

  const openEdit = (record: KnowledgeDocumentItem) => {
    setEditingDoc(record);
    editForm.setFieldsValue({ name: record.name, content: '文档内容预览...' });
    setEditOpen(true);
  };

  const runSearch = () => {
    const value = keyword.trim();
    if (!value) {
      message.warning('请输入搜索关键词');
      return;
    }
    const hits = slices
      .map((item) => ({ ...item, score: scoreSlice(item.content, value) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setSearchedKeyword(value);
    setSearchHits(hits);
  };

  const resetSearch = () => {
    setKeyword('');
    setSearchedKeyword('');
    setSearchHits(null);
  };

  const documentColumns: ColumnsType<KnowledgeDocumentItem> = [
    { title: '文档名称', dataIndex: 'name', width: 180 },
    {
      title: '文档链接',
      dataIndex: 'url',
      width: 200,
      ellipsis: true,
      render: (value: string) => (
        <Text copyable style={{ fontSize: 12 }}>
          {value}
        </Text>
      ),
    },
    {
      title: '文档来源',
      dataIndex: 'source',
      width: 100,
      render: (value: string) => <Tag color={value === '上传' ? 'blue' : 'green'}>{value}</Tag>,
    },
    { title: '切片数量', dataIndex: 'sliceCount', width: 90 },
    {
      title: '切片状态',
      dataIndex: 'sliceStatus',
      width: 100,
      render: (value: string) => <Tag color={value === '已训练' ? 'green' : 'orange'}>{value}</Tag>,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      width: 100,
      render: (value: number) => formatSize(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size={4}>
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => {
              modal.confirm({
                title: '确认重新向量化',
                content: `您确定重新向量化该文档「${record.name}」？此操作将会删除Vector向量库中旧数据。`,
                okText: '确定',
                cancelText: '取消',
                onOk: () => message.success('已开始重新向量化'),
              });
            }}
          >
            重新向量化
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除文档「${record.name}」吗？`,
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => {
                  setDocuments((prev) => prev.filter((item) => item.id !== record.id));
                  message.success('删除成功');
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const sliceColumns: ColumnsType<KnowledgeSliceItem> = [
    { title: '文档名称', dataIndex: 'docName', width: 180 },
    { title: '字符数', dataIndex: 'charCount', width: 90 },
    {
      title: '切片内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (value: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>{value}</Paragraph>
      ),
    },
    {
      title: '切片状态',
      dataIndex: 'status',
      width: 100,
      render: (value: string) => <Tag color={value === '已训练' ? 'green' : 'orange'}>{value}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  ];

  const documentToolbar = useTableToolbar<KnowledgeDocumentItem>(documentColumns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带查询条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  const sliceToolbar = useTableToolbar<KnowledgeSliceItem>(sliceColumns, async () => {
    // 当前为本地 mock 数据源，刷新先模拟请求时延；接入接口后替换为带筛选条件的请求
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  /** 导入文档 / 手动录入文档两种入库方式，选中卡片高亮 */
  const importContent = (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div
          className={`relative flex-1 max-w-320px p-4 border-2 rounded-8px cursor-pointer border-solid ${
            importMode === 'upload'
              ? 'border-[var(--ant-color-primary)]'
              : 'border-[var(--ant-color-border)]'
          }`}
          onClick={() => setImportMode('upload')}
        >
          <div className="text-14px font-600 mb-1">导入文档</div>
          <div className="text-12px text-[var(--ant-color-text-secondary)]">
            支持 txt、md、docx、doc、pdf 格式文档
          </div>
          {importMode === 'upload' && (
            <div
              className="absolute right-0 bottom-0"
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderBottom: '14px solid var(--ant-color-primary)',
              }}
            />
          )}
        </div>
        <div
          className={`relative flex-1 max-w-320px p-4 border-2 rounded-8px cursor-pointer border-solid ${
            importMode === 'manual'
              ? 'border-[var(--ant-color-primary)]'
              : 'border-[var(--ant-color-border)]'
          }`}
          onClick={() => setImportMode('manual')}
        >
          <div className="text-14px font-600 mb-1">手动录入文档</div>
          <div className="text-12px text-[var(--ant-color-text-secondary)]">
            直接输入文档名称与内容创建文档
          </div>
          {importMode === 'manual' && (
            <div
              className="absolute right-0 bottom-0"
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderBottom: '14px solid var(--ant-color-primary)',
              }}
            />
          )}
        </div>
      </div>
      {importMode === 'upload' ? (
        <Upload.Dragger
          multiple
          accept=".txt,.md,.docx,.doc,.pdf"
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <div className="flex flex-col items-center gap-2 py-4">
            <CloudUploadOutlined style={{ fontSize: 28, color: 'var(--ant-color-primary)' }} />
            <span className="text-14px">点击或拖拽上传文档</span>
            <span className="text-12px text-[var(--ant-color-text-secondary)]">
              支持 txt、md、docx、doc、pdf 格式，上传后可前往「切片管理」向量化
            </span>
          </div>
        </Upload.Dragger>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="docName"
            label="文档名称"
            rules={[{ required: true, message: '请输入文档名称' }]}
          >
            <Input placeholder="请输入文档名称" maxLength={100} showCount />
          </Form.Item>
          <Form.Item
            name="docContent"
            label="文档内容"
            rules={[{ required: true, message: '请输入文档内容' }]}
          >
            <Input.TextArea placeholder="请输入文档内容" rows={8} />
          </Form.Item>
          <div className="flex justify-end">
            <Button type="primary" onClick={handleManualSubmit}>
              保存文档
            </Button>
          </div>
        </Form>
      )}
    </div>
  );

  /** 文档管理：文档列表 */
  const documentsContent = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input.Search
          allowClear
          placeholder="搜索文档名称"
          style={{ width: 240 }}
          value={docKeyword}
          onChange={(event) => {
            setDocKeyword(event.target.value);
            setDocPage(1);
          }}
          onSearch={(value) => {
            setDocKeyword(value);
            setDocPage(1);
          }}
        />
        <span className="text-12px text-[var(--ant-color-text-tertiary)]">
          {docKeyword ? `匹配 ${filteredDocuments.length} 个文档` : ''}
        </span>
      </div>
      <DataTable
        rowKey="id"
        bordered
        state={documentToolbar}
        dataSource={filteredDocuments}
        scroll={{ x: 1000 }}
        pagination={{
          current: docPage,
          pageSize: docPageSize,
          total: filteredDocuments.length,
          onChange: (nextPage, nextPageSize) => {
            setDocPage(nextPage);
            setDocPageSize(nextPageSize);
          },
        }}
      />
    </div>
  );

  const slicesContent = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select
          allowClear
          placeholder="按来源文档筛选"
          style={{ width: 240 }}
          value={sliceDoc}
          options={Array.from(new Set(slices.map((item) => item.docName))).map((name) => ({
            value: name,
            label: name,
          }))}
          onChange={setSliceDoc}
        />
        <span className="text-12px text-[var(--ant-color-text-tertiary)]">
          共 {filteredSlices.length} 条切片
        </span>
      </div>
      <DataTable
        rowKey="id"
        bordered
        state={sliceToolbar}
        dataSource={filteredSlices}
        scroll={{ x: 800 }}
      />
    </div>
  );

  /** 向量搜索：上方输入检索，下方展示命中结果 */
  const searchContent = (
    <div className="flex flex-col gap-3">
      <Input.TextArea
        rows={4}
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="输入问题后点击搜索，验证知识库的召回效果"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-12px text-[var(--ant-color-text-tertiary)]">
          当前知识库共 {slices.length} 条切片参与检索，返回相似度最高的 5 条
        </span>
        <Space>
          <Button onClick={resetSearch}>清空</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={runSearch}>
            搜索
          </Button>
        </Space>
      </div>
      {searchHits === null ? (
        <Empty description="搜索后在下方展示匹配结果" />
      ) : searchHits.length ? (
        <div className="flex flex-col gap-2">
          <div className="text-12px text-[var(--ant-color-text-tertiary)]">
            「{searchedKeyword}」共命中 {searchHits.length} 条切片
          </div>
          {searchHits.map((hit, index) => (
            <Card key={hit.id} size="small">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-12px text-[var(--ant-color-text-tertiary)]">
                  结果 {index + 1} · {hit.docName} · 向量 #{hit.id}
                </span>
                <Tag color={hit.score >= 0.6 ? 'green' : 'blue'}>
                  相似度 {(hit.score * 100).toFixed(1)}%
                </Tag>
              </div>
              <div className="text-13px leading-6 whitespace-pre-wrap text-[var(--ant-color-text)]">
                {hit.content}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="没有命中任何切片，换个关键词试试" />
      )}
    </div>
  );

  return (
    <PageContainer
      className="flex flex-col h-full"
      titleBefore={
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/aigc-platform/knowledge')}
        />
      }
      title="知识库数据"
      contentBordered={false}
      contentClassName="flex-1 flex gap-4 min-h-0"
    >
      <div className="w-300px flex-shrink-0 rounded-8px border border-solid border-[var(--ant-color-border)] overflow-auto">
        <div className="px-5 py-5 border-0 border-b border-solid border-[var(--ant-color-border)]">
          <div
            className="h-120px flex items-center justify-center rounded-8px bg-[var(--ant-color-primary-bg)]"
            style={{ fontSize: 48 }}
          >
            📚
          </div>
          <Title level={5} className="mt-3 mb-2! text-center">
            {knowledge.name}
          </Title>
          <Paragraph className="mb-0! text-13px text-center" ellipsis={{ rows: 3 }}>
            {knowledge.description}
          </Paragraph>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-8px bg-[var(--ant-color-fill-quaternary)] px-3 py-2">
              <div className="text-12px text-[var(--ant-color-text-tertiary)]">文档数量</div>
              <div className="mt-1 text-18px font-600 text-[var(--ant-color-text)]">{docCount}</div>
            </div>
            <div className="rounded-8px bg-[var(--ant-color-fill-quaternary)] px-3 py-2">
              <div className="text-12px text-[var(--ant-color-text-tertiary)]">数据总量</div>
              <div className="mt-1 text-18px font-600 text-[var(--ant-color-text)]">
                {formatSize(dataTotalSize)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-12px text-[var(--ant-color-text-secondary)] mb-1">知识库ID</div>
            <Input value={knowledge.id} readOnly />
          </div>
          <div>
            <div className="text-12px text-[var(--ant-color-text-secondary)] mb-1">
              关联向量数据库
            </div>
            <Tag color="blue">{knowledge.vectorDb}</Tag>
          </div>
          <div>
            <div className="text-12px text-[var(--ant-color-text-secondary)] mb-1">
              关联向量化模型
            </div>
            <Tag color="green">{knowledge.embeddingModel}</Tag>
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-8px border border-solid border-[var(--ant-color-border)] p-4 min-w-0 flex flex-col min-h-0 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="full-height-tabs flex-1 min-h-0"
          items={[
            {
              key: 'import',
              label: '数据导入',
              icon: <CloudUploadOutlined />,
              children: importContent,
            },
            {
              key: 'documents',
              label: '文档管理',
              icon: <FileTextOutlined />,
              children: documentsContent,
            },
            { key: 'slices', label: '切片管理', children: slicesContent },
            { key: 'search', label: '向量搜索', children: searchContent },
          ]}
        />
      </div>
      <Modal
        width={520}
        destroyOnHidden
        open={editOpen}
        title="编辑文档"
        okText="保存"
        cancelText="取消"
        onCancel={() => {
          setEditOpen(false);
          setEditingDoc(null);
        }}
        onOk={async () => {
          const values = await editForm.validateFields();
          setDocuments((prev) =>
            prev.map((item) =>
              item.id === editingDoc?.id ? { ...item, name: values.name } : item,
            ),
          );
          setEditOpen(false);
          setEditingDoc(null);
          message.success('编辑成功');
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="文档名称"
            rules={[{ required: true, message: '请输入文档名称' }]}
          >
            <Input placeholder="请输入文档名称" />
          </Form.Item>
          <Form.Item name="content" label="文档内容">
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

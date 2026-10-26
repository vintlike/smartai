import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  InboxOutlined,
  SearchOutlined,
  ScissorOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { App, Button, Empty, Form, Input, Modal, Select, Tabs, Tag, Upload } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLayout } from '@/framework';
import { FilterBar, FilterItem, Panel } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { DocumentItem } from '@/services/mock-data';
import { mockDocuments, mockKnowledge } from '@/services/mock-data';
import '@/pages/aigc/knowledge/knowledge-detail.less';

interface ChunkItem {
  id: string;
  docName: string;
  chars: number;
  content: string;
  status: string;
  createdAt: string;
}

/** 知识库数据：左侧信息栏 + 数据导入 / 文档管理 / 切片管理 / 向量搜索 */
export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { addTab } = useLayout();
  const { message, modal } = App.useApp();
  const knowledge = mockKnowledge.find((item) => item.id === id) ?? mockKnowledge[0];

  // 详情页不在菜单树中，需自行注册多 Tab
  useEffect(() => {
    addTab({ key: pathname, path: pathname, title: '知识库数据', closable: true });
    document.title = `知识库数据 - ${knowledge.name}`;
  }, [addTab, pathname, knowledge.name]);

  const [docs, setDocs] = useState<DocumentItem[]>(mockDocuments);
  const [docKeyword, setDocKeyword] = useState('');
  const [chunkDoc, setChunkDoc] = useState<string>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm] = Form.useForm();

  const docColumns = useMemo<TableColumnsType<DocumentItem>>(
    () => [
      { title: '文档名称', dataIndex: 'name', key: 'name' },
      {
        title: '文档链接',
        dataIndex: 'url',
        key: 'url',
        ellipsis: true,
        render: (value: string) =>
          value && value !== '-' ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            '-'
          ),
      },
      {
        title: '文档来源',
        dataIndex: 'source',
        key: 'source',
        width: 100,
        render: (value: string) => (
          <Tag color={value === '上传' ? 'success' : 'processing'}>{value}</Tag>
        ),
      },
      { title: '切片数量', dataIndex: 'chunks', key: 'chunks', width: 100 },
      {
        title: '切片状态',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (value: string) => (
          <Tag color={value === '已训练' ? 'success' : 'processing'}>{value}</Tag>
        ),
      },
      { title: '文件大小', dataIndex: 'size', key: 'size', width: 100 },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <div className="sa-row-actions">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => message.info(`查看文档：${record.name}`)}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => message.info(`编辑文档：${record.name}（演示）`)}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteDoc(record)}
            />
          </div>
        ),
      },
    ],
    // 操作列仅依赖稳定的 message/modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const chunkColumns = useMemo<TableColumnsType<ChunkItem>>(
    () => [
      { title: '文档名称', dataIndex: 'docName', key: 'docName', width: 160 },
      { title: '字符数', dataIndex: 'chars', key: 'chars', width: 100 },
      { title: '切片内容', dataIndex: 'content', key: 'content', width: 240, ellipsis: true },
      { title: '切片状态', dataIndex: 'status', key: 'status', width: 110 },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
      {
        title: '操作',
        key: 'action',
        width: 90,
        fixed: 'right',
        render: () => <span className="sa-text-muted">-</span>,
      },
    ],
    [],
  );

  const docState = useTableToolbar(docColumns);
  const chunkState = useTableToolbar(chunkColumns);

  function confirmDeleteDoc(record: DocumentItem) {
    modal.confirm({
      title: '删除文档',
      content: `确定要删除「${record.name}」吗？其切片数据也会被一并删除。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setDocs((list) => list.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  }

  const submitDoc = async () => {
    const values = await docForm.validateFields();
    setDocs((list) => [
      ...list,
      {
        id: `doc-${Date.now()}`,
        name: values.name,
        url: '-',
        source: '录入',
        chunks: 1,
        status: '未训练',
        size: '0.00 MB',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
    ]);
    setDocModalOpen(false);
    message.success('文档已添加');
  };

  return (
    <div className="sa-kb-detail">
      <Panel className="sa-kb-detail__aside">
        <Button
          className="sa-kb-detail__back"
          icon={<SwapOutlined rotate={90} />}
          onClick={() => navigate('/aigc/knowledge')}
        >
          知识库列表
        </Button>

        <div className="sa-kb-detail__name">
          <FileTextOutlined />
          <span>{knowledge.name}</span>
        </div>
        <p className="sa-kb-detail__desc">{knowledge.description}</p>

        <div className="sa-kb-detail__field">
          <span className="sa-kb-detail__field-label">知识库ID</span>
          <Input readOnly value={knowledge.id} />
        </div>
        <div className="sa-kb-detail__field">
          <span className="sa-kb-detail__field-label">关联向量数据库</span>
          <span className="sa-kb-detail__field-value">
            {knowledge.embedStore ? knowledge.embedStore : '没有配置关联向量数据库'}
          </span>
        </div>
        <div className="sa-kb-detail__field">
          <span className="sa-kb-detail__field-label">关联向量化模型</span>
          <span className="sa-kb-detail__field-value">
            {knowledge.embedModel ? knowledge.embedModel : '没有配置关联向量化模型'}
          </span>
        </div>
      </Panel>

      <Panel className="sa-kb-detail__main">
        <Tabs
          centered
          defaultActiveKey="import"
          items={[
            {
              key: 'import',
              label: (
                <span className="sa-kb-detail__tab">
                  <CloudUploadOutlined /> 数据导入
                </span>
              ),
              children: (
                <div className="sa-kb-detail__tab-body">
                  <Upload.Dragger
                    className="sa-kb-detail__upload"
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                      message.success(`已选择文件：${file.name}（演示环境不会真正上传）`);
                      return false;
                    }}
                    accept=".txt,.md,.docx,.doc,.pdf"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或者拖动文件到该区域来上传</p>
                    <p className="ant-upload-hint">
                      请上传文档文本类型的文件，文本类型文件将被单独处理和向量化，支持的文件格式有：.txt、.md、.docx、.doc、.pdf
                    </p>
                  </Upload.Dragger>
                </div>
              ),
            },
            {
              key: 'doc',
              label: (
                <span className="sa-kb-detail__tab">
                  <FileTextOutlined /> 文档管理
                </span>
              ),
              children: (
                <div className="sa-kb-detail__tab-body">
                  <FilterBar
                    onSearch={() => undefined}
                    onReset={() => setDocKeyword('')}
                  >
                    <FilterItem label="文档名称">
                      <Input
                        placeholder="请输入文档名称"
                        value={docKeyword}
                        onChange={(event) => setDocKeyword(event.target.value)}
                        allowClear
                      />
                    </FilterItem>
                  </FilterBar>
                  <DataTable<DocumentItem>
                    state={docState}
                    dataSource={docs.filter((item) => item.name.includes(docKeyword.trim()))}
                    toolbarExtra={
                      <Button type="primary" onClick={() => {
                        docForm.resetFields();
                        setDocModalOpen(true);
                      }}>
                        新增文档
                      </Button>
                    }
                  />
                </div>
              ),
            },
            {
              key: 'chunk',
              label: (
                <span className="sa-kb-detail__tab">
                  <ScissorOutlined /> 切片管理
                </span>
              ),
              children: (
                <div className="sa-kb-detail__tab-body">
                  <FilterBar onReset={() => setChunkDoc(undefined)}>
                    <FilterItem label="所属文档">
                      <Select
                        placeholder="请选择文档查询"
                        allowClear
                        value={chunkDoc}
                        onChange={setChunkDoc}
                        options={docs.map((item) => ({ label: item.name, value: item.name }))}
                      />
                    </FilterItem>
                  </FilterBar>
                  <DataTable<ChunkItem> state={chunkState} dataSource={[]} />
                </div>
              ),
            },
            {
              key: 'search',
              label: (
                <span className="sa-kb-detail__tab">
                  <SearchOutlined /> 向量搜索
                </span>
              ),
              children: (
                <div className="sa-kb-detail__tab-body">
                  <div className="sa-kb-detail__search">
                    <Input
                      placeholder="请输入关键词查询向量文本"
                      value={searchKeyword}
                      onChange={(event) => setSearchKeyword(event.target.value)}
                      onPressEnter={() => message.info('未匹配到相似的向量文本')}
                    />
                    <Button
                      type="primary"
                      onClick={() => message.info('未匹配到相似的向量文本')}
                    >
                      向量搜索
                    </Button>
                  </div>
                  <div className="sa-kb-detail__search-empty">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无数据" />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <Modal
        title="新增文档"
        open={docModalOpen}
        width={520}
        onCancel={() => setDocModalOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={submitDoc}>
            提交
          </Button>,
          <Button key="reset" onClick={() => docForm.resetFields()}>
            重置
          </Button>,
        ]}
      >
        <Form form={docForm} layout="vertical">
          <Form.Item
            name="name"
            label="文档名称"
            rules={[{ required: true, message: '请输入文档名称' }]}
          >
            <Input placeholder="请输入文档名称" />
          </Form.Item>
          <Form.Item name="content" label="文档内容">
            <Input.TextArea rows={6} placeholder="请输入文档内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

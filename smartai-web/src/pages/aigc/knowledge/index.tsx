import {
  FileAddOutlined,
  FileTextOutlined,
  MoreOutlined,
  SettingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Pagination, Select } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import type { KnowledgeItem } from '@/services/mock-data';
import { mockKnowledge, modelOptions } from '@/services/mock-data';
import '@/pages/aigc/knowledge/knowledge.less';

const embedStoreOptions = [
  { label: 'pgvector-main', value: 'pgvector-main' },
  { label: 'redis-cache', value: 'redis-cache' },
  { label: 'milvus-default', value: 'milvus-default' },
];

interface KnowledgeFormValues {
  name: string;
  embedStore: string;
  embedModel: string;
  description: string;
}

/** 知识库管理：卡片网格 + 新增/编辑弹窗 */
export default function KnowledgePage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<KnowledgeItem[]>(mockKnowledge);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm<KnowledgeFormValues>();

  const filtered = items.filter((item) => item.name.includes(keyword.trim()));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const submit = async () => {
    const values = await form.validateFields();
    setItems((list) => [
      ...list,
      {
        id: `kb-${Date.now()}`,
        name: values.name,
        description: values.description,
        docCount: 0,
        size: '0.00 MB',
        embedStore: values.embedStore,
        embedModel: values.embedModel,
      },
    ]);
    setOpen(false);
    setPage(1);
    message.success('知识库已创建');
  };

  return (
    <PageContainer>
      <FilterBar
        onSearch={() => setPage(1)}
        onReset={() => {
          setKeyword('');
          setPage(1);
        }}
      >
        <FilterItem label="知识库名称">
          <Input
            placeholder="请输入知识库名称"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <div className="sa-knowledge-grid">
        <button type="button" className="sa-knowledge-create" onClick={() => setOpen(true)}>
          <span className="sa-knowledge-create__title">创建知识库</span>
          <span className="sa-knowledge-create__action">
            <FileAddOutlined />
            创建空白知识库
          </span>
        </button>

        {paged.map((item) => (
          <article
            key={item.id}
            className="sa-knowledge-card"
            onClick={() => navigate(`/aigc/knowledge/${item.id}`)}
          >
            <div className="sa-knowledge-card__main">
              <div className="sa-knowledge-card__cover">
                <FileTextOutlined />
              </div>
              <div className="sa-knowledge-card__content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            </div>
            <footer className="sa-knowledge-card__footer">
              <div className="sa-knowledge-card__meta">
                <span>
                  <TagOutlined /> 文档数:{item.docCount}
                </span>
                <span>{item.size}</span>
                <SettingOutlined />
              </div>
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/aigc/knowledge/${item.id}`);
                }}
              />
            </footer>
          </article>
        ))}
      </div>

      <div className="sa-knowledge-pagination">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={[10, 20, 50]}
          showTotal={(total) => `共 ${total} 条`}
          onChange={(nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </div>

      <Modal
        title="新增/编辑知识库"
        open={open}
        width={464}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={submit}>
            提交
          </Button>,
          <Button key="reset" onClick={() => form.resetFields()}>
            重置
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item
            name="embedStore"
            label="向量数据库"
            rules={[{ required: true, message: '请选择关联向量数据库' }]}
          >
            <Select placeholder="请选择关联向量数据库" options={embedStoreOptions} />
          </Form.Item>
          <Form.Item
            name="embedModel"
            label="向量模型"
            rules={[{ required: true, message: '请选择关联向量化模型' }]}
          >
            <Select placeholder="请选择关联向量化模型" options={modelOptions} />
          </Form.Item>
          <Form.Item
            name="description"
            label="知识库描述"
            rules={[{ required: true, message: '请输入知识库描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入知识库描述" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

import {
  CodeOutlined,
  DownloadOutlined,
  PartitionOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Drawer, Empty, Form, Input, Row, Select, Space } from 'antd';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { useEffect, useRef, useState } from 'react';
import { type ModelRecord, mindmapApi } from '@/api/aigc';
import PageContainer from '@/components/PageContainer';

interface MindmapFormValues {
  message: string;
  modelId: number | string;
}

/** Markdown -> 思维导图：模块级复用转换器，避免每次渲染重复构建插件 */
const transformer = new Transformer();

/** 思维导图：输入主题生成 Markdown 大纲并渲染为可缩放导图 */
export default function AIMindmap() {
  const { message } = App.useApp();
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [generating, setGenerating] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [form] = Form.useForm<MindmapFormValues>();

  useEffect(() => {
    if (!svgRef.current) return;
    const markmap = Markmap.create(svgRef.current, { autoFit: true, duration: 300 });
    markmapRef.current = markmap;
    return () => {
      markmap.destroy();
      markmapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    mindmapApi
      .listModels()
      .then((result) => {
        if (cancelled) return;
        setModels(result.list);
        form.setFieldsValue({ modelId: result.list[0]?.id });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        message.error(error instanceof Error ? error.message : '模型加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [form, message]);

  /** Markdown 变化后同步给 markmap 并自适应画布 */
  useEffect(() => {
    if (!markdown || !markmapRef.current) return;
    const { root } = transformer.transform(markdown);
    void markmapRef.current.setData(root).then(() => {
      setRendered(true);
      void markmapRef.current?.fit();
    });
  }, [markdown]);

  const submit = async (values: MindmapFormValues) => {
    const model = models.find((item) => item.id === values.modelId);
    if (!model) {
      message.warning('请先选择对话模型');
      return;
    }
    setGenerating(true);
    try {
      const result = await mindmapApi.generate({
        message: values.message,
        modelId: model.id,
        modelName: model.modelName,
        modelProvider: model.providerCode,
      });
      setMarkdown(result.message ?? '');
      message.success('导图已生成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const downloadSvg = () => {
    const svg = svgRef.current;
    if (!svg || !markdown) {
      message.warning('请先生成导图');
      return;
    }
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smartai-mindmap.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="思维导图"
      contentBordered={false}
      extra={
        <Space>
          <Button icon={<CodeOutlined />} onClick={() => setSourceOpen(true)} disabled={!markdown}>
            查看源码
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void markmapRef.current?.fit()}
            disabled={!markdown}
          >
            重置视图
          </Button>
          <Button icon={<DownloadOutlined />} onClick={downloadSvg} disabled={!markdown}>
            导出 SVG
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={7}>
          <Card title="生成设置">
            <Form form={form} layout="vertical" onFinish={submit}>
              <Form.Item
                name="message"
                label="导图主题"
                rules={[{ required: true, message: '请输入导图主题' }]}
              >
                <Input.TextArea
                  rows={4}
                  maxLength={200}
                  showCount
                  placeholder="如：企业知识库产品的落地方案"
                />
              </Form.Item>
              <Form.Item
                name="modelId"
                label="对话模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select
                  placeholder="请选择 Chat 模型"
                  options={models.map((item) => ({
                    value: item.id,
                    label: `${item.name}（${item.providerCode ?? '-'}）`,
                  }))}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                icon={<ThunderboltOutlined />}
                loading={generating}
              >
                {generating ? '生成中…' : '生成导图'}
              </Button>
            </Form>

            <div className="mt-4 rounded-2 bg-[var(--ant-color-fill-quaternary)] p-3 text-12px text-[var(--ant-color-text-tertiary)]">
              提示：导图支持鼠标拖拽平移、滚轮缩放；节点较多时可点击「重置视图」自适应画布。
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={17}>
          <Card title="导图预览" styles={{ body: { padding: 0 } }}>
            <div className="relative">
              <svg
                ref={svgRef}
                className="h-[62vh] w-full"
                style={{ display: 'block', color: 'var(--ant-color-text)' }}
              />
              {rendered ? null : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Empty
                    image={
                      <PartitionOutlined className="text-48px text-[var(--ant-color-text-tertiary)]" />
                    }
                    description="填写主题并生成后，导图会展示在这里"
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Drawer
        title="Markdown 源码"
        size={520}
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        extra={
          <span className="text-12px text-[var(--ant-color-text-tertiary)]">
            {markdown ? `${markdown.split('\n').length} 行` : '暂无内容'}
          </span>
        }
      >
        <pre className="m-0 whitespace-pre-wrap text-12px">{markdown || '暂无内容'}</pre>
      </Drawer>
    </PageContainer>
  );
}

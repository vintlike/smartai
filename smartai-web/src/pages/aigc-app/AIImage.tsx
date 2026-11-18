import {
  DeleteOutlined,
  DownloadOutlined,
  PictureOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Empty, Form, Image, Input, Row, Select, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { imageApi, type ModelRecord } from '@/api/aigc';
import PageContainer from '@/components/PageContainer';

interface ImageFormValues {
  message: string;
  modelId: number | string;
  size: string;
  quality: string;
  style: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  size: string;
  createTime: string;
}

const sizeOptions = ['1024x1024', '1024x1792', '1792x1024'].map((value) => ({
  value,
  label: value,
}));

const qualityOptions = [
  { value: 'standard', label: '标准' },
  { value: 'hd', label: '高清' },
];

const styleOptions = [
  { value: 'vivid', label: '生动' },
  { value: 'natural', label: '自然' },
];

function formatTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** AI 绘图：左侧参数配置，右侧结果画廊 */
export default function AIImage() {
  const { message } = App.useApp();
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [form] = Form.useForm<ImageFormValues>();
  const modelId = Form.useWatch('modelId', form);

  useEffect(() => {
    let cancelled = false;
    imageApi
      .listModels()
      .then((result) => {
        if (cancelled) return;
        setModels(result.list);
        form.setFieldsValue({
          modelId: result.list[0]?.id,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        message.error(error instanceof Error ? error.message : '绘图模型加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [form, message]);

  const submit = async (values: ImageFormValues) => {
    const model = models.find((item) => item.id === values.modelId);
    if (!model) {
      message.warning('请先选择绘图模型');
      return;
    }
    setGenerating(true);
    try {
      const result = await imageApi.generate({
        message: values.message,
        modelId: model.id,
        modelName: model.modelName,
        modelProvider: model.providerCode,
        size: values.size,
        quality: values.quality,
        style: values.style,
      });
      setImages((prev) => [
        {
          id: `${Date.now()}`,
          url: result.url,
          prompt: values.message,
          model: model.name,
          size: values.size,
          createTime: formatTime(new Date()),
        },
        ...prev,
      ]);
      message.success('图片已生成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageContainer
      title="AI 绘图"
      contentBordered={false}
      extra={
        <Button
          icon={<DeleteOutlined />}
          disabled={images.length === 0}
          onClick={() => setImages([])}
        >
          清空结果
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="绘图参数">
            <Form form={form} layout="vertical" onFinish={submit}>
              <Form.Item
                name="message"
                label="画面描述"
                rules={[{ required: true, message: '请输入画面描述' }]}
              >
                <Input.TextArea
                  rows={5}
                  maxLength={500}
                  showCount
                  placeholder="如：黄昏下的海边灯塔，水彩插画风格"
                />
              </Form.Item>
              <Form.Item
                name="modelId"
                label="绘图模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select
                  placeholder="请选择文生图模型"
                  options={models.map((item) => ({
                    value: item.id,
                    label: `${item.name}（${item.providerCode ?? '-'}）`,
                  }))}
                />
              </Form.Item>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="size" label="尺寸">
                    <Select options={sizeOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="quality" label="质量">
                    <Select options={qualityOptions} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="style" label="风格">
                <Select options={styleOptions} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                icon={<ThunderboltOutlined />}
                loading={generating}
              >
                {generating ? '生成中…' : '开始生成'}
              </Button>
            </Form>
            {modelId ? null : (
              <Space className="mt-3">
                <Tag color="warning">
                  尚未配置文生图模型，请先在「模型管理」中新增 image 类型模型
                </Tag>
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="生成结果"
            extra={
              <span className="text-12px text-[var(--ant-color-text-tertiary)]">
                共 {images.length} 张
              </span>
            }
          >
            {images.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((item) => (
                  <Card key={item.id} size="small" styles={{ body: { padding: 8 } }}>
                    <Image
                      src={item.url}
                      alt={item.prompt}
                      height={200}
                      width="100%"
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <div className="mt-2 line-clamp-2 text-12px" title={item.prompt}>
                      {item.prompt}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Tag color="purple">{item.model}</Tag>
                      <Tag>{item.size}</Tag>
                      <span className="text-11px text-[var(--ant-color-text-tertiary)]">
                        {item.createTime}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <a href={item.url} download={`smartai-${item.id}.svg`}>
                        <Button type="link" size="small" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                      </a>
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setImages((prev) => prev.filter((image) => image.id !== item.id))
                        }
                      >
                        删除
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                image={
                  <PictureOutlined className="text-48px text-[var(--ant-color-text-tertiary)]" />
                }
                description="填写左侧参数并生成，结果会展示在这里"
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

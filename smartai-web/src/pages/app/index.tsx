import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  LinkOutlined,
  MoreOutlined,
  PlusOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { MenuProps, UploadFile } from 'antd';
import { App, Button, Dropdown, Form, Input, Modal, Select, Upload } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelOptions } from '@/services/mock-data';
import type { AppItem } from '@/services/mock-data';
import { mockApps } from '@/services/mock-data';
import '@/pages/app/app.less';

interface AppFormValues {
  name: string;
  model: string;
  description?: string;
  cover?: UploadFile[];
}

/** AI 应用管理：卡片网格 + 新增/编辑弹窗 */
export default function AppListPage() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppItem[]>(mockApps);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [form] = Form.useForm<AppFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setOpen(true);
  };

  const openEdit = (item: AppItem) => {
    setEditing(item);
    form.setFieldsValue({ name: item.name, model: item.model, description: item.description });
    setFileList([]);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      setApps((list) =>
        list.map((item) =>
          item.id === editing.id
            ? { ...item, name: values.name, model: values.model, description: values.description ?? '' }
            : item,
        ),
      );
      message.success('应用已更新');
    } else {
      setApps((list) => [
        ...list,
        {
          id: `app-${Date.now()}`,
          name: values.name,
          model: values.model,
          description: values.description ?? '',
          prompt: '',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        },
      ]);
      message.success('应用创建成功');
    }
    setOpen(false);
  };

  const handleDelete = (item: AppItem) => {
    modal.confirm({
      title: '删除应用',
      content: `确定要删除「${item.name}」吗？删除后不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setApps((list) => list.filter((app) => app.id !== item.id));
        message.success('删除成功');
      },
    });
  };

  const buildMenu = (item: AppItem): MenuProps => ({
    items: [
      { key: 'edit', icon: <EditOutlined />, label: '编辑此应用' },
      { key: 'delete', icon: <DeleteOutlined />, label: '删除此应用', danger: true },
      { type: 'divider' },
      { key: 'info', label: '信息', disabled: true },
      {
        key: 'time',
        label: `创建时间：${item.createdAt}`,
        icon: <ClockCircleOutlined />,
        disabled: true,
      },
      {
        key: 'docs',
        icon: <LinkOutlined />,
        label: (
          <a href="https://smartai.dev" target="_blank" rel="noreferrer">
            SmartAI Apps
          </a>
        ),
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === 'edit') openEdit(item);
      if (key === 'delete') handleDelete(item);
    },
  });

  return (
    <div className="sa-app-page">
      <div className="sa-app-grid">
        <button type="button" className="sa-app-create" onClick={openCreate}>
          <span className="sa-app-create__title">创建应用</span>
          <span className="sa-app-create__action">
            <FileAddOutlined />
            创建空白应用
          </span>
        </button>

        {apps.map((item) => (
          <article
            key={item.id}
            className="sa-app-card"
            onClick={() => navigate(`/app/info/${item.id}`)}
          >
            <div className="sa-app-card__main">
              <div className="sa-app-card__cover">
                <RobotOutlined />
              </div>
              <div className="sa-app-card__content">
                <h3 className="sa-app-card__name">{item.name}</h3>
                <p className="sa-app-card__desc">{item.description}</p>
              </div>
            </div>
            <footer className="sa-app-card__footer">
              <LinkOutlined className="sa-app-card__link" />
              <Dropdown trigger={['click']} menu={buildMenu(item)} placement="bottomRight">
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(event) => event.stopPropagation()}
                />
              </Dropdown>
            </footer>
          </article>
        ))}
      </div>

      <Modal
        title="新增/编辑"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={handleSubmit}>
            提交
          </Button>,
          <Button
            key="reset"
            onClick={() => {
              form.resetFields();
              setFileList([]);
            }}
          >
            重置
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" requiredMark>
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" maxLength={30} />
          </Form.Item>
          <Form.Item
            name="model"
            label="关联模型"
            rules={[{ required: true, message: '请选择关联模型' }]}
          >
            <Select placeholder="请选择关联模型" options={modelOptions} />
          </Form.Item>
          <Form.Item label="应用封面">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => setFileList(next)}
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
            >
              {fileList.length >= 1 ? null : (
                <div className="sa-upload-trigger">
                  <PlusOutlined />
                </div>
              )}
            </Upload>
            <div className="sa-form-tip">支持 jpg / png / gif / webp 格式图片</div>
          </Form.Item>
          <Form.Item name="description" label="应用描述">
            <Input.TextArea rows={4} placeholder="请输入应用描述" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

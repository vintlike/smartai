import { Tabs } from 'antd';
import { useState } from 'react';
import PageContainer from '@/components/PageContainer';
import ChatModelTab from './components/ChatModelTab';
import EmbeddingModelTab from './components/EmbeddingModelTab';
import ImageModelTab from './components/ImageModelTab';

type ModelTabKey = 'chat' | 'embedding' | 'image';

export default function ModelManage() {
  const [activeTab, setActiveTab] = useState<ModelTabKey>('chat');

  return (
    <PageContainer title="模型管理">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ModelTabKey)}
        items={[
          { key: 'chat', label: 'Chat模型供应商', children: <ChatModelTab /> },
          { key: 'embedding', label: 'Embedding向量模型', children: <EmbeddingModelTab /> },
          { key: 'image', label: 'Image文生图模型', children: <ImageModelTab /> },
        ]}
      />
    </PageContainer>
  );
}

import { Card, Space, Tag, Typography } from 'antd'

export interface PagePlaceholderProps {
  title: string
  path: string
  description?: string
}

/** 业务页面占位组件：替换 src/pages 下对应文件即可接入真实业务 */
export function PagePlaceholder({ title, path, description }: PagePlaceholderProps) {
  return (
    <Card className="sa-page" style={{ minHeight: 320 }}>
      <Space orientation="vertical" size={14} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">
            这是业务页面占位，框架本身不包含任何业务逻辑。
          </Typography.Text>
        </div>
        <Space size={8}>
          <Tag color="processing">路由</Tag>
          <Typography.Text code>{path}</Typography.Text>
        </Space>
        {description ? <Typography.Paragraph type="secondary">{description}</Typography.Paragraph> : null}
      </Space>
    </Card>
  )
}

import { EyeOutlined, LogoutOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { App, Button, Descriptions, Divider, Drawer, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { PageContainer, PageHeading } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { TokenItem } from '@/services/mock-data';
import { mockTokens } from '@/services/mock-data';
import '@/pages/system/token/token.less';

/** 令牌管理：令牌由登录生成，只能查看详情或强制下线 */
export default function TokenPage() {
  const { message, modal } = App.useApp();
  const [tokens, setTokens] = useState<TokenItem[]>(mockTokens);
  const [detail, setDetail] = useState<TokenItem | null>(null);

  const columns = useMemo<TableColumnsType<TokenItem>>(
    () => [
      {
        title: '令牌',
        dataIndex: 'token',
        key: 'token',
        render: (value: string) => (
          <div className="sa-token__cell">
            <span className="sa-token__text sa-mono" title={value}>
              {value}
            </span>
            <Typography.Text copyable={{ text: value, tooltips: ['复制', '已复制'] }} />
          </div>
        ),
      },
      { title: '账户', dataIndex: 'username', key: 'username', width: 160 },
      { title: '过期时间', dataIndex: 'expiresAt', key: 'expiresAt', width: 190 },
      {
        title: '操作',
        key: 'action',
        width: 170,
        fixed: 'right',
        render: (_, record) => (
          <div className="sa-row-actions">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetail(record)}
            >
              详情
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<LogoutOutlined />}
              onClick={() =>
                modal.confirm({
                  title: '提示',
                  content: `您确定强制下线 ${record.username} 账户？`,
                  okText: '确定',
                  cancelText: '取消',
                  onOk: () => {
                    setTokens((list) => list.filter((item) => item.id !== record.id));
                    setDetail((current) => (current?.id === record.id ? null : current));
                    message.success('下线成功');
                  },
                })
              }
            >
              下线
            </Button>
          </div>
        ),
      },
    ],
    [modal, message],
  );

  const state = useTableToolbar(columns);

  return (
    <PageContainer>
      <PageHeading title="令牌信息管理" description="系统中所有已经生成的令牌数据。" />
      <Divider className="sa-token__divider" />
      <DataTable<TokenItem> state={state} dataSource={tokens} />
      <Drawer
        title={detail?.username}
        open={Boolean(detail)}
        size={520}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <Descriptions
            bordered
            column={1}
            size="small"
            items={[
              { key: 'id', label: '账户ID', children: detail.id },
              { key: 'username', label: '账户名', children: detail.username },
              { key: 'realName', label: '用户名', children: detail.realName },
              {
                key: 'token',
                label: '令牌',
                children: <span className="sa-mono">{detail.token}</span>,
              },
              { key: 'expiresAt', label: '失效时间', children: detail.expiresAt },
              {
                key: 'roles',
                label: '角色列表',
                children: detail.roles.map((role) => (
                  <Tag key={role} color="success">
                    {role}
                  </Tag>
                )),
              },
              {
                key: 'perms',
                label: '权限列表',
                children: detail.perms.map((perm) => (
                  <Tag key={perm} color="processing">
                    {perm}
                  </Tag>
                )),
              },
            ]}
          />
        ) : null}
      </Drawer>
    </PageContainer>
  );
}

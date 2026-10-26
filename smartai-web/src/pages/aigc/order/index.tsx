import { DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Button, Divider, Input } from 'antd';
import { useMemo, useState } from 'react';
import { LineChart } from '@/components/chart/LineChart';
import { FilterBar, FilterItem, PageContainer } from '@/components/page/PageContainer';
import { DataTable } from '@/components/table/DataTable';
import { useTableToolbar } from '@/components/table/useTableToolbar';
import type { OrderItem } from '@/services/mock-data';
import { mockOrders, orderTrend, trendLabels } from '@/services/mock-data';
import '@/pages/aigc/order/order.less';

/** 账单统计：近 30 天请求汇总 + 调用明细 */
export default function OrderPage() {
  const [username, setUsername] = useState('');

  const columns = useMemo<TableColumnsType<OrderItem>>(
    () => [
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '模型名称', dataIndex: 'model', key: 'model' },
      { title: 'Tokens', dataIndex: 'tokens', key: 'tokens', width: 120 },
      { title: 'Prompt Tokens', dataIndex: 'promptTokens', key: 'promptTokens', width: 140 },
      { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 150 },
      { title: '调用时间', dataIndex: 'createdAt', key: 'createdAt', width: 190 },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: () => <Button type="text" size="small" danger icon={<DeleteOutlined />} />,
      },
    ],
    [],
  );

  const state = useTableToolbar(columns);

  return (
    <PageContainer>
      <div className="sa-order__chart">
        <div className="sa-order__chart-title">近30天请求汇总</div>
        <LineChart values={orderTrend} labels={trendLabels} area height={240} />
      </div>

      <Divider className="sa-order__divider" />

      <FilterBar onReset={() => setUsername('')}>
        <FilterItem label="用户名">
          <Input
            placeholder="请输入用户名查询"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            allowClear
          />
        </FilterItem>
      </FilterBar>

      <DataTable<OrderItem>
        state={state}
        dataSource={mockOrders.filter((item) => item.username.includes(username.trim()))}
      />
    </PageContainer>
  );
}

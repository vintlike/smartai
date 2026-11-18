import { ApiOutlined, ProfileOutlined, RiseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Popconfirm, Row, Statistic, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMemo, useState } from 'react';
import type { QueryParams } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import { chartColors, useThemeMode } from '@/framework';
import { useTableToolbar } from '@/hooks/useTableToolbar';

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

interface BillingRecord {
  id: number;
  username: string;
  modelName: string;
  tokens: number;
  promptTokens: number;
  completionTokens: number;
  ip: string;
  callTime: string;
}

interface DailyStat {
  date: string;
  tokens: number;
  requests: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  return value.toLocaleString();
}

const modelCycle = ['gpt-4o', 'gpt-4o-mini', 'deepseek-v3', 'qwen-max', 'glm-4-plus'];

function createBillingRecords(): BillingRecord[] {
  return Array.from({ length: 53 }, (_, index) => {
    const promptTokens = 100 + Math.floor(Math.random() * 2000);
    const completionTokens = 200 + Math.floor(Math.random() * 3000);
    return {
      id: index + 1,
      username: `user${(index % 12) + 1}@example.com`,
      modelName: modelCycle[index % modelCycle.length],
      tokens: promptTokens + completionTokens,
      promptTokens,
      completionTokens,
      ip: `192.168.${(index % 4) + 1}.${20 + (index % 60)}`,
      callTime: formatTime(new Date(Date.now() - index * 6 * 3600000)),
    };
  });
}

/** 近 30 日趋势：用固定波形生成，刷新页面数值保持稳定 */
function createDailyStats(): DailyStat[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const wave = Math.sin(index / 3) * 0.22 + 1;
    const requests = Math.round(1200 * wave + (index % 5) * 40);
    return {
      date: `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      requests,
      tokens: requests * (620 + (index % 7) * 30),
    };
  });
}

function buildTrendOption(stats: DailyStat[], isDark: boolean) {
  const textColor = isDark ? '#ffffffb3' : '#00000073';
  const axisLineColor = isDark ? '#1a3a5c' : '#f0f0f0';
  const tokenColor = chartColors[0];
  const requestColor = chartColors[1];

  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: textColor } },
    /* echarts 6 起 containLabel 已废弃，等价写法为下面两项（不引入 LegacyGridContainLabel） */
    grid: {
      top: 32,
      left: 16,
      right: 16,
      bottom: 36,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.map((item) => item.date),
      axisLine: { lineStyle: { color: axisLineColor } },
      axisLabel: { color: textColor },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Tokens',
        nameTextStyle: { color: textColor },
        splitLine: { lineStyle: { color: axisLineColor } },
        axisLabel: {
          color: textColor,
          formatter: (value: number) => {
            if (value >= 1000000) return `${value / 1000000}M`;
            if (value >= 1000) return `${value / 1000}K`;
            return `${value}`;
          },
        },
      },
      {
        type: 'value',
        name: '调用次数',
        nameTextStyle: { color: textColor },
        splitLine: { show: false },
        axisLabel: { color: textColor },
      },
    ],
    series: [
      {
        name: 'Token 消耗',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: stats.map((item) => item.tokens),
        lineStyle: { width: 2, color: tokenColor },
        itemStyle: { color: tokenColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${tokenColor}40` },
            { offset: 1, color: `${tokenColor}05` },
          ]),
        },
      },
      {
        name: '调用次数',
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        data: stats.map((item) => item.requests),
        lineStyle: { width: 2, color: requestColor },
        itemStyle: { color: requestColor },
      },
    ],
  };
}

export default function Billing() {
  const { message } = App.useApp();
  const { isDark } = useThemeMode();
  const [records, setRecords] = useState<BillingRecord[]>(createBillingRecords);
  const [stats, setStats] = useState<DailyStat[]>(createDailyStats);
  const [query, setQuery] = useState<QueryParams>({});
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const filteredRecords = useMemo(() => {
    const keyword = typeof query.username === 'string' ? query.username.toLowerCase() : '';
    return records.filter((item) => {
      if (keyword && !item.username.toLowerCase().includes(keyword)) return false;
      if (typeof query.model === 'string' && item.modelName !== query.model) return false;
      return true;
    });
  }, [records, query]);

  const summary = useMemo(() => {
    const totalTokens = stats.reduce((sum, item) => sum + item.tokens, 0);
    const totalRequests = stats.reduce((sum, item) => sum + item.requests, 0);
    return {
      totalTokens,
      totalRequests,
      avgToken: totalRequests ? Math.round(totalTokens / totalRequests) : 0,
    };
  }, [stats]);

  const cards = [
    {
      title: '近 30 日调用次数',
      value: summary.totalRequests,
      suffix: '次',
      icon: <ApiOutlined />,
      color: chartColors[0],
    },
    {
      title: '近 30 日 Token',
      value: summary.totalTokens,
      suffix: '',
      icon: <RiseOutlined />,
      color: chartColors[1],
    },
    {
      title: '单次平均 Token',
      value: summary.avgToken,
      suffix: '',
      icon: <ThunderboltOutlined />,
      color: chartColors[3],
    },
    {
      title: '账单记录',
      value: filteredRecords.length,
      suffix: '条',
      icon: <ProfileOutlined />,
      color: chartColors[4],
    },
  ];

  const handleSearch = (values: QueryParams) => {
    setQuery(values);
    setPageState(1);
  };

  const handleResetSearch = () => {
    setQuery({});
    setPageState(1);
  };

  const columns: ColumnsType<BillingRecord> = [
    { title: '用户名', dataIndex: 'username', width: 200, ellipsis: true },
    { title: '模型名称', dataIndex: 'modelName', width: 140 },
    {
      title: 'Tokens',
      dataIndex: 'tokens',
      width: 130,
      sorter: (a, b) => a.tokens - b.tokens,
      render: (value: number) => <Tag color="geekblue">{formatNumber(value)}</Tag>,
    },
    {
      title: 'Prompt Tokens',
      dataIndex: 'promptTokens',
      width: 140,
      render: (value: number) => <Tag color="purple">{formatNumber(value)}</Tag>,
    },
    {
      title: 'Completion Tokens',
      dataIndex: 'completionTokens',
      width: 160,
      render: (value: number) => <Tag color="cyan">{formatNumber(value)}</Tag>,
    },
    { title: 'IP地址', dataIndex: 'ip', width: 140 },
    {
      title: '调用时间',
      dataIndex: 'callTime',
      width: 180,
      sorter: (a, b) => a.callTime.localeCompare(b.callTime),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确认删除"
          description="确定要删除该账单记录吗？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => {
            setRecords((prev) => prev.filter((item) => item.id !== record.id));
            message.success('删除成功');
          }}
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const toolbar = useTableToolbar<BillingRecord>(columns, async () => {
    // 当前为本地 mock 数据源，刷新会重新生成账单与趋势数据
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRecords(createBillingRecords());
    setStats(createDailyStats());
    setPageState(1);
    setQuery((prev) => ({ ...prev }));
  });

  return (
    <PageContainer title="账单统计" contentBordered={false}>
      <Row gutter={[16, 16]} className="mb-4">
        {cards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={<span style={{ color: item.color, fontSize: 22 }}>{item.icon}</span>}
                formatter={(value) => (
                  <span style={{ fontWeight: 600 }}>{formatNumber(Number(value))}</span>
                )}
                suffix={
                  item.suffix ? (
                    <span style={{ fontSize: 14, color: isDark ? '#ffffff73' : '#00000073' }}>
                      {item.suffix}
                    </span>
                  ) : undefined
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="近 30 日用量趋势"
        className="mb-4"
        extra={
          <span className="text-12px text-[var(--ant-color-text-tertiary)]">
            Token 消耗与调用次数双轴对比
          </span>
        }
        styles={{ body: { padding: '12px 16px' } }}
      >
        <ReactEChartsCore
          echarts={echarts}
          option={buildTrendOption(stats, isDark)}
          style={{ width: '100%', height: 300 }}
          notMerge
        />
      </Card>

      <SearchBar
        fields={[
          { name: 'username', label: '用户', placeholder: '用户名 / 邮箱', width: 200 },
          {
            name: 'model',
            label: '模型',
            type: 'select',
            width: 160,
            options: modelCycle.map((item) => ({ value: item, label: item })),
          },
        ]}
        onSearch={handleSearch}
        onReset={handleResetSearch}
      />
      <div className="rounded-12px bg-[var(--ant-color-bg-container)] p-4">
        <DataTable
          rowKey="id"
          bordered
          state={toolbar}
          dataSource={filteredRecords}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total: filteredRecords.length,
            onChange: (nextPage, nextPageSize) => {
              setPageState(nextPage);
              setPageSizeState(nextPageSize);
            },
          }}
        />
      </div>
    </PageContainer>
  );
}

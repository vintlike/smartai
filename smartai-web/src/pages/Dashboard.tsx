import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DatabaseOutlined,
  MessageOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Card, Col, Row, Statistic } from 'antd';
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
// 注：echarts-for-react 3.1.0 起 exports 只暴露 lib/*；lib/core 在 ESM 条件下会解析到
// esm/core.js，因此不会遇到 CJS default 互操作问题（不要再直接写已不存在的 esm/core 子路径）
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useCallback, useEffect, useState } from 'react';
import type { DashboardOverviewRecord, DashboardTrendRecord } from '@/api/aigc';
import { dashboardApi } from '@/api/aigc';
import PageContainer from '@/components/PageContainer';
import { chartColors, useThemeMode } from '@/framework';

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

/** 环比变化，分母为 0 时视为全新增长 */
function percentChange(current: number, previous: number): number {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/** 格式化数字，添加千分位 */
function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  return value.toLocaleString();
}

interface ChartSeries {
  name: string;
  color: string;
  data: number[];
}

/** 构建面积图 option */
function buildAreaOption(dates: string[], series: ChartSeries[], isDark: boolean) {
  const textColor = isDark ? '#ffffffb3' : '#00000073';
  const axisLineColor = isDark ? '#1a3a5c' : '#f0f0f0';

  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: textColor } },
    /* echarts 6 起 containLabel 已废弃，等价写法为下面两项（不引入 LegacyGridContainLabel） */
    grid: {
      top: 20,
      left: 16,
      right: 16,
      bottom: 36,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: axisLineColor } },
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: 'value',
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
    series: series.map((item) => ({
      type: 'line',
      name: item.name,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: item.data,
      lineStyle: { width: 2, color: item.color },
      itemStyle: { color: item.color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${item.color}40` },
          { offset: 1, color: `${item.color}05` },
        ]),
      },
    })),
  };
}

export default function Dashboard() {
  const { message } = App.useApp();
  const { isDark } = useThemeMode();
  const [overview, setOverview] = useState<DashboardOverviewRecord | null>(null);
  const [trend, setTrend] = useState<DashboardTrendRecord[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [overviewResult, trendResult] = await Promise.all([
        dashboardApi.overview(7),
        dashboardApi.trend(7),
      ]);
      setOverview(overviewResult);
      setTrend(trendResult);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '看板数据加载失败');
    }
  }, [message]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const current = overview?.current ?? {};
  const previous = overview?.previous ?? {};
  const assets = overview?.assets ?? {};

  /** 统计卡片数据 */
  const stats = [
    {
      title: 'LLM请求量',
      value: Number(current.callCount ?? 0),
      suffix: '次',
      icon: <MessageOutlined />,
      trend: percentChange(Number(current.callCount ?? 0), Number(previous.callCount ?? 0)),
      color: chartColors[0],
    },
    {
      title: 'Token消耗量',
      value: Number(current.totalTokens ?? 0),
      suffix: '',
      icon: <RiseOutlined />,
      trend: percentChange(Number(current.totalTokens ?? 0), Number(previous.totalTokens ?? 0)),
      color: chartColors[1],
    },
    {
      title: '用户增长量',
      value: Number(overview?.newUserCount ?? 0),
      suffix: '人',
      icon: <UserOutlined />,
      trend: percentChange(
        Number(overview?.newUserCount ?? 0),
        Number(overview?.newUserCountPrev ?? 0),
      ),
      color: chartColors[3],
    },
    {
      title: '知识库数量',
      value: Number(overview?.knowledgeCount ?? assets.knowledgeCount ?? 0),
      suffix: '个',
      icon: <DatabaseOutlined />,
      trend: percentChange(
        Number(overview?.knowledgeCount ?? 0),
        Number(overview?.knowledgeCountPrev ?? 0),
      ),
      color: chartColors[4],
    },
  ];

  const dates = trend.map((item) => (item.statDate ?? '').slice(5));

  /** Token消耗量图表配置 */
  const tokenOption = buildAreaOption(
    dates,
    [
      {
        name: '输入Token',
        color: chartColors[0],
        data: trend.map((item) => Number(item.promptTokens ?? 0)),
      },
      {
        name: '输出Token',
        color: chartColors[1],
        data: trend.map((item) => Number(item.completionTokens ?? 0)),
      },
    ],
    isDark,
  );

  /** AI请求量图表配置 */
  const requestOption = buildAreaOption(
    dates,
    [
      {
        name: '请求量',
        color: chartColors[3],
        data: trend.map((item) => Number(item.callCount ?? 0)),
      },
    ],
    isDark,
  );

  return (
    <PageContainer
      title="数据看板"
      contentBordered={false}
      contentClassName="flex flex-col gap-16px"
    >
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {stats.map((item) => (
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
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: item.trend >= 0 ? '#0ac17e' : '#ff3c31',
                }}
              >
                {item.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(item.trend)}%
                <span
                  style={{
                    color: isDark ? '#ffffff52' : '#00000040',
                    marginLeft: 4,
                  }}
                >
                  较昨日
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Token消耗量统计报表" styles={{ body: { padding: '12px 16px' } }}>
            <ReactEChartsCore
              echarts={echarts}
              option={tokenOption}
              style={{ width: '100%', height: 320 }}
              notMerge
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="AI请求量统计报表" styles={{ body: { padding: '12px 16px' } }}>
            <ReactEChartsCore
              echarts={echarts}
              option={requestOption}
              style={{ width: '100%', height: 320 }}
              notMerge
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

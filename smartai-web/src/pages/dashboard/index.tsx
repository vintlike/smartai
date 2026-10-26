import { CaretUpOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import { LineChart } from '@/components/chart/LineChart';
import { Panel } from '@/components/page/PageContainer';
import { mockApps, requestTrend, tokenTrend, trendLabels } from '@/services/mock-data';
import '@/pages/dashboard/dashboard.less';

const totalRequests = requestTrend.reduce((sum, value) => sum + value, 0);
const totalTokens = Math.round(tokenTrend.reduce((sum, value) => sum + value, 0) * 1000);

interface StatItem {
  key: string;
  label: string;
  value: string;
  totalLabel: string;
  totalValue: string;
  category: string;
  tone: 'success' | 'processing' | 'warning' | 'error';
}

const stats: StatItem[] = [
  {
    key: 'req',
    label: 'LLM请求量',
    value: String(requestTrend[requestTrend.length - 1]),
    totalLabel: 'LLM总请求量',
    totalValue: totalRequests.toLocaleString('en-US'),
    category: '日',
    tone: 'success',
  },
  {
    key: 'token',
    label: 'Token消耗量',
    value: (tokenTrend[tokenTrend.length - 1] * 1000).toLocaleString('en-US'),
    totalLabel: 'Token总消耗量',
    totalValue: `${(totalTokens / 1000).toFixed(1)}k`,
    category: '日',
    tone: 'processing',
  },
  {
    key: 'user',
    label: '用户增长量',
    value: '12',
    totalLabel: '平台用户总量',
    totalValue: '368',
    category: '月',
    tone: 'warning',
  },
  {
    key: 'knowledge',
    label: '知识库数量',
    value: '4',
    totalLabel: 'AI应用数量',
    totalValue: String(mockApps.length),
    category: '合',
    tone: 'error',
  },
];

/** 主控台：核心指标卡片 + 趋势图表 */
export default function DashboardPage() {
  return (
    <div className="sa-dashboard">
      <div className="sa-dashboard__stats">
        {stats.map((item) => (
          <article className="sa-stat-card" key={item.key}>
            <header className="sa-stat-card__header">
              <span className="sa-stat-card__title">{item.label}</span>
              <span className={`sa-stat-card__tag sa-stat-card__tag--${item.tone}`}>
                {item.category}
              </span>
            </header>
            <div className="sa-stat-card__value">{item.value}</div>
            <footer className="sa-stat-card__footer">
              <span>
                {item.totalLabel} {item.totalValue}
              </span>
              <CaretUpOutlined className="sa-stat-card__trend" />
            </footer>
          </article>
        ))}
      </div>

      <Panel className="sa-dashboard__chart">
        <Tabs
          defaultActiveKey="token"
          items={[
            {
              key: 'token',
              label: 'Token消耗量统计',
              children: (
                <LineChart
                  values={tokenTrend}
                  labels={trendLabels}
                  height={420}
                  formatValue={(value) => (value === 0 ? '0' : `${value.toFixed(1)}k`)}
                />
              ),
            },
            {
              key: 'request',
              label: 'AI请求量统计',
              children: <LineChart values={requestTrend} labels={trendLabels} area height={420} />,
            },
          ]}
        />
      </Panel>
    </div>
  );
}

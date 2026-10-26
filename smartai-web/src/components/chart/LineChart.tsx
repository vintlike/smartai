import { useEffect, useId, useRef, useState } from 'react';
import '@/components/chart/line-chart.less';

export interface LineChartProps {
  values: number[];
  labels: string[];
  /** 是否绘制面积填充 */
  area?: boolean;
  height?: number;
  /** X 轴标签间隔，默认每 3 个显示一个 */
  labelStep?: number;
  /** Y 轴数值格式化 */
  formatValue?: (value: number) => string;
}

/** 取「好看」的坐标轴最大值，保证 4 等分后刻度整洁 */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const candidates = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const fit = candidates.find((item) => item * base >= value);
  return (fit ?? 10) * base;
}

function defaultFormat(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * 轻量 SVG 折线/面积图。
 * 不引入图表库，保持依赖体积，视觉上对齐参考站点的网格 + 圆点折线风格。
 */
export function LineChart({
  values,
  labels,
  area,
  height = 360,
  labelStep = 3,
  formatValue = defaultFormat,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const innerWidth = Math.max(width - padding.left - padding.right, 0);
  const innerHeight = Math.max(height - padding.top - padding.bottom, 0);
  const maxValue = niceMax(Math.max(...values, 0));
  const tickCount = 4;

  const pointAt = (value: number, index: number) => {
    const x = padding.left + (values.length <= 1 ? innerWidth / 2 : (innerWidth * index) / (values.length - 1));
    const y = padding.top + innerHeight - (Math.min(value, maxValue) / maxValue) * innerHeight;
    return { x, y };
  };

  const points = values.map((value, index) => pointAt(value, index));
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${padding.top + innerHeight} L${points[0].x},${padding.top + innerHeight} Z`
      : '';

  return (
    <div className="sa-line-chart" ref={containerRef} style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="趋势图">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.18} />
            </linearGradient>
          </defs>

          {/* 水平网格与 Y 轴刻度 */}
          {Array.from({ length: tickCount + 1 }, (_, index) => {
            const value = (maxValue / tickCount) * index;
            const y = padding.top + innerHeight - (innerHeight * index) / tickCount;
            return (
              <g key={`h-${index}`}>
                <line
                  className="sa-line-chart__grid"
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                />
                <text
                  className="sa-line-chart__axis-label"
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}

          {/* 垂直网格与 X 轴刻度 */}
          {labels.map((label, index) => {
            const { x } = pointAt(0, index);
            const visible = index % labelStep === 0 || index === labels.length - 1;
            return (
              <g key={`v-${label}`}>
                <line
                  className="sa-line-chart__grid"
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                />
                {visible ? (
                  <text
                    className="sa-line-chart__axis-label"
                    x={x}
                    y={padding.top + innerHeight + 18}
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {area && areaPath ? (
            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          ) : null}

          <path className="sa-line-chart__line" d={linePath} fill="none" />

          {points.map((point, index) => (
            <circle
              // 点位固定按索引渲染，索引即唯一标识
              key={`point-${index}`}
              className="sa-line-chart__dot"
              cx={point.x}
              cy={point.y}
              r={3}
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
}

import type { TableColumnsType } from 'antd';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 表格密度 */
export type TableDensity = 'compact' | 'default' | 'loose';

/** 密度与 antd Table size 的映射 */
export const densitySizeMap: Record<TableDensity, 'small' | 'middle' | 'large'> = {
  compact: 'small',
  default: 'middle',
  loose: 'large',
};

export const densityLabels: Record<TableDensity, string> = {
  compact: '紧凑',
  default: '默认',
  loose: '宽松',
};

export interface ColumnMeta {
  key: string;
  title: ReactNode;
}

export interface TableToolbarState<T> {
  /** 斑马纹 */
  zebra: boolean;
  setZebra: (zebra: boolean) => void;
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
  tableSize: 'small' | 'middle' | 'large';
  /** 全部可配置列 */
  columnMetas: ColumnMeta[];
  /** 被隐藏的列 key */
  hiddenKeys: string[];
  toggleColumn: (key: string, visible: boolean) => void;
  resetColumns: () => void;
  /** 过滤后的列 */
  visibleColumns: TableColumnsType<T>;
  /** 手动刷新时的短暂 loading */
  loading: boolean;
  refresh: () => void;
}

function getColumnKey<T>(column: TableColumnsType<T>[number]): string {
  const raw = column.key ?? ('dataIndex' in column ? column.dataIndex : undefined);
  if (Array.isArray(raw)) return raw.join('.');
  return raw === undefined || raw === null ? '' : String(raw);
}

/**
 * 表格工具栏状态：斑马纹 / 密度 / 列展示 / 刷新。
 * columns 建议在页面内用 useMemo 定义，避免列配置反复重建。
 */
export function useTableToolbar<T>(columns: TableColumnsType<T>): TableToolbarState<T> {
  const [zebra, setZebra] = useState(false);
  const [density, setDensity] = useState<TableDensity>('default');
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const refresh = useCallback(() => {
    setLoading(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setLoading(false), 300);
  }, []);

  const toggleColumn = useCallback((key: string, visible: boolean) => {
    setHiddenKeys((keys) => (visible ? keys.filter((item) => item !== key) : [...keys, key]));
  }, []);

  const resetColumns = useCallback(() => setHiddenKeys([]), []);

  const columnMetas: ColumnMeta[] = [];
  for (const column of columns) {
    const key = getColumnKey(column);
    if (!key || column.hidden) continue;
    const title = typeof column.title === 'function' ? key : (column.title ?? key);
    columnMetas.push({ key, title });
  }

  const visibleColumns = columns.filter((column) => !hiddenKeys.includes(getColumnKey(column)));

  return {
    zebra,
    setZebra,
    density,
    setDensity,
    tableSize: densitySizeMap[density],
    columnMetas,
    hiddenKeys,
    toggleColumn,
    resetColumns,
    visibleColumns,
    loading,
    refresh,
  };
}

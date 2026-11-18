import type { TableColumnsType } from 'antd';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePageRefresh } from '@/framework/layout/usePageRefresh';

/** 表格密度 */
export type TableDensity = 'compact' | 'default' | 'loose';

/** 密度与 antd Table size 的映射 */
export const densitySizeMap: Record<TableDensity, 'small' | 'middle' | 'large'> = {
  compact: 'small',
  default: 'middle',
  loose: 'large',
};

export interface ColumnMeta {
  key: string;
  title: ReactNode;
}

export interface TableToolbarState<T> {
  /** 斑马纹 */
  zebra: boolean;
  setZebra: (zebra: boolean) => void;
  /** 行密度 */
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
  /** 映射后的 antd Table size */
  tableSize: 'small' | 'middle' | 'large';
  /** 全部可配置列 */
  columnMetas: ColumnMeta[];
  /** 被隐藏的列 key */
  hiddenKeys: string[];
  toggleColumn: (key: string, visible: boolean) => void;
  resetColumns: () => void;
  /** 过滤后的列（可直接传给 Table） */
  visibleColumns: TableColumnsType<T>;
  /** 刷新时的 loading（与表格自身 loading 取并集） */
  loading: boolean;
  /** 重新加载数据 */
  refresh: () => Promise<void>;
}

type Column<T> = TableColumnsType<T>[number];

function getColumnKey<T>(column: Column<T>): string {
  const raw = column.key ?? ('dataIndex' in column ? column.dataIndex : undefined);
  if (Array.isArray(raw)) return raw.join('.');
  return raw === undefined || raw === null ? '' : String(raw);
}

function isColumnHidden<T>(column: Column<T>): boolean {
  return 'hidden' in column && Boolean(column.hidden);
}

/**
 * 表格工具栏状态：斑马纹 / 密度 / 列显隐 / 刷新。
 * - columns 建议在页面内用 useMemo 定义，避免列配置反复重建
 * - onRefresh 必须是真实的数据加载函数；页签刷新会通过 usePageRefresh 触发它
 */
export function useTableToolbar<T>(
  columns: TableColumnsType<T>,
  onRefresh: () => void | Promise<void>,
): TableToolbarState<T> {
  const [zebra, setZebra] = useState(false);
  const [density, setDensity] = useState<TableDensity>('default');
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await onRefreshRef.current();
    } catch {
      // 数据加载失败由页面自行提示，工具栏只负责收起 loading
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(refresh);

  const toggleColumn = useCallback((key: string, visible: boolean) => {
    setHiddenKeys((keys) => (visible ? keys.filter((item) => item !== key) : [...keys, key]));
  }, []);

  const resetColumns = useCallback(() => setHiddenKeys([]), []);

  const columnMetas = useMemo<ColumnMeta[]>(() => {
    const metas: ColumnMeta[] = [];
    for (const column of columns) {
      const key = getColumnKey(column);
      if (!key || isColumnHidden(column)) continue;
      const title = typeof column.title === 'function' ? key : (column.title ?? key);
      metas.push({ key, title });
    }
    return metas;
  }, [columns]);

  const visibleColumns = useMemo(
    () =>
      columns.filter((column) => {
        const key = getColumnKey(column);
        return !key || !hiddenKeys.includes(key);
      }),
    [columns, hiddenKeys],
  );

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

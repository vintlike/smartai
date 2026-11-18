import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageQuery, PageResult, QueryParams } from '@/api/types';

export interface UseTableQueryOptions<T> {
  /** 数据源，入参是合并后的查询条件（含 page / pageSize） */
  fetcher: (query: PageQuery) => Promise<PageResult<T>>;
  /** 初始查询条件，只在首次挂载时生效 */
  defaultParams?: QueryParams;
  defaultPage?: number;
  defaultPageSize?: number;
  /** 是否在挂载时立即请求，默认 true */
  immediate?: boolean;
  /** 请求失败时是否清空当前列表，默认 false（保留上次结果，避免表格闪空） */
  clearOnError?: boolean;
}

export interface UseTableQueryResult<T> {
  dataSource: T[];
  total: number;
  loading: boolean;
  error: Error | undefined;
  page: number;
  pageSize: number;
  params: QueryParams;
  /** 按当前条件重新请求 */
  refresh: () => void;
  /** 修改查询条件并回到第一页 */
  search: (nextParams?: QueryParams) => void;
  /** 清空查询条件并回到第一页 */
  reset: () => void;
  /** 翻页 / 改每页条数 */
  setPage: (nextPage: number, nextPageSize?: number) => void;
}

/**
 * 列表页通用查询：管住 loading / 分页 / 查询条件 / 竞态。
 * 页面只需提供 fetcher，并在增删改后调用 refresh。
 */
export function useTableQuery<T>({
  fetcher,
  defaultParams,
  defaultPage = 1,
  defaultPageSize = 10,
  immediate = true,
  clearOnError = false,
}: UseTableQueryOptions<T>): UseTableQueryResult<T> {
  // fetcher 通常是内联箭头函数，用 ref 持有最新引用，避免把自己写进 effect 依赖
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const defaultParamsRef = useRef<QueryParams>(defaultParams ?? {});

  const [dataSource, setDataSource] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error>();
  const [page, setPageState] = useState(defaultPage);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [params, setParamsState] = useState<QueryParams>(defaultParamsRef.current);
  const requestId = useRef(0);
  const mounted = useRef(false);

  const load = useCallback(() => {
    const currentId = ++requestId.current;
    setLoading(true);
    setError(undefined);
    fetcherRef
      .current({ ...params, page, pageSize })
      .then((result) => {
        if (currentId !== requestId.current) return;
        setDataSource(result.list ?? []);
        setTotal(result.total ?? 0);
      })
      .catch((err: unknown) => {
        if (currentId !== requestId.current) return;
        if (clearOnError) setDataSource([]);
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (currentId === requestId.current) setLoading(false);
      });
  }, [params, page, pageSize, clearOnError]);

  useEffect(() => {
    const isFirstRun = !mounted.current;
    mounted.current = true;
    if (isFirstRun && !immediate) return;
    load();
  }, [load, immediate]);

  const search = useCallback((nextParams: QueryParams = {}) => {
    setParamsState({ ...nextParams });
    setPageState(1);
  }, []);

  const reset = useCallback(() => {
    setParamsState({ ...defaultParamsRef.current });
    setPageState(1);
  }, []);

  const setPage = useCallback((nextPage: number, nextPageSize?: number) => {
    setPageState(nextPage);
    if (nextPageSize !== undefined) setPageSizeState(nextPageSize);
  }, []);

  return {
    dataSource,
    total,
    loading,
    error,
    page,
    pageSize,
    params,
    refresh: load,
    search,
    reset,
    setPage,
  };
}

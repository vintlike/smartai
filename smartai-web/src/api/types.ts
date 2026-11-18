/** 请求参数的通用形态，undefined / null / 空串会在发请求时被忽略 */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** 分页查询参数 */
export interface PageQuery extends QueryParams {
  page?: number;
  pageSize?: number;
}

/**
 * 分页返回结构。
 * 后端统一按 { list, total } 返回，页面直接用 useTableQuery 消费。
 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

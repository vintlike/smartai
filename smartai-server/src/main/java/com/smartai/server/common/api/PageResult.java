package com.smartai.server.common.api;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {

    private List<T> list;
    private long total;

    public static <T> PageResult<T> of(List<T> list, long total) {
        return new PageResult<>(list, total);
    }

    /** 内存分页：适用于菜单、部门等需要先构建树或全量过滤的小数据集 */
    public static <T> PageResult<T> slice(List<T> all, PageQuery query) {
        long total = all.size();
        int from = (int) Math.min((query.getPage() - 1) * query.getPageSize(), total);
        int to = (int) Math.min(from + query.getPageSize(), total);
        return new PageResult<>(all.subList(from, to), total);
    }
}

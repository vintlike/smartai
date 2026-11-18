package com.smartai.server.common.api;

import lombok.Data;

@Data
public class PageQuery {

    private long page = 1;
    private long pageSize = 10;
    private String keyword;

    public long getPage() {
        return Math.max(page, 1);
    }

    public long getPageSize() {
        return Math.min(Math.max(pageSize, 1), 1000);
    }
}

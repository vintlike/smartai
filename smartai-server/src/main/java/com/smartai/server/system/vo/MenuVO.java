package com.smartai.server.system.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 字段命名对齐前端 SysMenu 契约（orderNo / isExt / isShow）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuVO {

    private String id;
    private String name;
    private String parentId;
    private String path;
    private String perms;
    private String type;
    private Integer orderNo;
    private String icon;
    private String component;
    private Integer isDisabled;
    private Integer isExt;
    private Integer isKeepalive;
    private Integer isShow;
}

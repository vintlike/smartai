package com.smartai.entity;

import lombok.Data;

@Data
public class SysMenu {

    private String id;
    private String name;
    private String parentId;
    private String path;
    private String perms;
    private String type;
    private Integer sortOrder;
    private String icon;
    private String component;
    private Boolean isDisabled;
    private Boolean isExternal;
    private Boolean isKeepalive;
    private Boolean isVisible;
}

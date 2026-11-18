package com.smartai.server.system.dto;

import lombok.Data;

@Data
public class MenuSaveRequest {

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

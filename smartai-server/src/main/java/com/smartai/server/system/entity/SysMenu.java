package com.smartai.server.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_menu")
public class SysMenu {

    @TableId(type = IdType.INPUT)
    private String id;
    private String name;
    private String parentId;
    private String path;
    private String perms;
    private String type;
    private Integer sortOrder;
    private String icon;
    private String component;
    private Integer isDisabled;
    private Integer isExternal;
    private Integer isKeepalive;
    private Integer isVisible;
}

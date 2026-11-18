package com.smartai.server.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_dept")
public class SysDept {

    @TableId(type = IdType.INPUT)
    private String id;
    private String parentId;
    private String name;
    private Integer sortOrder;
    private String description;
}

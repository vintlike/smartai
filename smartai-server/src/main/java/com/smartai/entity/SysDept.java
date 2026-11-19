package com.smartai.entity;

import lombok.Data;

@Data
public class SysDept {

    private String id;
    private String parentId;
    private String name;
    private Integer sortOrder;
    private String description;
}

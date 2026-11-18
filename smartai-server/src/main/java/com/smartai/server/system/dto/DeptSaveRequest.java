package com.smartai.server.system.dto;

import lombok.Data;

@Data
public class DeptSaveRequest {

    private String name;
    private String parentId;
    private Integer sortOrder;
    private String description;
}

package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnnotationCategory {

    private String id;
    private String parentId;
    private String categoryKey;
    private String name;
    private String description;
    private Integer sortOrder;
    private LocalDateTime createTime;
}

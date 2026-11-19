package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnnotationProject {

    private String id;
    private String name;
    private String description;
    private String status;
    private LocalDateTime createTime;
}

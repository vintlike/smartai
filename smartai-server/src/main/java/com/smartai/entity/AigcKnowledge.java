package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcKnowledge {

    private String id;
    private String userId;
    private String embedStoreId;
    private String embedModelId;
    private String name;
    private String description;
    private String cover;
    private LocalDateTime createTime;

    private String username;
    private String embedStoreName;
    private String embedModelName;
    private Integer docCount;
    private Long totalSize;
}

package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcDocs {

    public static final Integer SLICE_STATUS_TRAINED = 1;
    public static final Integer SLICE_STATUS_UNTRAINED = 0;

    private String id;
    private String knowledgeId;
    private String name;
    private String sourceType;
    private String url;
    private String fileExt;
    private String content;
    private Long fileSize;
    private Integer sliceCount;
    private Integer sliceStatus;
    private LocalDateTime createTime;
}

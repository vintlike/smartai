package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcDocsSlice {

    public static final Integer TRAIN_STATUS_TRAINED = 1;
    public static final Integer TRAIN_STATUS_UNTRAINED = 0;
    public static final String NO_VECTOR_ID = "";

    private String id;
    private String vectorId;
    private String docId;
    private String knowledgeId;
    private String name;
    private String content;
    private Integer charCount;
    private Integer trainStatus;
    private LocalDateTime createTime;
}

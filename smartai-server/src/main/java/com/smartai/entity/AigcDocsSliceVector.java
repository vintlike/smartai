package com.smartai.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AigcDocsSliceVector {

    private String vectorId;
    private String sliceId;
    private String docId;
    private String knowledgeId;
    private String embedStoreId;
    private String embedModelId;
    private Integer dimension;
    private String embedding;
    private LocalDateTime createTime;
}

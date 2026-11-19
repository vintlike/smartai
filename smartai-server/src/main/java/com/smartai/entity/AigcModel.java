package com.smartai.entity;

import lombok.Data;

@Data
public class AigcModel {

    public static final Integer STATUS_ENABLED = 1;
    public static final Integer STATUS_DISABLED = 0;
    public static final Integer SHOW_STATUS_VISIBLE = 1;
    public static final Integer SHOW_STATUS_HIDDEN = 0;

    private String id;
    private String type;
    private String model;
    private String provider;
    private String name;
    private Integer maxOutputTokens;
    private Double temperature;
    private Double topP;
    private String apiKey;
    private String baseUrl;
    private String secretKey;
    private String endpoint;
    private String azureDeploymentName;
    private String geminiProject;
    private String geminiLocation;
    private String imageSize;
    private String imageQuality;
    private String imageStyle;
    private Integer dimension;
    private Integer status;
    private Integer showStatus;
}

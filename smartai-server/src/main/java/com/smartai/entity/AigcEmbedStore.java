package com.smartai.entity;

import lombok.Data;

@Data
public class AigcEmbedStore {

    private String id;
    private String name;
    private String provider;
    private String host;
    private Integer port;
    private String username;
    private String password;
    private String databaseName;
    private String tableName;
    private Integer dimension;
}

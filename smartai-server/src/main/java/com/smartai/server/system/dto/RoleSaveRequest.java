package com.smartai.server.system.dto;

import lombok.Data;

@Data
public class RoleSaveRequest {

    private String name;
    private String code;
    private String description;
}

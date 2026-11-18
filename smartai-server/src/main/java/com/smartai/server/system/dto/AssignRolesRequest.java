package com.smartai.server.system.dto;

import java.util.List;
import lombok.Data;

@Data
public class AssignRolesRequest {

    private List<String> roleIds;
}

package com.smartai.server.system.dto;

import java.util.List;
import lombok.Data;

@Data
public class AssignMenusRequest {

    private List<String> menuIds;
}

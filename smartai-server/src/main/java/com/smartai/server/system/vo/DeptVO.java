package com.smartai.server.system.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeptVO {

    private String id;
    private String parentId;
    private String name;
    private Integer sortOrder;
    private String description;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<DeptVO> children;
}

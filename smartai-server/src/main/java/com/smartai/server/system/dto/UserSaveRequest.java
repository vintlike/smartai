package com.smartai.server.system.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;
import lombok.Data;

@Data
public class UserSaveRequest {

    private String username;
    private String password;
    private String realName;
    @JsonAlias("sex")
    private String gender;
    private String phone;
    private String email;
    private String deptId;
    private String avatar;
    private Integer isEnabled;
    private List<String> roleIds;
}

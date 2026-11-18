package com.smartai.server.system.vo;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVO {

    private String id;
    private String username;
    private String realName;
    private String gender;
    private String phone;
    private String email;
    private String deptId;
    private String deptName;
    private String avatar;
    private Integer isEnabled;
    private LocalDateTime createTime;
    private List<String> roles;
    private List<String> roleIds;
}

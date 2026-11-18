package com.smartai.server.auth.vo;

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
public class UserInfoVO {

    private String id;
    private String username;
    private String name;
    private String account;
    private String avatar;
    private String description;
    private List<String> roles;
    private String realName;
    private String sex;
    private String email;
    private String phone;
    private String deptName;
    private LocalDateTime createTime;
}

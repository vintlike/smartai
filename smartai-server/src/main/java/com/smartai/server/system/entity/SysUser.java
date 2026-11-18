package com.smartai.server.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("sys_user")
public class SysUser {

    @TableId(type = IdType.INPUT)
    private String id;
    private String username;
    private String password;
    private String realName;
    private String gender;
    private String phone;
    private String email;
    private String deptId;
    private String avatar;
    private Integer isEnabled;
    private LocalDateTime createTime;
}

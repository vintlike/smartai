package com.smartai.vo;

import lombok.Data;

@Data
public class LoginVO {

    private String token;
    private AuthUserVO user;
}

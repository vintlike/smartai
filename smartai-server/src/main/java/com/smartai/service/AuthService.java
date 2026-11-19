package com.smartai.service;

import com.smartai.auth.LoginUser;
import com.smartai.dto.ChangePasswordRequest;
import com.smartai.dto.LoginRequest;
import com.smartai.vo.AuthUserVO;
import com.smartai.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    LoginVO login(LoginRequest request, HttpServletRequest httpRequest);

    LoginUser loadLoginUser(String userId);

    AuthUserVO currentUser();

    void changePassword(ChangePasswordRequest request);
}

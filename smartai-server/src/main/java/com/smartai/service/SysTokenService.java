package com.smartai.service;

import com.smartai.entity.SysToken;

import java.util.List;

public interface SysTokenService {

    List<SysToken> list(String account);

    void delete(String id);
}

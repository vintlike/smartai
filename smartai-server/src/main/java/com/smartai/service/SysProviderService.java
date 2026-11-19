package com.smartai.service;

import com.smartai.entity.SysProvider;

import java.util.List;

public interface SysProviderService {

    SysProvider create(SysProvider provider);

    SysProvider update(SysProvider provider);

    void delete(String id);

    SysProvider getById(String id);

    List<SysProvider> list(String name, String code);
}

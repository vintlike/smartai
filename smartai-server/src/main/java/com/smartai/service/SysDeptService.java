package com.smartai.service;

import com.smartai.entity.SysDept;

import java.util.List;

public interface SysDeptService {

    SysDept create(SysDept dept);

    SysDept update(SysDept dept);

    void delete(String id);

    SysDept getById(String id);

    List<SysDept> list(String name, String parentId);
}

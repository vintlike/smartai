package com.smartai.service.impl;

import com.smartai.entity.SysDept;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysDeptMapper;
import com.smartai.service.SysDeptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SysDeptServiceImpl implements SysDeptService {

    private final SysDeptMapper sysDeptMapper;

    public SysDeptServiceImpl(SysDeptMapper sysDeptMapper) {
        this.sysDeptMapper = sysDeptMapper;
    }

    @Override
    public SysDept create(SysDept dept) {
        dept.setId(UUID.randomUUID().toString().replace("-", ""));
        if (dept.getSortOrder() == null) {
            dept.setSortOrder(0);
        }
        sysDeptMapper.insert(dept);
        return sysDeptMapper.selectById(dept.getId());
    }

    @Override
    public SysDept update(SysDept dept) {
        if (sysDeptMapper.selectById(dept.getId()) == null) {
            throw new BusinessException("部门不存在");
        }
        sysDeptMapper.updateById(dept);
        return sysDeptMapper.selectById(dept.getId());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (sysDeptMapper.selectById(id) == null) {
            throw new BusinessException("部门不存在");
        }
        sysDeptMapper.deleteByParentId(id);
        sysDeptMapper.deleteById(id);
    }

    @Override
    public SysDept getById(String id) {
        SysDept dept = sysDeptMapper.selectById(id);
        if (dept == null) {
            throw new BusinessException("部门不存在");
        }
        return dept;
    }

    @Override
    public List<SysDept> list(String name, String parentId) {
        return sysDeptMapper.selectList(name, parentId);
    }
}

package com.smartai.service.impl;

import com.smartai.entity.AnnotationProject;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AnnotationProjectMapper;
import com.smartai.service.AnnotationProjectService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AnnotationProjectServiceImpl implements AnnotationProjectService {

    public static final String STATUS_ACTIVE = "active";

    private final AnnotationProjectMapper annotationProjectMapper;

    public AnnotationProjectServiceImpl(AnnotationProjectMapper annotationProjectMapper) {
        this.annotationProjectMapper = annotationProjectMapper;
    }

    @Override
    public AnnotationProject create(AnnotationProject project) {
        String name = project.getName() == null ? "" : project.getName().trim();
        if (name.isEmpty()) {
            throw new BusinessException("项目名称不能为空");
        }
        if (annotationProjectMapper.selectByName(name) != null) {
            throw new BusinessException("项目名称已存在");
        }
        project.setName(name);
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus(STATUS_ACTIVE);
        }
        if (project.getDescription() == null) {
            project.setDescription("");
        }
        project.setId(UUID.randomUUID().toString().replace("-", ""));
        project.setCreateTime(LocalDateTime.now());
        annotationProjectMapper.insert(project);
        return annotationProjectMapper.selectById(project.getId());
    }

    @Override
    public AnnotationProject update(AnnotationProject project) {
        AnnotationProject existing = annotationProjectMapper.selectById(project.getId());
        if (existing == null) {
            throw new BusinessException("项目不存在");
        }
        if (project.getName() != null) {
            String name = project.getName().trim();
            if (!name.isEmpty() && !name.equals(existing.getName())) {
                AnnotationProject sameName = annotationProjectMapper.selectByName(name);
                if (sameName != null && !sameName.getId().equals(project.getId())) {
                    throw new BusinessException("项目名称已存在");
                }
            }
            project.setName(name.isEmpty() ? existing.getName() : name);
        }
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus(existing.getStatus());
        }
        if (project.getDescription() == null) {
            project.setDescription(existing.getDescription());
        }
        annotationProjectMapper.updateById(project);
        return annotationProjectMapper.selectById(project.getId());
    }

    @Override
    public void delete(String id) {
        if (annotationProjectMapper.selectById(id) == null) {
            throw new BusinessException("项目不存在");
        }
        annotationProjectMapper.deleteById(id);
    }

    @Override
    public AnnotationProject getById(String id) {
        AnnotationProject project = annotationProjectMapper.selectById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        return project;
    }

    @Override
    public List<AnnotationProject> list(String keyword) {
        return annotationProjectMapper.selectList(keyword);
    }
}

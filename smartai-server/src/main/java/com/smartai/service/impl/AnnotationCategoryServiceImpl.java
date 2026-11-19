package com.smartai.service.impl;

import com.smartai.dto.AnnotationCategorySortItem;
import com.smartai.entity.AnnotationCategory;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AnnotationCategoryMapper;
import com.smartai.service.AnnotationCategoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AnnotationCategoryServiceImpl implements AnnotationCategoryService {

    public static final String KEY_PATTERN = "[A-Za-z0-9_-]+";

    private static final Pattern KEY_REGEX = Pattern.compile("^" + KEY_PATTERN + "$");

    private final AnnotationCategoryMapper annotationCategoryMapper;

    public AnnotationCategoryServiceImpl(AnnotationCategoryMapper annotationCategoryMapper) {
        this.annotationCategoryMapper = annotationCategoryMapper;
    }

    @Override
    public AnnotationCategory create(AnnotationCategory category) {
        validateFields(category);
        category.setId(UUID.randomUUID().toString().replace("-", ""));
        category.setParentId(normalizeParentId(category.getParentId()));
        validateParent(category.getId(), category.getParentId());
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        category.setCreateTime(LocalDateTime.now());
        annotationCategoryMapper.insert(category);
        return annotationCategoryMapper.selectById(category.getId());
    }

    @Override
    public AnnotationCategory update(AnnotationCategory category) {
        AnnotationCategory existing = annotationCategoryMapper.selectById(category.getId());
        if (existing == null) {
            throw new BusinessException("分类不存在");
        }
        if (category.getName() != null || category.getCategoryKey() != null) {
            if (category.getName() != null && category.getName().isBlank()) {
                throw new BusinessException("分类名称不能为空");
            }
            if (category.getCategoryKey() != null) {
                if (category.getCategoryKey().isBlank()) {
                    throw new BusinessException("分类标识不能为空");
                }
                if (!KEY_REGEX.matcher(category.getCategoryKey()).matches()) {
                    throw new BusinessException("分类标识仅支持字母、数字、下划线和短横线");
                }
            }
        }
        if (category.getParentId() != null) {
            category.setParentId(normalizeParentId(category.getParentId()));
            validateParent(category.getId(), category.getParentId());
        }
        annotationCategoryMapper.updateById(category);
        return annotationCategoryMapper.selectById(category.getId());
    }

    @Override
    public void updateSort(List<AnnotationCategorySortItem> items) {
        if (items == null) {
            return;
        }
        for (AnnotationCategorySortItem item : items) {
            if (item == null || item.getId() == null || item.getId().isBlank() || item.getSortOrder() == null) {
                continue;
            }
            annotationCategoryMapper.updateSort(item.getId(), item.getSortOrder());
        }
    }

    @Override
    public void delete(String id) {
        if (annotationCategoryMapper.selectById(id) == null) {
            throw new BusinessException("分类不存在");
        }
        if (annotationCategoryMapper.countByParentId(id) > 0) {
            throw new BusinessException("请先删除其下子分类");
        }
        annotationCategoryMapper.deleteById(id);
    }

    @Override
    public AnnotationCategory getById(String id) {
        AnnotationCategory category = annotationCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        return category;
    }

    @Override
    public List<AnnotationCategory> list(String keyword) {
        return annotationCategoryMapper.selectList(keyword);
    }

    private void validateFields(AnnotationCategory category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new BusinessException("分类名称不能为空");
        }
        if (category.getCategoryKey() == null || category.getCategoryKey().isBlank()) {
            throw new BusinessException("分类标识不能为空");
        }
        if (!KEY_REGEX.matcher(category.getCategoryKey()).matches()) {
            throw new BusinessException("分类标识仅支持字母、数字、下划线和短横线");
        }
    }

    private String normalizeParentId(String parentId) {
        if (parentId == null || parentId.isBlank() || "0".equals(parentId)) {
            return null;
        }
        return parentId;
    }

    private void validateParent(String categoryId, String parentId) {
        if (parentId == null) {
            return;
        }
        if (categoryId.equals(parentId)) {
            throw new BusinessException("父级分类不能选择自身");
        }
        Set<String> visited = new HashSet<>();
        String current = parentId;
        while (current != null && !current.isBlank()) {
            if (!visited.add(current)) {
                throw new BusinessException("父级分类存在循环依赖");
            }
            if (current.equals(categoryId)) {
                throw new BusinessException("父级分类不能选择自身的子分类");
            }
            AnnotationCategory parent = annotationCategoryMapper.selectById(current);
            if (parent == null) {
                break;
            }
            current = normalizeParentId(parent.getParentId());
        }
        if (annotationCategoryMapper.selectById(parentId) == null) {
            throw new BusinessException("父级分类不存在");
        }
    }
}

package com.smartai.service;

import com.smartai.dto.AnnotationCategorySortItem;
import com.smartai.entity.AnnotationCategory;

import java.util.List;

public interface AnnotationCategoryService {

    AnnotationCategory create(AnnotationCategory category);

    AnnotationCategory update(AnnotationCategory category);

    void updateSort(List<AnnotationCategorySortItem> items);

    void delete(String id);

    AnnotationCategory getById(String id);

    List<AnnotationCategory> list(String keyword);
}

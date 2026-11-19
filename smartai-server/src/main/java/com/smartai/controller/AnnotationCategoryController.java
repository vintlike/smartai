package com.smartai.controller;

import com.smartai.common.Result;
import com.smartai.dto.AnnotationCategorySortItem;
import com.smartai.entity.AnnotationCategory;
import com.smartai.service.AnnotationCategoryService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/annotation/category")
public class AnnotationCategoryController {

    private final AnnotationCategoryService annotationCategoryService;

    public AnnotationCategoryController(AnnotationCategoryService annotationCategoryService) {
        this.annotationCategoryService = annotationCategoryService;
    }

    @PostMapping
    public Result<AnnotationCategory> create(@RequestBody AnnotationCategory category) {
        return Result.success("创建成功", annotationCategoryService.create(category));
    }

    @PutMapping
    public Result<AnnotationCategory> update(@RequestBody AnnotationCategory category) {
        return Result.success("更新成功", annotationCategoryService.update(category));
    }

    @PutMapping("/sort")
    public Result<Void> updateSort(@RequestBody List<AnnotationCategorySortItem> items) {
        annotationCategoryService.updateSort(items);
        return Result.success("排序已更新", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        annotationCategoryService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AnnotationCategory> getById(@PathVariable String id) {
        return Result.success(annotationCategoryService.getById(id));
    }

    @GetMapping
    public Result<List<AnnotationCategory>> list(@RequestParam(required = false) String keyword) {
        return Result.success(annotationCategoryService.list(keyword));
    }
}

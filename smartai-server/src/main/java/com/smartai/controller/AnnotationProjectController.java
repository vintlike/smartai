package com.smartai.controller;

import com.smartai.common.Result;
import com.smartai.entity.AnnotationProject;
import com.smartai.service.AnnotationProjectService;
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
@RequestMapping("/api/annotation/project")
public class AnnotationProjectController {

    private final AnnotationProjectService annotationProjectService;

    public AnnotationProjectController(AnnotationProjectService annotationProjectService) {
        this.annotationProjectService = annotationProjectService;
    }

    @PostMapping
    public Result<AnnotationProject> create(@RequestBody AnnotationProject project) {
        return Result.success("创建成功", annotationProjectService.create(project));
    }

    @PutMapping
    public Result<AnnotationProject> update(@RequestBody AnnotationProject project) {
        return Result.success("更新成功", annotationProjectService.update(project));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        annotationProjectService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AnnotationProject> getById(@PathVariable String id) {
        return Result.success(annotationProjectService.getById(id));
    }

    @GetMapping
    public Result<List<AnnotationProject>> list(@RequestParam(required = false) String keyword) {
        return Result.success(annotationProjectService.list(keyword));
    }
}

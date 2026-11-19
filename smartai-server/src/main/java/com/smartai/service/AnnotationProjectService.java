package com.smartai.service;

import com.smartai.entity.AnnotationProject;

import java.util.List;

public interface AnnotationProjectService {

    AnnotationProject create(AnnotationProject project);

    AnnotationProject update(AnnotationProject project);

    void delete(String id);

    AnnotationProject getById(String id);

    List<AnnotationProject> list(String keyword);
}

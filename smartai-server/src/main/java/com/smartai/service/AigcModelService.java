package com.smartai.service;

import com.smartai.entity.AigcModel;

import java.util.List;

public interface AigcModelService {

    AigcModel create(AigcModel model);

    AigcModel update(AigcModel model);

    void delete(String id);

    AigcModel getById(String id);

    List<AigcModel> list(String type, String provider, String name, Integer showStatus);

    List<AigcModel> listForChat();
}

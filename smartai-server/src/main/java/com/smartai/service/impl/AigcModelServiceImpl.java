package com.smartai.service.impl;

import com.smartai.common.Secrets;
import com.smartai.entity.AigcModel;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcModelMapper;
import com.smartai.service.AigcModelService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AigcModelServiceImpl implements AigcModelService {

    private final AigcModelMapper aigcModelMapper;

    public AigcModelServiceImpl(AigcModelMapper aigcModelMapper) {
        this.aigcModelMapper = aigcModelMapper;
    }

    @Override
    public AigcModel create(AigcModel model) {
        model.setId(UUID.randomUUID().toString().replace("-", ""));
        if (model.getStatus() == null) {
            model.setStatus(AigcModel.STATUS_ENABLED);
        }
        if (model.getShowStatus() == null) {
            model.setShowStatus(AigcModel.SHOW_STATUS_VISIBLE);
        }
        aigcModelMapper.insert(model);
        return aigcModelMapper.selectById(model.getId());
    }

    @Override
    public AigcModel update(AigcModel model) {
        AigcModel existing = aigcModelMapper.selectById(model.getId());
        if (existing == null) {
            throw new BusinessException("模型不存在");
        }
        if (Secrets.isUnchanged(model.getApiKey())) {
            model.setApiKey(null);
        }
        if (Secrets.isUnchanged(model.getSecretKey())) {
            model.setSecretKey(null);
        }
        aigcModelMapper.updateById(model);
        return aigcModelMapper.selectById(model.getId());
    }

    @Override
    public void delete(String id) {
        if (aigcModelMapper.selectById(id) == null) {
            throw new BusinessException("模型不存在");
        }
        aigcModelMapper.deleteById(id);
    }

    @Override
    public AigcModel getById(String id) {
        AigcModel model = aigcModelMapper.selectById(id);
        if (model == null) {
            throw new BusinessException("模型不存在");
        }
        return model;
    }

    @Override
    public List<AigcModel> list(String type, String provider, String name, Integer showStatus) {
        return aigcModelMapper.selectList(type, provider, name, showStatus);
    }

    @Override
    public List<AigcModel> listForChat() {
        return aigcModelMapper.selectList("CHAT", null, null, AigcModel.SHOW_STATUS_VISIBLE);
    }
}

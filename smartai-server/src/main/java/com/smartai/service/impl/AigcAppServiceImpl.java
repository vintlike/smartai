package com.smartai.service.impl;

import com.smartai.entity.AigcApp;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcAppApiMapper;
import com.smartai.mapper.AigcAppMapper;
import com.smartai.service.AigcAppService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AigcAppServiceImpl implements AigcAppService {

    private final AigcAppMapper aigcAppMapper;
    private final AigcAppApiMapper aigcAppApiMapper;

    public AigcAppServiceImpl(AigcAppMapper aigcAppMapper, AigcAppApiMapper aigcAppApiMapper) {
        this.aigcAppMapper = aigcAppMapper;
        this.aigcAppApiMapper = aigcAppApiMapper;
    }

    @Override
    public AigcApp create(AigcApp app) {
        LocalDateTime now = LocalDateTime.now();
        app.setId(UUID.randomUUID().toString().replace("-", ""));
        app.setUpdateTime(now);
        app.setCreateTime(now);
        aigcAppMapper.insert(app);
        return aigcAppMapper.selectById(app.getId());
    }

    @Override
    public AigcApp update(AigcApp app) {
        if (aigcAppMapper.selectById(app.getId()) == null) {
            throw new BusinessException("应用不存在");
        }
        app.setUpdateTime(LocalDateTime.now());
        aigcAppMapper.updateById(app);
        return aigcAppMapper.selectById(app.getId());
    }

    @Override
    public void delete(String id) {
        if (aigcAppMapper.selectById(id) == null) {
            throw new BusinessException("应用不存在");
        }
        aigcAppApiMapper.deleteByAppId(id);
        aigcAppMapper.deleteById(id);
    }

    @Override
    public AigcApp getById(String id) {
        AigcApp app = aigcAppMapper.selectById(id);
        if (app == null) {
            throw new BusinessException("应用不存在");
        }
        return app;
    }

    @Override
    public List<AigcApp> list(String name) {
        return aigcAppMapper.selectList(name);
    }
}

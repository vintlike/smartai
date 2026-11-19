package com.smartai.service.impl;

import com.smartai.entity.AigcAppApi;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.AigcAppApiMapper;
import com.smartai.service.AigcAppApiService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AigcAppApiServiceImpl implements AigcAppApiService {

    public static final String DEFAULT_CHANNEL = "API";

    private final AigcAppApiMapper aigcAppApiMapper;

    public AigcAppApiServiceImpl(AigcAppApiMapper aigcAppApiMapper) {
        this.aigcAppApiMapper = aigcAppApiMapper;
    }

    @Override
    public List<AigcAppApi> listByAppId(String appId) {
        return aigcAppApiMapper.selectByAppId(appId);
    }

    @Override
    public AigcAppApi create(AigcAppApi api) {
        if (api.getAppId() == null || api.getAppId().isBlank()) {
            throw new BusinessException("应用ID不能为空");
        }
        if (api.getChannel() == null || api.getChannel().isBlank()) {
            api.setChannel(DEFAULT_CHANNEL);
        }
        String id = UUID.randomUUID().toString().replace("-", "");
        api.setId(id);
        api.setApiKey("sk-" + id);
        api.setCreateTime(LocalDateTime.now());
        aigcAppApiMapper.insert(api);
        return aigcAppApiMapper.selectById(id);
    }

    @Override
    public void delete(String id) {
        if (aigcAppApiMapper.selectById(id) == null) {
            throw new BusinessException("秘钥不存在");
        }
        aigcAppApiMapper.deleteById(id);
    }
}

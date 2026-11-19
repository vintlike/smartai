package com.smartai.service.impl;

import com.smartai.entity.SysProvider;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysProviderMapper;
import com.smartai.service.SysProviderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SysProviderServiceImpl implements SysProviderService {

    private final SysProviderMapper sysProviderMapper;

    public SysProviderServiceImpl(SysProviderMapper sysProviderMapper) {
        this.sysProviderMapper = sysProviderMapper;
    }

    @Override
    public SysProvider create(SysProvider provider) {
        if (provider.getCode() != null && !provider.getCode().isBlank()
                && sysProviderMapper.selectByCode(provider.getCode()) != null) {
            throw new BusinessException("供应商标识已存在");
        }
        provider.setId(UUID.randomUUID().toString().replace("-", ""));
        LocalDateTime now = LocalDateTime.now();
        provider.setCreateTime(now);
        provider.setUpdateTime(now);
        sysProviderMapper.insert(provider);
        return sysProviderMapper.selectById(provider.getId());
    }

    @Override
    @Transactional
    public SysProvider update(SysProvider provider) {
        SysProvider existing = sysProviderMapper.selectById(provider.getId());
        if (existing == null) {
            throw new BusinessException("供应商不存在");
        }
        String newCode = provider.getCode();
        String oldCode = existing.getCode();
        boolean codeChanged = newCode != null && !newCode.isBlank() && !newCode.equals(oldCode);
        if (codeChanged) {
            SysProvider sameCode = sysProviderMapper.selectByCode(newCode);
            if (sameCode != null && !sameCode.getId().equals(provider.getId())) {
                throw new BusinessException("供应商标识已存在");
            }
            sysProviderMapper.updateProviderCode(oldCode, newCode);
        } else {
            provider.setCode(null);
        }
        provider.setUpdateTime(LocalDateTime.now());
        sysProviderMapper.updateById(provider);
        return sysProviderMapper.selectById(provider.getId());
    }

    @Override
    public void delete(String id) {
        SysProvider provider = sysProviderMapper.selectById(id);
        if (provider == null) {
            throw new BusinessException("供应商不存在");
        }
        if (sysProviderMapper.countByProvider(provider.getCode()) > 0) {
            throw new BusinessException("该供应商下存在模型，请先删除相关模型");
        }
        sysProviderMapper.deleteById(id);
    }

    @Override
    public SysProvider getById(String id) {
        SysProvider provider = sysProviderMapper.selectById(id);
        if (provider == null) {
            throw new BusinessException("供应商不存在");
        }
        return provider;
    }

    @Override
    public List<SysProvider> list(String name, String code) {
        return sysProviderMapper.selectList(name, code);
    }
}

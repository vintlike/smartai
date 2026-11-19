package com.smartai.service.impl;

import com.smartai.entity.SysToken;
import com.smartai.exception.BusinessException;
import com.smartai.mapper.SysTokenMapper;
import com.smartai.service.SysTokenService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SysTokenServiceImpl implements SysTokenService {

    private final SysTokenMapper sysTokenMapper;

    public SysTokenServiceImpl(SysTokenMapper sysTokenMapper) {
        this.sysTokenMapper = sysTokenMapper;
    }

    @Override
    public List<SysToken> list(String account) {
        return sysTokenMapper.selectList(account);
    }

    @Override
    public void delete(String id) {
        if (sysTokenMapper.deleteById(id) == 0) {
            throw new BusinessException("令牌不存在");
        }
    }
}

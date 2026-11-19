package com.smartai.mapper;

import com.smartai.entity.SysUser;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysUserMapper {

    SysUser selectById(String id);

    SysUser selectByUsername(String username);

    List<SysUser> selectList(@Param("username") String username,
                             @Param("realName") String realName,
                             @Param("phone") String phone,
                             @Param("deptId") String deptId,
                             @Param("isEnabled") Boolean isEnabled);

    int insert(SysUser user);

    int updateById(SysUser user);

    int updatePassword(@Param("id") String id, @Param("password") String password);

    int deleteById(String id);
}

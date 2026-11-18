package com.smartai.server.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.smartai.server.auth.model.CurrentUser;
import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.exception.BizException;
import com.smartai.server.common.util.IdUtils;
import com.smartai.server.system.dto.MenuSaveRequest;
import com.smartai.server.system.entity.SysMenu;
import com.smartai.server.system.entity.SysRoleMenu;
import com.smartai.server.system.mapper.SysMenuMapper;
import com.smartai.server.system.mapper.SysRoleMenuMapper;
import com.smartai.server.system.vo.MenuVO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysMenuService {

    private final SysMenuMapper menuMapper;
    private final SysRoleMenuMapper roleMenuMapper;

    /**
     * 当前登录用户的菜单：管理员返回全部，其余按角色授权过滤。
     * 字段命名遵循前端 SysMenu 契约，根节点的 parentId 归一化为 null。
     */
    public PageResult<MenuVO> page(PageQuery query) {
        LoginUser loginUser = CurrentUser.require();
        List<SysMenu> menus = loginUser.admin()
                ? menuMapper.selectList(Wrappers.<SysMenu>lambdaQuery()
                        .orderByAsc(SysMenu::getSortOrder)
                        .orderByAsc(SysMenu::getName))
                : menuMapper.selectByUserId(loginUser.id());
        List<MenuVO> list = menus.stream()
                .filter(menu -> matchesKeyword(menu, query.getKeyword()))
                .map(this::toVO)
                .toList();
        return PageResult.slice(list, query);
    }

    public PageResult<MenuVO> byRole(String roleId, PageQuery query) {
        List<MenuVO> list = menuMapper.selectByRoleId(roleId).stream()
                .filter(menu -> matchesKeyword(menu, query.getKeyword()))
                .map(this::toVO)
                .toList();
        return PageResult.slice(list, query);
    }

    public PageResult<MenuVO> byUser(String userId, PageQuery query) {
        List<MenuVO> list = menuMapper.selectByUserId(userId).stream()
                .filter(menu -> matchesKeyword(menu, query.getKeyword()))
                .map(this::toVO)
                .toList();
        return PageResult.slice(list, query);
    }

    public void create(MenuSaveRequest request) {
        if (!StringUtils.hasText(request.getName())) {
            throw new BizException("菜单名称不能为空");
        }
        validateParent(request.getParentId());
        SysMenu menu = new SysMenu();
        menu.setId(IdUtils.generate());
        menu.setName(request.getName().trim());
        menu.setParentId(storeParent(request.getParentId()));
        menu.setPath(request.getPath());
        menu.setPerms(request.getPerms());
        menu.setType(StringUtils.hasText(request.getType()) ? request.getType() : "menu");
        menu.setSortOrder(request.getOrderNo() == null ? 0 : request.getOrderNo());
        menu.setIcon(request.getIcon());
        menu.setComponent(request.getComponent());
        menu.setIsDisabled(request.getIsDisabled() == null ? 0 : request.getIsDisabled());
        menu.setIsExternal(request.getIsExt() == null ? 0 : request.getIsExt());
        menu.setIsKeepalive(request.getIsKeepalive() == null ? 0 : request.getIsKeepalive());
        menu.setIsVisible(request.getIsShow() == null ? 1 : request.getIsShow());
        menuMapper.insert(menu);
    }

    public void update(String id, MenuSaveRequest request) {
        require(id);
        if (request.getParentId() != null) {
            validateParent(request.getParentId());
        }
        SysMenu update = new SysMenu();
        update.setId(id);
        update.setName(request.getName());
        update.setParentId(request.getParentId() == null ? null : storeParent(request.getParentId()));
        update.setPath(request.getPath());
        update.setPerms(request.getPerms());
        update.setType(request.getType());
        update.setSortOrder(request.getOrderNo());
        update.setIcon(request.getIcon());
        update.setComponent(request.getComponent());
        update.setIsDisabled(request.getIsDisabled());
        update.setIsExternal(request.getIsExt());
        update.setIsKeepalive(request.getIsKeepalive());
        update.setIsVisible(request.getIsShow());
        menuMapper.updateById(update);
    }

    @Transactional
    public void delete(String id) {
        require(id);
        long children = menuMapper.selectCount(Wrappers.<SysMenu>lambdaQuery().eq(SysMenu::getParentId, id));
        if (children > 0) {
            throw new BizException("请先删除该菜单的子菜单");
        }
        roleMenuMapper.delete(Wrappers.<SysRoleMenu>lambdaQuery().eq(SysRoleMenu::getMenuId, id));
        menuMapper.deleteById(id);
    }

    private void validateParent(String parentId) {
        if (!StringUtils.hasText(parentId) || "0".equals(parentId)) {
            return;
        }
        if (menuMapper.selectById(parentId) == null) {
            throw new BizException("上级菜单不存在");
        }
    }

    private SysMenu require(String id) {
        SysMenu menu = menuMapper.selectById(id);
        if (menu == null) {
            throw new BizException("菜单不存在");
        }
        return menu;
    }

    private boolean matchesKeyword(SysMenu menu, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        String target = keyword.toLowerCase();
        return containsIgnoreCase(menu.getName(), target) || containsIgnoreCase(menu.getPath(), target);
    }

    private boolean containsIgnoreCase(String value, String lowerKeyword) {
        return value != null && value.toLowerCase().contains(lowerKeyword);
    }

    private MenuVO toVO(SysMenu menu) {
        return MenuVO.builder()
                .id(menu.getId())
                .name(menu.getName())
                .parentId(normalizeParent(menu.getParentId()))
                .path(menu.getPath())
                .perms(menu.getPerms())
                .type(menu.getType())
                .orderNo(menu.getSortOrder() == null ? 0 : menu.getSortOrder())
                .icon(menu.getIcon())
                .component(menu.getComponent())
                .isDisabled(menu.getIsDisabled() == null ? 0 : menu.getIsDisabled())
                .isExt(menu.getIsExternal() == null ? 0 : menu.getIsExternal())
                .isKeepalive(menu.getIsKeepalive() == null ? 0 : menu.getIsKeepalive())
                .isShow(menu.getIsVisible() == null ? 1 : menu.getIsVisible())
                .build();
    }

    private String normalizeParent(String parentId) {
        return !StringUtils.hasText(parentId) || "0".equals(parentId) ? null : parentId;
    }

    private String storeParent(String parentId) {
        return StringUtils.hasText(parentId) ? parentId : "0";
    }
}

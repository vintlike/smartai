package com.smartai.server.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.smartai.server.common.api.PageQuery;
import com.smartai.server.common.api.PageResult;
import com.smartai.server.common.exception.BizException;
import com.smartai.server.common.util.IdUtils;
import com.smartai.server.system.dto.DeptSaveRequest;
import com.smartai.server.system.entity.SysDept;
import com.smartai.server.system.entity.SysUser;
import com.smartai.server.system.mapper.SysDeptMapper;
import com.smartai.server.system.mapper.SysUserMapper;
import com.smartai.server.system.vo.DeptVO;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysDeptService {

    private final SysDeptMapper deptMapper;
    private final SysUserMapper userMapper;

    public PageResult<DeptVO> page(PageQuery query) {
        List<DeptVO> list = sortedDepts().stream()
                .filter(dept -> matchesKeyword(dept, query.getKeyword()))
                .map(dept -> toVO(dept, null))
                .toList();
        return PageResult.slice(list, query);
    }

    public List<DeptVO> tree() {
        List<SysDept> depts = sortedDepts();
        Map<String, DeptVO> nodes = new LinkedHashMap<>();
        depts.forEach(dept -> nodes.put(dept.getId(), toVO(dept, new ArrayList<>())));

        List<DeptVO> roots = new ArrayList<>();
        for (SysDept dept : depts) {
            DeptVO node = nodes.get(dept.getId());
            String parentId = normalizeParent(dept.getParentId());
            DeptVO parent = parentId == null ? null : nodes.get(parentId);
            if (parent == null) {
                roots.add(node);
            } else {
                parent.getChildren().add(node);
            }
        }
        return roots;
    }

    public void create(DeptSaveRequest request) {
        if (!StringUtils.hasText(request.getName())) {
            throw new BizException("部门名称不能为空");
        }
        validateParent(request.getParentId());
        SysDept dept = new SysDept();
        dept.setId(IdUtils.generate());
        dept.setParentId(storeParent(request.getParentId()));
        dept.setName(request.getName().trim());
        dept.setSortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder());
        dept.setDescription(request.getDescription());
        deptMapper.insert(dept);
    }

    public void update(String id, DeptSaveRequest request) {
        require(id);
        if (request.getParentId() != null) {
            if (id.equals(request.getParentId())) {
                throw new BizException("上级部门不能是自身");
            }
            validateParent(request.getParentId());
        }
        SysDept update = new SysDept();
        update.setId(id);
        update.setName(request.getName());
        update.setParentId(request.getParentId() == null ? null : storeParent(request.getParentId()));
        update.setSortOrder(request.getSortOrder());
        update.setDescription(request.getDescription());
        deptMapper.updateById(update);
    }

    @Transactional
    public void delete(String id) {
        require(id);
        long children = deptMapper.selectCount(Wrappers.<SysDept>lambdaQuery().eq(SysDept::getParentId, id));
        if (children > 0) {
            throw new BizException("请先删除该部门的子部门");
        }
        long users = userMapper.selectCount(Wrappers.<SysUser>lambdaQuery().eq(SysUser::getDeptId, id));
        if (users > 0) {
            throw new BizException("该部门下还有用户，无法删除");
        }
        deptMapper.deleteById(id);
    }

    private void validateParent(String parentId) {
        if (!StringUtils.hasText(parentId) || "0".equals(parentId)) {
            return;
        }
        if (deptMapper.selectById(parentId) == null) {
            throw new BizException("上级部门不存在");
        }
    }

    private SysDept require(String id) {
        SysDept dept = deptMapper.selectById(id);
        if (dept == null) {
            throw new BizException("部门不存在");
        }
        return dept;
    }

    private List<SysDept> sortedDepts() {
        return deptMapper.selectList(Wrappers.<SysDept>lambdaQuery()
                .orderByAsc(SysDept::getSortOrder)
                .orderByAsc(SysDept::getName));
    }

    private boolean matchesKeyword(SysDept dept, String keyword) {
        return !StringUtils.hasText(keyword)
                || (dept.getName() != null && dept.getName().toLowerCase().contains(keyword.toLowerCase()));
    }

    private DeptVO toVO(SysDept dept, List<DeptVO> children) {
        return DeptVO.builder()
                .id(dept.getId())
                .parentId(normalizeParent(dept.getParentId()))
                .name(dept.getName())
                .sortOrder(dept.getSortOrder() == null ? 0 : dept.getSortOrder())
                .description(dept.getDescription())
                .children(children)
                .build();
    }

    private String normalizeParent(String parentId) {
        return !StringUtils.hasText(parentId) || "0".equals(parentId) ? null : parentId;
    }

    private String storeParent(String parentId) {
        return StringUtils.hasText(parentId) ? parentId : "0";
    }
}

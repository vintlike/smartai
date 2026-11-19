package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.common.Secrets;
import com.smartai.entity.AigcModel;
import com.smartai.service.AigcModelService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aigc/model")
public class AigcModelController {

    private final AigcModelService aigcModelService;

    public AigcModelController(AigcModelService aigcModelService) {
        this.aigcModelService = aigcModelService;
    }

    @PostMapping
    @RequiresPermission("aigc:model:add")
    public Result<AigcModel> create(@RequestBody AigcModel model) {
        return Result.success("创建成功", mask(aigcModelService.create(model)));
    }

    @PutMapping
    @RequiresPermission("aigc:model:update")
    public Result<AigcModel> update(@RequestBody AigcModel model) {
        return Result.success("更新成功", mask(aigcModelService.update(model)));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:model:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcModelService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcModel> getById(@PathVariable String id) {
        return Result.success(mask(aigcModelService.getById(id)));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String type,
                                            @RequestParam(required = false) String provider,
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) Integer showStatus) {
        List<AigcModel> list = aigcModelService.list(type, provider, name, showStatus);
        list.forEach(AigcModelController::mask);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    private static AigcModel mask(AigcModel model) {
        if (model != null) {
            model.setApiKey(Secrets.mask(model.getApiKey()));
            model.setSecretKey(Secrets.mask(model.getSecretKey()));
        }
        return model;
    }
}

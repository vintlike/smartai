package com.smartai.controller;

import com.smartai.auth.RequiresPermission;
import com.smartai.common.Result;
import com.smartai.common.Secrets;
import com.smartai.entity.AigcEmbedStore;
import com.smartai.service.AigcEmbedStoreService;
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
@RequestMapping("/api/aigc/embed-store")
public class AigcEmbedStoreController {

    private final AigcEmbedStoreService aigcEmbedStoreService;

    public AigcEmbedStoreController(AigcEmbedStoreService aigcEmbedStoreService) {
        this.aigcEmbedStoreService = aigcEmbedStoreService;
    }

    @PostMapping
    @RequiresPermission("aigc:embed-store:add")
    public Result<AigcEmbedStore> create(@RequestBody AigcEmbedStore store) {
        return Result.success("创建成功", mask(aigcEmbedStoreService.create(store)));
    }

    @PutMapping
    @RequiresPermission("aigc:embed-store:update")
    public Result<AigcEmbedStore> update(@RequestBody AigcEmbedStore store) {
        return Result.success("更新成功", mask(aigcEmbedStoreService.update(store)));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("aigc:embed-store:delete")
    public Result<Void> delete(@PathVariable String id) {
        aigcEmbedStoreService.delete(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/{id}")
    public Result<AigcEmbedStore> getById(@PathVariable String id) {
        return Result.success(mask(aigcEmbedStoreService.getById(id)));
    }

    @GetMapping
    public Result<Map<String, Object>> list(@RequestParam(required = false) String name,
                                            @RequestParam(required = false) String provider) {
        List<AigcEmbedStore> list = aigcEmbedStoreService.list(name, provider);
        list.forEach(AigcEmbedStoreController::mask);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("list", list);
        body.put("total", list.size());
        return Result.success(body);
    }

    private static AigcEmbedStore mask(AigcEmbedStore store) {
        if (store != null) {
            store.setPassword(Secrets.mask(store.getPassword()));
        }
        return store;
    }
}

-- 004：模型启停与展示状态（历史增量脚本）
USE smartai;

ALTER TABLE aigc_model ADD COLUMN status INT NOT NULL DEFAULT 1 COMMENT '1 启用 0 禁用';
ALTER TABLE aigc_model ADD COLUMN show_status INT NOT NULL DEFAULT 1 COMMENT '1 展示 0 隐藏';

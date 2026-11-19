-- 002：菜单导航模型（path/component/is_visible 等列，历史增量脚本）
USE smartai;

ALTER TABLE sys_menu ADD COLUMN path VARCHAR(255) DEFAULT NULL COMMENT '路由路径' AFTER parent_id;
ALTER TABLE sys_menu ADD COLUMN component VARCHAR(128) DEFAULT NULL COMMENT '前端页面组件键' AFTER icon;
ALTER TABLE sys_menu ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否可见';
UPDATE sys_menu SET is_visible = 0 WHERE path LIKE '%:%';

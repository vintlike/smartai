-- 005：语义化列名（path/perms/component 等，历史增量脚本）
USE smartai;

ALTER TABLE sys_menu CHANGE COLUMN url path VARCHAR(255) DEFAULT NULL COMMENT '路由路径';
ALTER TABLE sys_menu CHANGE COLUMN permission perms VARCHAR(128) DEFAULT NULL COMMENT '权限标识';
ALTER TABLE sys_menu CHANGE COLUMN comp component VARCHAR(128) DEFAULT NULL COMMENT '前端页面组件键';

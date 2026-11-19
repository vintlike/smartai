-- 007：标注分类菜单（历史增量脚本）
USE smartai;

INSERT IGNORE INTO sys_menu (id, name, parent_id, path, perms, type, sort_order, icon, component, is_disabled, is_external, is_keepalive, is_visible) VALUES
('menu-40', '标注分类', 'menu-37', '/annotation/category', NULL, 'menu', 3, 'partition', 'annotationCategory', 0, 0, 1, 1);

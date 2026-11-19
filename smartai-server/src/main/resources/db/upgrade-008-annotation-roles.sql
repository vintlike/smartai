-- 008：标注菜单授权（历史增量脚本）
USE smartai;

INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
('role-admin', 'menu-37'),
('role-admin', 'menu-38'),
('role-admin', 'menu-39'),
('role-admin', 'menu-40'),
('role-aigc', 'menu-37'),
('role-aigc', 'menu-38'),
('role-aigc', 'menu-39'),
('role-aigc', 'menu-40');

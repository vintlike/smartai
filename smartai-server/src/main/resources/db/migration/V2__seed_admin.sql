-- 初始化可登录的后台管理员账号：admin / admin123
-- 已有数据库（如从 LangChat 迁移）中的历史用户密码为旧加密格式，需要另行重置密码

INSERT INTO `sys_role` (`id`, `name`, `code`, `description`)
SELECT '2827e950043adf67b7fe10306d3e94e4', '超级管理员', 'administrator', '超级管理员，拥有全部权限'
WHERE NOT EXISTS (SELECT 1 FROM `sys_role` WHERE `code` = 'administrator');

INSERT INTO `sys_user` (`id`, `username`, `password`, `real_name`, `gender`, `email`, `is_enabled`, `create_time`)
SELECT '9f1c2b3a4d5e6f708192a3b4c5d6e7f8', 'admin',
       '$2y$10$HkdR0h7CbQnkN2v6Uibl6.W06GgPEIOgwoS0hrtlkxjCCQmheFfBq',
       '超级管理员', '男', 'admin@smartai.com', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_user` WHERE `username` = 'admin');

INSERT INTO `sys_user_role` (`user_id`, `role_id`)
SELECT u.`id`, r.`id`
FROM `sys_user` u
JOIN `sys_role` r ON r.`code` = 'administrator'
WHERE u.`username` = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM `sys_user_role` ur WHERE ur.`user_id` = u.`id` AND ur.`role_id` = r.`id`
  );

-- 003：认证与 RBAC（历史增量脚本，最终状态已合并进 schema.sql）
USE smartai;

CREATE TABLE IF NOT EXISTS sys_role (
    id          VARCHAR(32) NOT NULL,
    name        VARCHAR(64) NOT NULL,
    code        VARCHAR(64) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sys_role_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id VARCHAR(32) NOT NULL,
    role_id VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id VARCHAR(32) NOT NULL,
    menu_id VARCHAR(32) NOT NULL,
    PRIMARY KEY (role_id, menu_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT IGNORE INTO sys_role (id, name, code, description) VALUES
('role-admin', '超级管理员', 'administrator', '拥有全部权限'),
('role-ops',   '运营',       'ops',           'AIGC 业务运营');

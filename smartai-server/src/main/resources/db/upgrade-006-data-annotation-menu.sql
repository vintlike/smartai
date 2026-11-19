-- 006：数据标注菜单与表结构（历史增量脚本，最终状态已合并进 schema.sql）
USE smartai;

CREATE TABLE IF NOT EXISTS annotation_project (
    id          VARCHAR(32)  NOT NULL,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(512) DEFAULT NULL,
    status      VARCHAR(32)  DEFAULT NULL,
    create_time DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_annotation_project_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS annotation_category (
    id           VARCHAR(32)  NOT NULL,
    parent_id    VARCHAR(32)  DEFAULT NULL,
    category_key VARCHAR(64)  NOT NULL,
    name         VARCHAR(128) NOT NULL,
    description  VARCHAR(512) DEFAULT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    create_time  DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_annotation_category_parent (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT IGNORE INTO sys_menu (id, name, parent_id, path, perms, type, sort_order, icon, component, is_disabled, is_external, is_keepalive, is_visible) VALUES
('menu-37', '数据标注', NULL,     '/annotation',          NULL, 'catalog', 4, 'folder',    NULL,                 0, 0, 0, 1),
('menu-38', '标注项目', 'menu-37', '/annotation/project',  NULL, 'menu',    1, 'fileText',  'annotationProject',  0, 0, 1, 1),
('menu-39', '标注数据', 'menu-37', '/annotation/data',     NULL, 'menu',    2, 'fileText',  'annotationData',     0, 0, 1, 1);

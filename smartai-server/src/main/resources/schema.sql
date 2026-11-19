-- SmartAI 全量初始化脚本（全新环境执行本文件即可）
-- 约定：建表统一 IF NOT EXISTS，种子数据统一 INSERT IGNORE

SET NAMES utf8mb4;

-- ========================= 系统 / 权限 =========================

CREATE TABLE IF NOT EXISTS sys_user (
    id          VARCHAR(32)  NOT NULL COMMENT '主键',
    username    VARCHAR(64)  NOT NULL COMMENT '登录名',
    password    VARCHAR(255) NOT NULL COMMENT '口令（pbkdf2 散列）',
    real_name   VARCHAR(64)  DEFAULT NULL COMMENT '姓名',
    gender      VARCHAR(8)   DEFAULT NULL COMMENT '性别',
    phone       VARCHAR(32)  DEFAULT NULL COMMENT '手机号',
    email       VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    dept_id     VARCHAR(32)  DEFAULT NULL COMMENT '部门ID',
    avatar      VARCHAR(512) DEFAULT NULL COMMENT '头像',
    is_enabled  TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否启用',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_sys_user_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户';

CREATE TABLE IF NOT EXISTS sys_role (
    id          VARCHAR(32) NOT NULL COMMENT '主键',
    name        VARCHAR(64) NOT NULL COMMENT '角色名称',
    code        VARCHAR(64) NOT NULL COMMENT '角色标识',
    description VARCHAR(255) DEFAULT NULL COMMENT '描述',
    PRIMARY KEY (id),
    UNIQUE KEY uk_sys_role_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '角色';

CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    role_id VARCHAR(32) NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户-角色';

CREATE TABLE IF NOT EXISTS sys_menu (
    id           VARCHAR(32) NOT NULL COMMENT '主键',
    name         VARCHAR(64) NOT NULL COMMENT '菜单名称',
    parent_id    VARCHAR(32) DEFAULT NULL COMMENT '上级菜单',
    path         VARCHAR(255) DEFAULT NULL COMMENT '路由路径',
    perms        VARCHAR(128) DEFAULT NULL COMMENT '权限标识',
    type         VARCHAR(16)  NOT NULL COMMENT '类型：catalog/menu/button',
    sort_order   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    icon         VARCHAR(64)  DEFAULT NULL COMMENT '图标',
    component    VARCHAR(128) DEFAULT NULL COMMENT '前端页面组件键',
    is_disabled  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否禁用',
    is_external  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否外链',
    is_keepalive TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否缓存',
    is_visible   TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否可见',
    PRIMARY KEY (id),
    KEY idx_sys_menu_parent (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '菜单';

CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id VARCHAR(32) NOT NULL COMMENT '角色ID',
    menu_id VARCHAR(32) NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (role_id, menu_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '角色-菜单';

CREATE TABLE IF NOT EXISTS sys_dept (
    id          VARCHAR(32) NOT NULL COMMENT '主键',
    parent_id   VARCHAR(32) DEFAULT NULL COMMENT '上级部门',
    name        VARCHAR(64) NOT NULL COMMENT '部门名称',
    sort_order  INT         NOT NULL DEFAULT 0 COMMENT '排序',
    description VARCHAR(255) DEFAULT NULL COMMENT '描述',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '部门';

CREATE TABLE IF NOT EXISTS sys_log (
    id             VARCHAR(32) NOT NULL COMMENT '主键',
    result_status  INT         NOT NULL DEFAULT 1 COMMENT '1 成功 2 失败',
    username       VARCHAR(64)  DEFAULT NULL COMMENT '操作人',
    operation      VARCHAR(128) DEFAULT NULL COMMENT '操作',
    url            VARCHAR(255) DEFAULT NULL COMMENT '请求地址',
    duration_ms    BIGINT       DEFAULT NULL COMMENT '耗时毫秒',
    method         VARCHAR(16)  DEFAULT NULL COMMENT '请求方法',
    request_params TEXT         DEFAULT NULL COMMENT '请求参数',
    ip             VARCHAR(64)  DEFAULT NULL COMMENT 'IP',
    user_agent     VARCHAR(512) DEFAULT NULL COMMENT 'UA',
    create_time    DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_sys_log_create_time (create_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '操作日志';

CREATE TABLE IF NOT EXISTS sys_provider (
    id          VARCHAR(32) NOT NULL COMMENT '主键',
    name        VARCHAR(64) NOT NULL COMMENT '供应商名称',
    code        VARCHAR(64) NOT NULL COMMENT '供应商标识',
    remark      VARCHAR(255) DEFAULT NULL COMMENT '备注',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    update_time DATETIME     DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_sys_provider_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '模型供应商';

CREATE TABLE IF NOT EXISTS sys_token (
    id          VARCHAR(32)  NOT NULL COMMENT '主键',
    token       VARCHAR(512) NOT NULL COMMENT '令牌',
    account     VARCHAR(64)  DEFAULT NULL COMMENT '账号',
    expire_time DATETIME     DEFAULT NULL COMMENT '过期时间',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '令牌';

-- ========================= AIGC =========================

CREATE TABLE IF NOT EXISTS aigc_model (
    id                    VARCHAR(32)  NOT NULL COMMENT '主键',
    type                  VARCHAR(32)  NOT NULL COMMENT '模型类型：CHAT/EMBEDDING/IMAGE',
    model                 VARCHAR(128) NOT NULL COMMENT '模型名称',
    provider              VARCHAR(64)  DEFAULT NULL COMMENT '供应商标识',
    name                  VARCHAR(128) DEFAULT NULL COMMENT '中文别名',
    max_output_tokens     INT          DEFAULT NULL COMMENT '最大输出 token',
    temperature           DOUBLE       DEFAULT NULL COMMENT '温度',
    top_p                 DOUBLE       DEFAULT NULL COMMENT 'top_p',
    api_key               VARCHAR(512) DEFAULT NULL COMMENT 'API Key',
    base_url              VARCHAR(255) DEFAULT NULL COMMENT '网关地址',
    secret_key            VARCHAR(512) DEFAULT NULL COMMENT 'Secret Key',
    endpoint              VARCHAR(512) DEFAULT NULL COMMENT 'endpoint',
    azure_deployment_name VARCHAR(128) DEFAULT NULL COMMENT 'Azure 部署名',
    gemini_project        VARCHAR(128) DEFAULT NULL COMMENT 'Gemini project',
    gemini_location       VARCHAR(64)  DEFAULT NULL COMMENT 'Gemini location',
    image_size            VARCHAR(32)  DEFAULT NULL COMMENT '图片尺寸',
    image_quality         VARCHAR(32)  DEFAULT NULL COMMENT '图片质量',
    image_style           VARCHAR(32)  DEFAULT NULL COMMENT '图片风格',
    dimension             INT          DEFAULT NULL COMMENT '向量维度',
    status                INT          NOT NULL DEFAULT 1 COMMENT '1 启用 0 禁用',
    show_status           INT          NOT NULL DEFAULT 1 COMMENT '1 展示 0 隐藏',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '模型';

CREATE TABLE IF NOT EXISTS aigc_app (
    id            VARCHAR(32)  NOT NULL COMMENT '主键',
    user_id       VARCHAR(32)  DEFAULT NULL COMMENT '归属用户',
    model_id      VARCHAR(32)  DEFAULT NULL COMMENT '模型ID',
    knowledge_ids VARCHAR(512) DEFAULT NULL COMMENT '知识库ID列表',
    cover         VARCHAR(512) DEFAULT NULL COMMENT '封面',
    name          VARCHAR(128) NOT NULL COMMENT '应用名称',
    prompt        TEXT         DEFAULT NULL COMMENT '提示词',
    description   VARCHAR(512) DEFAULT NULL COMMENT '描述',
    update_time   DATETIME     DEFAULT NULL COMMENT '更新时间',
    create_time   DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_app_user (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'AI 应用';

CREATE TABLE IF NOT EXISTS aigc_app_api (
    id          VARCHAR(32)  NOT NULL COMMENT '主键',
    app_id      VARCHAR(32)  NOT NULL COMMENT '应用ID',
    channel     VARCHAR(32)  NOT NULL DEFAULT 'API' COMMENT '渠道',
    api_key     VARCHAR(128) NOT NULL COMMENT '接入密钥',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_app_api_app (app_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '应用接入凭据';

CREATE TABLE IF NOT EXISTS aigc_conversation (
    id          VARCHAR(32)  NOT NULL COMMENT '主键',
    user_id     VARCHAR(32)  DEFAULT NULL COMMENT '归属用户',
    title       VARCHAR(128) DEFAULT NULL COMMENT '标题',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_conversation_user (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '会话';

CREATE TABLE IF NOT EXISTS aigc_message (
    id              VARCHAR(32) NOT NULL COMMENT '主键',
    user_id         VARCHAR(32) DEFAULT NULL COMMENT '归属用户',
    conversation_id VARCHAR(32) DEFAULT NULL COMMENT '会话ID',
    username        VARCHAR(64) DEFAULT NULL COMMENT '用户名',
    ip              VARCHAR(64) DEFAULT NULL COMMENT 'IP',
    role            VARCHAR(16) DEFAULT NULL COMMENT 'system/user/assistant',
    model           VARCHAR(128) DEFAULT NULL COMMENT '模型',
    content         LONGTEXT    DEFAULT NULL COMMENT '消息内容',
    total_tokens    INT         DEFAULT NULL COMMENT '总 token',
    prompt_tokens   INT         DEFAULT NULL COMMENT 'prompt token',
    create_time     DATETIME    DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_message_conversation (conversation_id),
    KEY idx_aigc_message_create_time (create_time),
    KEY idx_aigc_message_role (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '消息';

CREATE TABLE IF NOT EXISTS aigc_embed_store (
    id            VARCHAR(32)  NOT NULL COMMENT '主键',
    name          VARCHAR(64)  NOT NULL COMMENT '数据库别名',
    provider      VARCHAR(32)  DEFAULT NULL COMMENT '向量库类型',
    host          VARCHAR(128) DEFAULT NULL COMMENT '主机',
    port          INT          DEFAULT NULL COMMENT '端口',
    username      VARCHAR(64)  DEFAULT NULL COMMENT '用户名',
    password      VARCHAR(255) DEFAULT NULL COMMENT '密码',
    database_name VARCHAR(128) DEFAULT NULL COMMENT '数据库名',
    table_name    VARCHAR(128) DEFAULT NULL COMMENT '表名',
    dimension     INT          DEFAULT NULL COMMENT '向量维度',
    PRIMARY KEY (id),
    UNIQUE KEY uk_aigc_embed_store_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '向量库';

CREATE TABLE IF NOT EXISTS aigc_knowledge (
    id             VARCHAR(32)  NOT NULL COMMENT '主键',
    user_id        VARCHAR(32)  DEFAULT NULL COMMENT '归属用户',
    embed_store_id VARCHAR(32)  DEFAULT NULL COMMENT '向量库ID',
    embed_model_id VARCHAR(32)  DEFAULT NULL COMMENT '向量模型ID',
    name           VARCHAR(128) NOT NULL COMMENT '知识库名称',
    description    VARCHAR(512) DEFAULT NULL COMMENT '描述',
    cover          VARCHAR(512) DEFAULT NULL COMMENT '封面',
    create_time    DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_knowledge_store (embed_store_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '知识库';

CREATE TABLE IF NOT EXISTS aigc_docs (
    id           VARCHAR(32)  NOT NULL COMMENT '主键',
    knowledge_id VARCHAR(32)  NOT NULL COMMENT '知识库ID',
    name         VARCHAR(255) NOT NULL COMMENT '文档名称',
    source_type  VARCHAR(32)  DEFAULT NULL COMMENT '来源类型',
    url          VARCHAR(512) DEFAULT NULL COMMENT '来源地址',
    file_ext     VARCHAR(32)  DEFAULT NULL COMMENT '文件扩展名',
    content      LONGTEXT     DEFAULT NULL COMMENT '正文',
    file_size    BIGINT       DEFAULT NULL COMMENT '字节数',
    slice_count  INT          DEFAULT 0 COMMENT '切片数',
    slice_status INT          DEFAULT 0 COMMENT '1 已训练 0 未训练',
    create_time  DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_docs_knowledge (knowledge_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '知识库文档';

CREATE TABLE IF NOT EXISTS aigc_docs_slice (
    id           VARCHAR(32)  NOT NULL COMMENT '主键',
    vector_id    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '向量ID',
    doc_id       VARCHAR(32)  NOT NULL COMMENT '文档ID',
    knowledge_id VARCHAR(32)  NOT NULL COMMENT '知识库ID',
    name         VARCHAR(255) DEFAULT NULL COMMENT '切片名称',
    content      LONGTEXT     DEFAULT NULL COMMENT '切片内容',
    char_count   INT          DEFAULT 0 COMMENT '字符数',
    train_status INT          DEFAULT 0 COMMENT '1 已训练 0 未训练',
    create_time  DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_aigc_docs_slice_doc (doc_id),
    KEY idx_aigc_docs_slice_knowledge (knowledge_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文档切片';

CREATE TABLE IF NOT EXISTS aigc_docs_slice_vector (
    vector_id      VARCHAR(64) NOT NULL COMMENT '向量ID',
    slice_id       VARCHAR(32) NOT NULL COMMENT '切片ID',
    doc_id         VARCHAR(32) NOT NULL COMMENT '文档ID',
    knowledge_id   VARCHAR(32) NOT NULL COMMENT '知识库ID',
    embed_store_id VARCHAR(32) DEFAULT NULL COMMENT '向量库ID',
    embed_model_id VARCHAR(32) DEFAULT NULL COMMENT '向量模型ID',
    dimension      INT         DEFAULT NULL COMMENT '维度',
    embedding      LONGTEXT    DEFAULT NULL COMMENT '向量（JSON 数组）',
    create_time    DATETIME    DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (vector_id),
    KEY idx_slice_vector_doc (doc_id),
    KEY idx_slice_vector_knowledge (knowledge_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '切片向量';

-- ========================= 数据标注 =========================

CREATE TABLE IF NOT EXISTS annotation_project (
    id          VARCHAR(32)  NOT NULL COMMENT '主键',
    name        VARCHAR(128) NOT NULL COMMENT '项目名称',
    description VARCHAR(512) DEFAULT NULL COMMENT '描述',
    status      VARCHAR(32)  DEFAULT NULL COMMENT '状态',
    create_time DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_annotation_project_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '标注项目';

CREATE TABLE IF NOT EXISTS annotation_category (
    id           VARCHAR(32)  NOT NULL COMMENT '主键',
    parent_id    VARCHAR(32)  DEFAULT NULL COMMENT '上级分类',
    category_key VARCHAR(64)  NOT NULL COMMENT '分类标识',
    name         VARCHAR(128) NOT NULL COMMENT '分类名称',
    description  VARCHAR(512) DEFAULT NULL COMMENT '描述',
    sort_order   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    create_time  DATETIME     DEFAULT NULL COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_annotation_category_parent (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '标注分类';

-- ========================= 种子：权限 =========================

INSERT IGNORE INTO sys_role (id, name, code, description) VALUES
('role-admin', '超级管理员', 'administrator', '拥有全部权限'),
('role-ops',   '运营',       'ops',           'AIGC 业务运营'),
('role-aigc',  'AIGC 管理员', 'aigc-admin',   '模型与知识库维护'),
('role-kb',    '知识库管理员', 'kb-admin',     '知识库与文档维护'),
('role-audit', '审计员',     'auditor',       '查看统计数据与日志'),
('role-guest', '访客',       'guest',         '只读访客');

INSERT IGNORE INTO sys_user (id, username, password, real_name, gender, phone, email, dept_id, avatar, is_enabled, create_time) VALUES
('user-admin', 'admin', 'pbkdf2$120000$JVfVc2+ayf7CPAiYBstSBg==$Oyp6+UW93lCdY0WOV54w74RhcDFybT2L8+xvxZ3Z/iM=', '超级管理员', '男', '13800000001', 'admin@smartai.local', 'dept-hq',   NULL, 1, '2026-01-01 09:00:00'),
('user-ops',   'ops',   'pbkdf2$120000$eXovC2i9WR9FR57DINzBLA==$4QQLtVk9AjDnpXQbIjRwvCoVUTo0lJtSZJI7YkydoTs=', '运营专员',   '女', '13800000002', 'ops@smartai.local',   'dept-ops',  NULL, 1, '2026-01-01 09:05:00');

INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES
('user-admin', 'role-admin'),
('user-ops', 'role-ops');

INSERT IGNORE INTO sys_dept (id, parent_id, name, sort_order, description) VALUES
('dept-hq',   NULL,      '总部',   1, '公司总部'),
('dept-tech', 'dept-hq', '技术部', 1, '研发与技术支撑'),
('dept-ops',  'dept-hq', '运营部', 2, '平台运营');

INSERT IGNORE INTO sys_menu (id, name, parent_id, path, perms, type, sort_order, icon, component, is_disabled, is_external, is_keepalive, is_visible) VALUES
('menu-01', '主控台',        NULL,     '/dashboard',                            NULL,                   'menu',    1, 'dashboard', 'Dashboard',        0, 0, 1, 1),
('menu-02', 'AIGC应用',      NULL,     '/aigc-app',                             NULL,                   'catalog', 2, 'appstore',  NULL,               0, 0, 0, 1),
('menu-03', 'AI聊天助手',    'menu-02', '/aigc-app/chat',                        NULL,                   'menu',    1, 'comment',   'chat',             0, 0, 1, 1),
('menu-04', '发送对话',      'menu-03', NULL,                                    'chat:completions',     'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-05', 'AI应用管理',    'menu-02', '/aigc-app/manage',                      NULL,                   'menu',    2, 'appstore',  'appManage',        0, 0, 1, 1),
('menu-06', '新增应用',      'menu-05', NULL,                                    'aigc:app:add',         'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-07', '编辑应用',      'menu-05', NULL,                                    'aigc:app:update',      'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-08', '删除应用',      'menu-05', NULL,                                    'aigc:app:delete',      'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-09', '应用配置',      'menu-02', '/aigc-app/config/:appId',               NULL,                   'menu',    3, NULL,        'appConfig',        0, 0, 1, 0),
('menu-10', 'AI绘图',        'menu-02', '/aigc-app/image',                       NULL,                   'menu',    4, 'picture',   'image',            0, 0, 1, 1),
('menu-11', '思维导图',      'menu-02', '/aigc-app/mindmap',                     NULL,                   'menu',    5, 'partition', 'mindmap',          0, 0, 1, 1),
('menu-12', 'AIGC平台',      NULL,     '/aigc-platform',                        NULL,                   'catalog', 3, 'appstore',  NULL,               0, 0, 0, 1),
('menu-13', '模型管理',      'menu-12', '/aigc-platform/models',                 NULL,                   'menu',    1, 'setting',   'models',           0, 0, 1, 1),
('menu-14', '新增模型',      'menu-13', NULL,                                    'aigc:model:add',       'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-15', '编辑模型',      'menu-13', NULL,                                    'aigc:model:update',    'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-16', '删除模型',      'menu-13', NULL,                                    'aigc:model:delete',    'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-17', '模型供应商管理', 'menu-12', '/aigc-platform/providers',              NULL,                   'menu',    2, 'setting',   'providers',        0, 0, 1, 1),
('menu-18', '新增供应商',    'menu-17', NULL,                                    'aigc:provider:add',    'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-19', '编辑供应商',    'menu-17', NULL,                                    'aigc:provider:update', 'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-20', '删除供应商',    'menu-17', NULL,                                    'aigc:provider:delete', 'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-21', '向量库管理',    'menu-12', '/aigc-platform/vector',                 NULL,                   'menu',    3, 'database',  'vector',           0, 0, 1, 1),
('menu-22', '新增向量库',    'menu-21', NULL,                                    'aigc:embed-store:add',    'button', 1, NULL,     NULL,               0, 0, 0, 1),
('menu-23', '编辑向量库',    'menu-21', NULL,                                    'aigc:embed-store:update', 'button', 2, NULL,     NULL,               0, 0, 0, 1),
('menu-24', '删除向量库',    'menu-21', NULL,                                    'aigc:embed-store:delete', 'button', 3, NULL,     NULL,               0, 0, 0, 1),
('menu-25', '知识库管理',    'menu-12', '/aigc-platform/knowledge',              NULL,                   'menu',    4, 'folder',    'knowledge',        0, 0, 1, 1),
('menu-26', '新增知识库',    'menu-25', NULL,                                    'aigc:knowledge:add',      'button', 1, NULL,     NULL,               0, 0, 0, 1),
('menu-27', '编辑知识库',    'menu-25', NULL,                                    'aigc:knowledge:update',   'button', 2, NULL,     NULL,               0, 0, 0, 1),
('menu-28', '删除知识库',    'menu-25', NULL,                                    'aigc:knowledge:delete',   'button', 3, NULL,     NULL,               0, 0, 0, 1),
('menu-29', '知识库数据',    'menu-25', '/aigc-platform/knowledge/:knowledgeId', NULL,                   'menu',    1, NULL,        'knowledgeData',    0, 0, 1, 0),
('menu-30', '新增文档',      'menu-29', NULL,                                    'aigc:docs:add',        'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-31', '编辑文档',      'menu-29', NULL,                                    'aigc:docs:update',     'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-32', '删除文档',      'menu-29', NULL,                                    'aigc:docs:delete',     'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-33', '训练文档',      'menu-29', NULL,                                    'aigc:embedding:docs',  'button',  4, NULL,        NULL,               0, 0, 0, 1),
('menu-34', '对话数据管理',  'menu-12', '/aigc-platform/conversation',           NULL,                   'menu',    5, 'comment',   'conversation',     0, 0, 1, 1),
('menu-35', '删除消息',      'menu-34', NULL,                                    'aigc:message:delete',  'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-36', '账单统计',      'menu-12', '/aigc-platform/billing',                NULL,                   'menu',    6, 'creditCard','billing',          0, 0, 1, 1),
('menu-37', '数据标注',      NULL,     '/annotation',                           NULL,                   'catalog', 4, 'folder',    NULL,               0, 0, 0, 1),
('menu-38', '标注项目',      'menu-37', '/annotation/project',                   NULL,                   'menu',    1, 'fileText',  'annotationProject', 0, 0, 1, 1),
('menu-39', '标注数据',      'menu-37', '/annotation/data',                      NULL,                   'menu',    2, 'fileText',  'annotationData',   0, 0, 1, 1),
('menu-40', '标注分类',      'menu-37', '/annotation/category',                  NULL,                   'menu',    3, 'partition', 'annotationCategory',0, 0, 1, 1),
('menu-41', '权限管理',      NULL,     '/permission',                           NULL,                   'catalog', 5, 'team',      NULL,               0, 0, 0, 1),
('menu-42', '部门管理',      'menu-41', '/permission/department',                NULL,                   'menu',    1, 'team',      'department',       0, 0, 1, 1),
('menu-43', '新增部门',      'menu-42', NULL,                                    'upms:dept:add',        'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-44', '编辑部门',      'menu-42', NULL,                                    'upms:dept:update',     'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-45', '删除部门',      'menu-42', NULL,                                    'upms:dept:delete',     'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-46', '角色管理',      'menu-41', '/permission/role',                     NULL,                   'menu',    2, 'user',      'role',             0, 0, 1, 1),
('menu-47', '新增角色',      'menu-46', NULL,                                    'upms:role:add',        'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-48', '编辑角色',      'menu-46', NULL,                                    'upms:role:update',     'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-49', '删除角色',      'menu-46', NULL,                                    'upms:role:delete',     'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-50', '用户管理',      'menu-41', '/permission/user',                     NULL,                   'menu',    3, 'user',      'user',             0, 0, 1, 1),
('menu-51', '新增用户',      'menu-50', NULL,                                    'upms:user:add',        'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-52', '编辑用户',      'menu-50', NULL,                                    'upms:user:update',     'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-53', '重置密码',      'menu-50', NULL,                                    'upms:user:reset',      'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-54', '删除用户',      'menu-50', NULL,                                    'upms:user:delete',     'button',  4, NULL,        NULL,               0, 0, 0, 1),
('menu-55', '菜单管理',      'menu-41', '/permission/menu',                     NULL,                   'menu',    4, 'setting',   'menu',             0, 0, 1, 1),
('menu-56', '新增菜单',      'menu-55', NULL,                                    'upms:menu:add',        'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-57', '编辑菜单',      'menu-55', NULL,                                    'upms:menu:update',     'button',  2, NULL,        NULL,               0, 0, 0, 1),
('menu-58', '删除菜单',      'menu-55', NULL,                                    'upms:menu:delete',     'button',  3, NULL,        NULL,               0, 0, 0, 1),
('menu-59', '系统管理',      NULL,     '/system',                               NULL,                   'catalog', 6, 'setting',   NULL,               0, 0, 0, 1),
('menu-60', '平台设置',      'menu-59', '/system/config',                        NULL,                   'menu',    1, 'setting',   'systemConfig',     0, 0, 1, 1),
('menu-61', '日志管理',      'menu-59', '/system/logs',                          NULL,                   'menu',    2, 'fileText',  'logs',             0, 0, 1, 1),
('menu-62', '删除日志',      'menu-61', NULL,                                    'system:log:delete',    'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-63', '令牌管理',      'menu-59', '/system/tokens',                        NULL,                   'menu',    3, 'key',       'tokens',           0, 0, 1, 1),
('menu-64', '删除令牌',      'menu-63', NULL,                                    'system:token:delete',  'button',  1, NULL,        NULL,               0, 0, 0, 1),
('menu-65', '个人中心',      NULL,     '/profile',                              NULL,                   'menu',    7, 'user',      'profile',          0, 0, 1, 0),
('menu-66', '主题设置',      'menu-59', '/system/theme',                         NULL,                   'menu',    4, 'setting',   'themeConfig',      0, 0, 1, 0);

-- 运营角色：主控台 + AIGC 应用/平台（不含删除），无权限管理/系统管理
INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 'role-ops', id FROM sys_menu
WHERE id IN ('menu-01','menu-02','menu-03','menu-04','menu-05','menu-06','menu-07','menu-09',
             'menu-10','menu-11','menu-12','menu-13','menu-14','menu-15','menu-17','menu-18',
             'menu-19','menu-21','menu-22','menu-23','menu-25','menu-26','menu-27','menu-29',
             'menu-30','menu-31','menu-33','menu-34','menu-36','menu-65');

-- 其余演示角色授权（种子便于验收角色-菜单接口）
INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 'role-aigc', id FROM sys_menu
WHERE id IN ('menu-01','menu-02','menu-03','menu-04','menu-05','menu-06','menu-07','menu-08',
             'menu-09','menu-10','menu-11','menu-12','menu-13','menu-14','menu-15','menu-16',
             'menu-17','menu-18','menu-19','menu-20','menu-21','menu-22','menu-23','menu-24',
             'menu-25','menu-26','menu-27','menu-28','menu-29','menu-30','menu-31','menu-32',
             'menu-33','menu-34','menu-35','menu-36','menu-37','menu-38','menu-39','menu-40','menu-65');

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 'role-kb', id FROM sys_menu
WHERE id IN ('menu-01','menu-02','menu-12','menu-13','menu-21','menu-25','menu-26','menu-27',
             'menu-29','menu-30','menu-31','menu-33','menu-37','menu-40','menu-65');

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 'role-audit', id FROM sys_menu
WHERE id IN ('menu-01','menu-12','menu-34','menu-36','menu-59','menu-61','menu-65');

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
SELECT 'role-guest', id FROM sys_menu WHERE id IN ('menu-01','menu-65');

-- ========================= 种子：AIGC =========================

INSERT IGNORE INTO sys_provider (id, name, code, remark, create_time, update_time) VALUES
('provider-deepseek', '深度求索', 'deepseek', 'DeepSeek 系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
('provider-doubao',   '豆包',     'doubao',   '字节豆包系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
('provider-bluelm',   '蓝心大模型', 'bluelm',  'vivo 蓝心系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00');

INSERT IGNORE INTO aigc_model (id, type, model, provider, name, max_output_tokens, temperature, top_p, api_key, base_url, secret_key, endpoint, azure_deployment_name, gemini_project, gemini_location, image_size, image_quality, image_style, dimension, status, show_status) VALUES
('model-deepseek-v4',      'CHAT', 'DeepSeek-V4-Flash-auto', 'deepseek', 'DeepSeek V4 极速版', 4096, 0.7, 1.0, '<REDACTED>', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
('model-doubao-2-1-pro',   'CHAT', 'Doubao-Seed-2.1-pro',   'doubao',   '豆包 2.1 Pro',        4096, 0.7, 1.0, '<REDACTED>', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
('model-doubao-2-0-mini',  'CHAT', 'Doubao-Seed-2.0-mini',  'doubao',   '豆包 2.0 Mini',       4096, 0.7, 1.0, '<REDACTED>', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
('model-bluelm-35b',       'CHAT', 'BlueLM-Qwen3.5-35B-A3B', 'bluelm',  '蓝心 Qwen3.5 35B',    4096, 0.7, 1.0, '<REDACTED>', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
('model-bluelm-27b',       'CHAT', 'BlueLM-Qwen3.5-27B',    'bluelm',   '蓝心 Qwen3.5 27B',    4096, 0.7, 1.0, '<REDACTED>', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1);

INSERT IGNORE INTO aigc_embed_store (id, name, provider, host, port, username, password, database_name, table_name, dimension) VALUES
('embed-store-local', '本地向量库', 'mysql',  'localhost', 3306,  'root', 'embed-local-secret', 'smartai_vector', 'doc_slice_vector', 1024),
('embed-store-test',  '测试向量库', 'mysql',  '127.0.0.1', 3306,  'root', 'embed-test-secret',  'smartai_vector_test', 'doc_slice_vector', 1536),
('embed-store-prod',  '生产向量库', 'milvus', '10.0.0.10', 19530, 'milvus', 'embed-prod-secret', 'smartai', 'doc_slice_vector', 1536);

INSERT IGNORE INTO sys_token (id, token, account, expire_time, create_time) VALUES
('token-1', 'sk-smartai-demo-token-0001', 'admin', '2027-01-01 00:00:00', '2026-01-01 09:00:00'),
('token-2', 'sk-smartai-demo-token-0002', 'ops',   '2027-01-01 00:00:00', '2026-01-02 10:00:00');

INSERT IGNORE INTO annotation_project (id, name, description, status, create_time) VALUES
('ann-proj-1', '客服意图标注', '客服对话意图识别标注项目', 'active', '2026-01-02 10:00:00'),
('ann-proj-2', '商品分类标注', '电商商品类目标注项目',     'active', '2026-01-03 11:00:00');

INSERT IGNORE INTO annotation_category (id, parent_id, category_key, name, description, sort_order, create_time) VALUES
('ann-cate-1',  NULL,        'intent',        '意图',     '意图识别一级分类', 1, '2026-01-02 10:00:00'),
('ann-cate-2',  NULL,        'sentiment',     '情感',     '情感分析一级分类', 2, '2026-01-02 10:01:00'),
('ann-cate-3',  NULL,        'product',       '商品',     '商品分类一级分类', 3, '2026-01-02 10:02:00'),
('ann-cate-4',  'ann-cate-1', 'consult',      '咨询',     '售前咨询',         1, '2026-01-02 10:03:00'),
('ann-cate-5',  'ann-cate-1', 'complaint',    '投诉',     '客户投诉',         2, '2026-01-02 10:04:00'),
('ann-cate-6',  'ann-cate-1', 'aftersale',    '售后',     '售后服务',         3, '2026-01-02 10:05:00'),
('ann-cate-7',  'ann-cate-1', 'chitchat',     '闲聊',     '非业务闲聊',       4, '2026-01-02 10:06:00'),
('ann-cate-8',  'ann-cate-2', 'positive',     '正向',     '正向情感',         1, '2026-01-02 10:07:00'),
('ann-cate-9',  'ann-cate-2', 'negative',     '负向',     '负向情感',         2, '2026-01-02 10:08:00'),
('ann-cate-10', 'ann-cate-3', 'digital',      '数码',     '数码类商品',       1, '2026-01-02 10:09:00'),
('ann-cate-11', 'ann-cate-3', 'apparel',      '服饰',     '服饰类商品',       2, '2026-01-02 10:10:00');

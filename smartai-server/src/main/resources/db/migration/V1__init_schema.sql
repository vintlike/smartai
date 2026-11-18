-- SmartAI 基础表结构（幂等：IF NOT EXISTS，兼容已有数据库）

CREATE TABLE IF NOT EXISTS `aigc_app` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) DEFAULT NULL COMMENT '用户ID',
  `model_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '关联模型',
  `knowledge_ids` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '关联知识库',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '封面',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '名称',
  `prompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '提示词',
  `description` varchar(255) DEFAULT NULL COMMENT '应用描述',
  `update_time` datetime DEFAULT NULL COMMENT '最后保存时间',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='提示词表'
;
CREATE TABLE IF NOT EXISTS `aigc_app_api` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `app_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '应用ID',
  `channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '应用渠道',
  `api_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'Key',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_key` (`api_key`),
  KEY `idx_app_id` (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='应用'
;
CREATE TABLE IF NOT EXISTS `aigc_conversation` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户ID',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '标题',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id_create_time` (`user_id`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='对话窗口表'
;
CREATE TABLE IF NOT EXISTS `aigc_docs` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `knowledge_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '知识库ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '名称',
  `source_type` varchar(20) DEFAULT NULL COMMENT '文档来源 UPLOAD-上传文件 INPUT-手工录入',
  `url` varchar(500) DEFAULT NULL COMMENT '在线文档链接，未使用',
  `file_ext` varchar(50) DEFAULT NULL COMMENT '文件后缀，手工录入为 NULL',
  `content` text COMMENT '文档正文',
  `file_size` bigint DEFAULT NULL COMMENT '文档内容字节数',
  `slice_count` int DEFAULT NULL COMMENT '切片数量',
  `slice_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '切片训练状态 1已训练 0未训练',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_knowledge_id_create_time` (`knowledge_id`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文档表'
;
CREATE TABLE IF NOT EXISTS `aigc_docs_slice` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `vector_id` varchar(100) NOT NULL COMMENT '切片向量记录ID（aigc_docs_slice_vector.vector_id），未训练时为空串',
  `doc_id` varchar(50) NOT NULL COMMENT '文档ID',
  `knowledge_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '知识库ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '文档名称',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '切片内容',
  `char_count` int DEFAULT NULL COMMENT '切片字符数',
  `train_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '训练状态 1已生成向量 0未训练',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_knowledge_id_create_time` (`knowledge_id`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文档切片表'
;
CREATE TABLE IF NOT EXISTS `aigc_docs_slice_vector` (
  `vector_id` varchar(100) NOT NULL COMMENT '向量ID',
  `slice_id` varchar(50) NOT NULL COMMENT '切片ID',
  `doc_id` varchar(50) NOT NULL COMMENT '文档ID',
  `knowledge_id` varchar(50) NOT NULL COMMENT '知识库ID',
  `embed_store_id` varchar(50) DEFAULT NULL COMMENT '向量库配置ID',
  `embed_model_id` varchar(50) DEFAULT NULL COMMENT '向量模型ID',
  `dimension` int DEFAULT NULL COMMENT '向量维数',
  `embedding` mediumtext NOT NULL COMMENT '向量JSON数组',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`vector_id`),
  UNIQUE KEY `uk_slice_id` (`slice_id`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_knowledge_id` (`knowledge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='切片向量表'
;
CREATE TABLE IF NOT EXISTS `aigc_embed_store` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '别名',
  `provider` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '供应商',
  `host` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '地址',
  `port` int DEFAULT NULL COMMENT '端口',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '密码',
  `database_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '数据库名称',
  `table_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '表名称',
  `dimension` int DEFAULT NULL COMMENT '向量维数',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Embedding向量数据库配置表'
;
CREATE TABLE IF NOT EXISTS `aigc_knowledge` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户ID',
  `embed_store_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '向量数据库ID',
  `embed_model_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '向量模型ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '知识库名称',
  `description` varchar(255) DEFAULT NULL COMMENT '知识库描述',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '封面',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='知识库表'
;
CREATE TABLE IF NOT EXISTS `aigc_message` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户ID',
  `conversation_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '会话ID',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户名',
  `ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'IP地址',
  `role` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '角色，user和assistant',
  `model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '模型名称',
  `content` text COMMENT '消息正文',
  `total_tokens` int DEFAULT NULL COMMENT '本次调用总 token 数，回复量由 total_tokens - prompt_tokens 得出',
  `prompt_tokens` int DEFAULT NULL COMMENT '提示词 token 数',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_conversation_id_create_time` (`conversation_id`,`create_time`),
  KEY `idx_user_id_create_time` (`user_id`,`create_time`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='对话消息表'
;
CREATE TABLE IF NOT EXISTS `aigc_model` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '类型: CHAT、Embedding、Image',
  `model` varchar(100) DEFAULT NULL COMMENT '模型名称',
  `provider` varchar(100) DEFAULT NULL COMMENT '供应商',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '别名',
  `max_output_tokens` int DEFAULT NULL COMMENT '单次回复最大 token 数',
  `temperature` decimal(4,2) DEFAULT NULL COMMENT '采样温度，越大越随机，通常 0~2',
  `top_p` decimal(3,2) DEFAULT NULL COMMENT '核采样概率，通常 0~1',
  `api_key` varchar(255) DEFAULT NULL COMMENT '调用密钥，回显时脱敏',
  `base_url` varchar(255) DEFAULT NULL COMMENT '接入地址，为空走 llm.properties 的默认网关',
  `secret_key` varchar(255) DEFAULT NULL COMMENT '密钥（Azure 等非 OpenAI 协议使用）',
  `endpoint` varchar(255) DEFAULT NULL COMMENT '服务端点（Azure 等非 OpenAI 协议使用）',
  `azure_deployment_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'azure模型参数',
  `gemini_project` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'gemini模型参数',
  `gemini_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'gemini模型参数',
  `image_size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '图片大小',
  `image_quality` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '图片质量',
  `image_style` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '图片风格',
  `dimension` int DEFAULT NULL COMMENT '向量维数',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态 1启用 0禁用，禁用后模型不可被选用与调用',
  `show_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '显示状态 1显示 0隐藏，隐藏后模型不出现在调用方的选择项中',
  PRIMARY KEY (`id`),
  KEY `idx_provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='LLM模型配置表'
;
CREATE TABLE IF NOT EXISTS `aigc_oss` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户ID',
  `oss_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `original_filename` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '原始文件名称',
  `filename` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '文件存储名称',
  `url` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '文件地址',
  `base_path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '桶路径',
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '文件的绝对路径',
  `size` int DEFAULT NULL COMMENT '文件大小',
  `ext` varchar(50) DEFAULT NULL COMMENT '文件后缀',
  `content_type` varchar(100) DEFAULT NULL COMMENT '文件头',
  `platform` varchar(50) DEFAULT NULL COMMENT '平台',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='对象存储资源文件表'
;
CREATE TABLE IF NOT EXISTS `annotation_category` (
  `id` varchar(50) NOT NULL COMMENT '分类ID',
  `parent_id` varchar(50) DEFAULT NULL COMMENT '父级分类ID，NULL 表示顶级',
  `category_key` varchar(50) NOT NULL COMMENT '分类标识',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `description` varchar(255) DEFAULT NULL COMMENT '分类描述',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '同级排序，越小越靠前',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='标注分类表'
;
CREATE TABLE IF NOT EXISTS `annotation_project` (
  `id` varchar(50) NOT NULL COMMENT '项目ID',
  `name` varchar(100) NOT NULL COMMENT '项目名称',
  `description` varchar(255) DEFAULT NULL COMMENT '项目描述',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态 active启用 inactive停用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='标注项目表'
;
CREATE TABLE IF NOT EXISTS `sys_dept` (
  `id` varchar(50) NOT NULL COMMENT '部门ID',
  `parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '上级部门ID',
  `name` varchar(50) DEFAULT NULL COMMENT '部门名称',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '同级排序，越小越靠前',
  `description` varchar(255) DEFAULT NULL COMMENT '部门描述',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='部门表'
;
CREATE TABLE IF NOT EXISTS `sys_log` (
  `id` varchar(50) NOT NULL COMMENT '编号',
  `result_status` tinyint DEFAULT NULL COMMENT '操作结果 1成功 2失败',
  `username` varchar(50) DEFAULT NULL COMMENT '操作用户名',
  `operation` varchar(100) DEFAULT NULL COMMENT '操作描述',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '请求URL',
  `duration_ms` bigint DEFAULT NULL COMMENT '服务端处理耗时（毫秒）',
  `method` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '操作方法',
  `request_params` text COMMENT '请求参数',
  `ip` varchar(50) DEFAULT NULL COMMENT '客户端IP',
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户代理',
  `create_time` datetime DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='日志表'
;
CREATE TABLE IF NOT EXISTS `sys_menu` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '菜单名称',
  `parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '父级ID',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '菜单路径',
  `perms` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '权限标识',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '菜单类型',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '同级排序，越小越靠前',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '菜单图标',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '组件路径',
  `is_disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否禁用 1禁用（路由注册但不可点） 0正常',
  `is_external` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否外链 1新窗口打开 path 指向的地址',
  `is_keepalive` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否缓存 1切换页签时保留组件状态',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否在导航菜单中显示 0只保留路由（详情页等）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单表'
;
CREATE TABLE IF NOT EXISTS `sys_provider` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `name` varchar(100) NOT NULL COMMENT '供应商名称',
  `code` varchar(100) NOT NULL COMMENT '供应商标识，aigc_model.provider 关联此字段',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型供应商表'
;
CREATE TABLE IF NOT EXISTS `sys_role` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '角色别名',
  `description` varchar(255) DEFAULT NULL COMMENT '角色描述',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表'
;
CREATE TABLE IF NOT EXISTS `sys_role_menu` (
  `role_id` varchar(50) NOT NULL COMMENT '角色ID',
  `menu_id` varchar(50) NOT NULL COMMENT '菜单/按钮ID',
  PRIMARY KEY (`role_id`,`menu_id`) USING BTREE,
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色资源关联表'
;
CREATE TABLE IF NOT EXISTS `sys_token` (
  `id` varchar(50) NOT NULL COMMENT '主键',
  `token` varchar(255) NOT NULL COMMENT '令牌',
  `account` varchar(100) DEFAULT NULL COMMENT '账户',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='令牌表'
;
CREATE TABLE IF NOT EXISTS `sys_user` (
  `id` varchar(50) NOT NULL COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '密码',
  `real_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '真实姓名',
  `gender` varchar(10) DEFAULT NULL COMMENT '性别',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '手机',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '邮箱',
  `dept_id` varchar(50) DEFAULT NULL COMMENT '部门ID',
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '头像',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用 0锁定（不可登录，旧令牌失效） 1有效',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表'
;
CREATE TABLE IF NOT EXISTS `sys_user_role` (
  `user_id` varchar(50) NOT NULL COMMENT '用户ID',
  `role_id` varchar(50) NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`) USING BTREE,
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户角色关联表'
;

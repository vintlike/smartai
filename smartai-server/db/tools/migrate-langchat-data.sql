-- 将 langchat 业务库数据迁移到 smartai 库（以 smartai 表结构为准）
-- 可重复执行：仅插入 smartai 中尚不存在的主键行，不覆盖已有数据
-- 使用：mysql --default-character-set=utf8mb4 -D smartai < db/tools/migrate-langchat-data.sql
SET NAMES utf8mb4;

-- sys_dept: order_no -> sort_order, des -> description
INSERT INTO sys_dept (id, parent_id, name, sort_order, description)
SELECT l.id, l.parent_id, l.name, COALESCE(l.order_no, 0), l.des
FROM langchat.sys_dept l
WHERE NOT EXISTS (SELECT 1 FROM sys_dept s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- sys_role: des -> description
INSERT INTO sys_role (id, name, code, description)
SELECT l.id, l.name, l.code, l.des
FROM langchat.sys_role l
WHERE NOT EXISTS (SELECT 1 FROM sys_role s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- sys_user: sex -> gender, status -> is_enabled
INSERT INTO sys_user (id, username, password, real_name, gender, phone, email, dept_id, avatar, is_enabled, create_time)
SELECT l.id, l.username, l.password, l.real_name, l.sex, l.phone, l.email, l.dept_id, l.avatar,
       COALESCE(l.status, 1), l.create_time
FROM langchat.sys_user l
WHERE NOT EXISTS (SELECT 1 FROM sys_user s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- sys_menu: order_no -> sort_order, is_ext -> is_external, is_show -> is_visible
INSERT INTO sys_menu (id, name, parent_id, path, perms, type, sort_order, icon, component,
                      is_disabled, is_external, is_keepalive, is_visible)
SELECT l.id, l.name, l.parent_id, l.path, l.perms, l.type, COALESCE(l.order_no, 0), l.icon, l.component,
       COALESCE(l.is_disabled, 0), COALESCE(l.is_ext, 0), COALESCE(l.is_keepalive, 0),
       COALESCE(l.is_show, IF(l.type = 'button', 0, 1))
FROM langchat.sys_menu l
WHERE NOT EXISTS (SELECT 1 FROM sys_menu s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- sys_log: type -> result_status, time -> duration_ms, params -> request_params
INSERT INTO sys_log (id, result_status, username, operation, url, duration_ms, method,
                     request_params, ip, user_agent, create_time)
SELECT l.id, l.type, l.username, l.operation, l.url, l.time, l.method,
       l.params, l.ip, l.user_agent, l.create_time
FROM langchat.sys_log l
WHERE NOT EXISTS (SELECT 1 FROM sys_log s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT l.role_id, l.menu_id
FROM langchat.sys_role_menu l
WHERE NOT EXISTS (
    SELECT 1 FROM sys_role_menu s
    WHERE s.role_id = CONVERT(l.role_id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci
      AND s.menu_id = CONVERT(l.menu_id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

INSERT INTO sys_user_role (user_id, role_id)
SELECT l.user_id, l.role_id
FROM langchat.sys_user_role l
WHERE NOT EXISTS (
    SELECT 1 FROM sys_user_role s
    WHERE s.user_id = CONVERT(l.user_id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci
      AND s.role_id = CONVERT(l.role_id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_app: des -> description, save_time -> update_time；langchat 无 user_id，保持 NULL
INSERT INTO aigc_app (id, user_id, model_id, knowledge_ids, cover, name, prompt,
                      description, update_time, create_time)
SELECT l.id, NULL, l.model_id, l.knowledge_ids, l.cover, l.name, l.prompt,
       l.des, l.save_time, l.create_time
FROM langchat.aigc_app l
WHERE NOT EXISTS (SELECT 1 FROM aigc_app s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

INSERT INTO aigc_app_api (id, app_id, channel, api_key, create_time)
SELECT l.id, l.app_id, l.channel, l.api_key, l.create_time
FROM langchat.aigc_app_api l
WHERE NOT EXISTS (SELECT 1 FROM aigc_app_api s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_conversation: smartai 不再保留 prompt_id
INSERT INTO aigc_conversation (id, user_id, title, create_time)
SELECT l.id, l.user_id, l.title, l.create_time
FROM langchat.aigc_conversation l
WHERE NOT EXISTS (SELECT 1 FROM aigc_conversation s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_knowledge: des -> description；create_time 兼容毫秒/秒时间戳与日期字符串
INSERT INTO aigc_knowledge (id, user_id, embed_store_id, embed_model_id, name, description, cover, create_time)
SELECT l.id, l.user_id, l.embed_store_id, l.embed_model_id, l.name, l.des, l.cover,
       CASE
           WHEN l.create_time REGEXP '^[0-9]{12,}$' THEN FROM_UNIXTIME(CAST(l.create_time AS DECIMAL(20, 3)) / 1000)
           WHEN l.create_time REGEXP '^[0-9]+$' THEN FROM_UNIXTIME(CAST(l.create_time AS UNSIGNED))
           WHEN l.create_time IS NULL OR l.create_time = '' THEN NULL
           ELSE CAST(l.create_time AS DATETIME)
       END
FROM langchat.aigc_knowledge l
WHERE NOT EXISTS (SELECT 1 FROM aigc_knowledge s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_docs: type -> source_type, size -> file_size, slice_num -> slice_count, origin 无对应列
INSERT INTO aigc_docs (id, knowledge_id, name, source_type, url, file_ext, content,
                       file_size, slice_count, slice_status, create_time)
SELECT l.id, l.knowledge_id, l.name, l.type, l.url, NULL, l.content,
       l.size, l.slice_num, COALESCE(l.slice_status, 0), l.create_time
FROM langchat.aigc_docs l
WHERE NOT EXISTS (SELECT 1 FROM aigc_docs s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_docs_slice: docs_id -> doc_id, word_num -> char_count, status -> train_status
INSERT INTO aigc_docs_slice (id, vector_id, doc_id, knowledge_id, name, content, char_count, train_status, create_time)
SELECT l.id, l.vector_id, l.docs_id, l.knowledge_id, l.name, l.content, l.word_num,
       COALESCE(l.status, 0), l.create_time
FROM langchat.aigc_docs_slice l
WHERE NOT EXISTS (SELECT 1 FROM aigc_docs_slice s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

INSERT INTO aigc_embed_store (id, name, provider, host, port, username, password, database_name, table_name, dimension)
SELECT l.id, l.name, l.provider, l.host, l.port, l.username, l.password, l.database_name, l.table_name, l.dimension
FROM langchat.aigc_embed_store l
WHERE NOT EXISTS (SELECT 1 FROM aigc_embed_store s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_model: response_limit -> max_output_tokens；smartai 新增状态列默认启用/显示
INSERT INTO aigc_model (id, type, model, provider, name, max_output_tokens, temperature, top_p,
                        api_key, base_url, secret_key, endpoint, azure_deployment_name, gemini_project,
                        gemini_location, image_size, image_quality, image_style, dimension, status, show_status)
SELECT l.id, l.type, l.model, l.provider, l.name, l.response_limit, l.temperature, l.top_p,
       l.api_key, l.base_url, l.secret_key, l.endpoint, l.azure_deployment_name, l.gemini_project,
       l.gemini_location, l.image_size, l.image_quality, l.image_style, l.dimension, 1, 1
FROM langchat.aigc_model l
WHERE NOT EXISTS (SELECT 1 FROM aigc_model s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_message: message -> content, tokens -> total_tokens；smartai 不再保留 chat_id
INSERT INTO aigc_message (id, user_id, conversation_id, username, ip, role, model,
                          content, total_tokens, prompt_tokens, create_time)
SELECT l.id, l.user_id, l.conversation_id, l.username, l.ip, l.role, l.model,
       l.message, l.tokens, l.prompt_tokens, l.create_time
FROM langchat.aigc_message l
WHERE NOT EXISTS (SELECT 1 FROM aigc_message s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

-- aigc_oss: 字段完全一致
INSERT INTO aigc_oss (id, user_id, oss_id, original_filename, filename, url, base_path, path,
                      size, ext, content_type, platform, create_time)
SELECT l.id, l.user_id, l.oss_id, l.original_filename, l.filename, l.url, l.base_path, l.path,
       l.size, l.ext, l.content_type, l.platform, l.create_time
FROM langchat.aigc_oss l
WHERE NOT EXISTS (SELECT 1 FROM aigc_oss s WHERE s.id = CONVERT(l.id USING utf8mb4) COLLATE utf8mb4_0900_ai_ci);

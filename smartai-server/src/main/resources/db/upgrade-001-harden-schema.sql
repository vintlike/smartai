-- 001：收紧表约束与常用索引（历史增量脚本，最终状态已合并进 schema.sql）
USE smartai;

ALTER TABLE sys_user ADD UNIQUE KEY uk_sys_user_username (username);
ALTER TABLE sys_role ADD UNIQUE KEY uk_sys_role_code (code);
ALTER TABLE sys_provider ADD UNIQUE KEY uk_sys_provider_code (code);
ALTER TABLE aigc_embed_store ADD UNIQUE KEY uk_aigc_embed_store_name (name);
ALTER TABLE annotation_project ADD UNIQUE KEY uk_annotation_project_name (name);

ALTER TABLE aigc_message ADD KEY idx_aigc_message_conversation (conversation_id);
ALTER TABLE aigc_message ADD KEY idx_aigc_message_role (role);
ALTER TABLE aigc_message ADD KEY idx_aigc_message_create_time (create_time);
ALTER TABLE aigc_docs ADD KEY idx_aigc_docs_knowledge (knowledge_id);
ALTER TABLE aigc_docs_slice ADD KEY idx_aigc_docs_slice_doc (doc_id);
ALTER TABLE aigc_docs_slice ADD KEY idx_aigc_docs_slice_knowledge (knowledge_id);
ALTER TABLE aigc_docs_slice_vector ADD KEY idx_slice_vector_doc (doc_id);
ALTER TABLE aigc_docs_slice_vector ADD KEY idx_slice_vector_knowledge (knowledge_id);

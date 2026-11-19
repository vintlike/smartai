-- 供应商与模型初始化（内容与 schema.sql 对应片段一致）
USE smartai;

INSERT IGNORE INTO sys_provider (id, name, code, remark, create_time, update_time) VALUES
('provider-deepseek', '深度求索', 'deepseek', 'DeepSeek 系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
('provider-doubao',   '豆包',     'doubao',   '字节豆包系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
('provider-bluelm',   '蓝心大模型', 'bluelm',  'vivo 蓝心系列模型', '2026-01-01 09:00:00', '2026-01-01 09:00:00');

INSERT IGNORE INTO aigc_model (id, type, model, provider, name, max_output_tokens, temperature, top_p, api_key, status, show_status) VALUES
('model-deepseek-v4',     'CHAT', 'DeepSeek-V4-Flash-auto', 'deepseek', 'DeepSeek V4 极速版', 4096, 0.7, 1.0, '<REDACTED>', 1, 1),
('model-doubao-2-1-pro',  'CHAT', 'Doubao-Seed-2.1-pro',   'doubao',   '豆包 2.1 Pro',        4096, 0.7, 1.0, '<REDACTED>', 1, 1),
('model-doubao-2-0-mini', 'CHAT', 'Doubao-Seed-2.0-mini',  'doubao',   '豆包 2.0 Mini',       4096, 0.7, 1.0, '<REDACTED>', 1, 1),
('model-bluelm-35b',      'CHAT', 'BlueLM-Qwen3.5-35B-A3B', 'bluelm',  '蓝心 Qwen3.5 35B',    4096, 0.7, 1.0, '<REDACTED>', 1, 1),
('model-bluelm-27b',      'CHAT', 'BlueLM-Qwen3.5-27B',    'bluelm',   '蓝心 Qwen3.5 27B',    4096, 0.7, 1.0, '<REDACTED>', 1, 1);

-- 009：标注演示数据（历史增量脚本）
USE smartai;

INSERT IGNORE INTO annotation_project (id, name, description, status, create_time) VALUES
('ann-proj-1', '客服意图标注', '客服对话意图识别标注项目', 'active', '2026-01-02 10:00:00'),
('ann-proj-2', '商品分类标注', '电商商品类目标注项目',     'active', '2026-01-03 11:00:00');

INSERT IGNORE INTO annotation_category (id, parent_id, category_key, name, description, sort_order, create_time) VALUES
('ann-cate-1',  NULL,        'intent',     '意图', '意图识别一级分类', 1, '2026-01-02 10:00:00'),
('ann-cate-2',  NULL,        'sentiment',  '情感', '情感分析一级分类', 2, '2026-01-02 10:01:00'),
('ann-cate-3',  NULL,        'product',    '商品', '商品分类一级分类', 3, '2026-01-02 10:02:00'),
('ann-cate-4',  'ann-cate-1', 'consult',   '咨询', '售前咨询',         1, '2026-01-02 10:03:00'),
('ann-cate-5',  'ann-cate-1', 'complaint', '投诉', '客户投诉',         2, '2026-01-02 10:04:00'),
('ann-cate-6',  'ann-cate-1', 'aftersale', '售后', '售后服务',         3, '2026-01-02 10:05:00'),
('ann-cate-7',  'ann-cate-1', 'chitchat',  '闲聊', '非业务闲聊',       4, '2026-01-02 10:06:00'),
('ann-cate-8',  'ann-cate-2', 'positive',  '正向', '正向情感',         1, '2026-01-02 10:07:00'),
('ann-cate-9',  'ann-cate-2', 'negative',  '负向', '负向情感',         2, '2026-01-02 10:08:00'),
('ann-cate-10', 'ann-cate-3', 'digital',   '数码', '数码类商品',       1, '2026-01-02 10:09:00'),
('ann-cate-11', 'ann-cate-3', 'apparel',   '服饰', '服饰类商品',       2, '2026-01-02 10:10:00');

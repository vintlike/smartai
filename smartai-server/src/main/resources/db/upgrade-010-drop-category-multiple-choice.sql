-- 010：废弃标注分类的多选字段（历史增量脚本）
USE smartai;

ALTER TABLE annotation_category DROP COLUMN multiple_choice;

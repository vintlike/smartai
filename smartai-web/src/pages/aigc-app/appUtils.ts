import type { AppRecord, ModelRecord } from '@/api/aigc';
import type { AIApp, ModelOption } from './types';

/** 表单里选中的 emoji 图标与封面上传图一起序列化到后端 cover 字段（后端无 logo 列） */
interface CoverPayload {
  logo?: string;
  image?: string;
}

const DEFAULT_LOGO = '🤖';

export function parseCover(cover?: string): CoverPayload {
  if (!cover) return {};
  if (cover.startsWith('{')) {
    try {
      return JSON.parse(cover) as CoverPayload;
    } catch {
      return {};
    }
  }
  return { image: cover };
}

export function serializeCover(logo?: string, image?: string): string {
  const payload: CoverPayload = {};
  if (logo) payload.logo = logo;
  if (image) payload.image = image;
  return JSON.stringify(payload);
}

export function parseKnowledgeIds(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapAppRecord(record: AppRecord, models: ModelRecord[]): AIApp {
  const model = models.find((item) => item.id === record.modelId);
  const { logo } = parseCover(record.cover);
  return {
    id: record.id,
    name: record.name,
    logo: logo || DEFAULT_LOGO,
    model: record.modelId ?? '',
    modelName: model?.name ?? record.modelId ?? '-',
    description: record.description ?? '',
    prompt: record.prompt ?? '',
    knowledgeBaseIds: parseKnowledgeIds(record.knowledgeIds),
    createdAt: record.createTime ?? '',
    createdBy: record.username || '当前用户',
    cover: record.cover,
  };
}

export function toModelOptions(models: ModelRecord[]): ModelOption[] {
  return models.map((item) => ({ value: item.id, label: item.name || item.model }));
}

/** 读取本地图片为 data URL，作为封面存入后端文本字段 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('封面读取失败'));
    reader.readAsDataURL(file);
  });
}

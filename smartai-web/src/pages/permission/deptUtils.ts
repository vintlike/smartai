import type { SysDeptRecord } from '@/api/system';
import type { DeptItem } from './types';

/** 平铺部门记录按 parentId 组装成树，用于 TreeSelect / 表格 / 组织架构图 */
export function buildDeptTree(records: SysDeptRecord[]): DeptItem[] {
  const items = new Map<string, DeptItem>();
  records.forEach((record) => {
    items.set(record.id, {
      id: record.id,
      deptName: record.name,
      parentId: record.parentId ?? undefined,
      parentDept: '',
      deptDesc: record.description ?? '',
      children: [],
    });
  });
  const roots: DeptItem[] = [];
  records.forEach((record) => {
    const item = items.get(record.id);
    if (!item) return;
    const parent = record.parentId ? items.get(record.parentId) : undefined;
    if (parent) {
      item.parentDept = parent.deptName;
      parent.children = [...(parent.children ?? []), item];
    } else {
      roots.push(item);
    }
  });
  return roots;
}

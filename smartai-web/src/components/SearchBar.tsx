import { Button, Form, Input, Select, Space } from 'antd';
import type { ReactNode } from 'react';
import type { QueryParams } from '@/api/types';

export interface SearchField {
  name: string;
  label: string;
  type?: 'input' | 'select';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  width?: number;
}

export interface SearchBarProps {
  fields: SearchField[];
  onSearch: (values: QueryParams) => void;
  onReset?: () => void;
  loading?: boolean;
  /** 右侧额外操作（新增、导出等） */
  extra?: ReactNode;
}

/**
 * 列表页搜索区：字段驱动，避免每个页面重复写 Form.Item。
 * 提交后空值会被剔除，可直接透传给分页接口。
 */
export function SearchBar({ fields, onSearch, onReset, loading, extra }: SearchBarProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    const normalized: QueryParams = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) normalized[key] = trimmed;
        continue;
      }
      if (value !== undefined && value !== null) normalized[key] = value as QueryParams[string];
    }
    onSearch(normalized);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  return (
    <div className="mb-4 rounded-12px border border-solid border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-fill-alter)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Form
          form={form}
          layout="inline"
          className="flex flex-wrap gap-y-2"
          onFinish={handleFinish}
        >
          {fields.map((field) => (
            <Form.Item key={field.name} name={field.name} label={field.label} className="!mb-0">
              {field.type === 'select' ? (
                <Select
                  allowClear
                  placeholder={field.placeholder ?? `请选择${field.label}`}
                  options={field.options}
                  style={{ width: field.width ?? 160 }}
                />
              ) : (
                <Input
                  allowClear
                  placeholder={field.placeholder ?? `请输入${field.label}`}
                  style={{ width: field.width ?? 180 }}
                />
              )}
            </Form.Item>
          ))}
          <Form.Item className="!mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
        {extra ? <div>{extra}</div> : null}
      </div>
    </div>
  );
}

export default SearchBar;

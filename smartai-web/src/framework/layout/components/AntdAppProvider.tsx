import { App } from 'antd';
import type { ReactNode } from 'react';

/**
 * antd App 上下文：为 message / modal / notification 提供主题与语言环境。
 * 由 AppLayout 挂在 ThemeProvider（ConfigProvider）内部。
 */
export function AntdAppProvider({ children }: { children?: ReactNode }) {
  return <App component={false}>{children}</App>;
}

import { App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider, LayoutProvider, MenuProvider, ThemeProvider } from '@/framework';
import { AppRouter } from '@/router/AppRouter';
import { fetchMenuList } from '@/services/menu';

/**
 * 应用装配：Provider 的顺序即框架能力边界。
 * 业务层只需要提供菜单请求方法与页面组件。
 * AntdApp 提供带主题上下文的 message / modal（静态方法不继承 ConfigProvider）。
 */
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AntdApp>
            <MenuProvider request={fetchMenuList}>
              <LayoutProvider>
                <AppRouter />
              </LayoutProvider>
            </MenuProvider>
          </AntdApp>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

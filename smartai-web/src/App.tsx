import { BrowserRouter } from 'react-router-dom'
import { I18nProvider, LayoutProvider, MenuProvider, ThemeProvider } from '@/framework'
import { AppRouter } from '@/router/AppRouter'
import { fetchMenuList } from '@/services/menu'

/**
 * 应用装配：Provider 的顺序即框架能力边界。
 * 业务层只需要提供菜单请求方法与页面组件。
 */
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <MenuProvider request={fetchMenuList}>
            <LayoutProvider>
              <AppRouter />
            </LayoutProvider>
          </MenuProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

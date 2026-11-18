import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthProvider';
import router from '@/router';

/** 全局事件委托：Table 表头文字被省略时，hover 自动补 title 展示全文 */
function useTableHeadTitle() {
  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cell = target.closest('.ant-table-thead th');
      if (!(cell instanceof HTMLElement)) return;
      if (cell.scrollWidth > cell.clientWidth) {
        cell.setAttribute('title', cell.textContent ?? '');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);
}

/**
 * 应用入口：全部布局与主题能力由路由中的 <AuthLayout />（内部渲染 <AppLayout />）提供，
 * 此处只挂载鉴权与路由，无需感知任何布局细节。
 */
export default function App() {
  useTableHeadTitle();

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

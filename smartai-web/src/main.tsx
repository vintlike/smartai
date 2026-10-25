import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.less';
import App from '@/App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('缺少根节点 #root，无法挂载应用');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

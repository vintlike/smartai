import {
  LockOutlined,
  MoonOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { login } from '@/api/auth';
import { layoutConfig } from '@/config/layout.config';
import { ThemeProvider, useThemeMode } from '@/framework';
import { useAuth } from '@/hooks/useAuth';
import './Login.less';

interface LoginFormValues {
  username: string;
  password: string;
}

const features = [
  {
    icon: <SafetyCertificateOutlined />,
    title: '角色驱动的导航与权限',
    description: '登录后按 sys_user_role 过滤菜单，按钮权限实时下发',
  },
  {
    icon: <RobotOutlined />,
    title: '模型、知识库与向量库统一纳管',
    description: '供应商、Embedding 配置与文档切片在同一平台维护',
  },
];

const demoAccounts = [
  {
    role: '超级管理员',
    note: '全部菜单与按钮权限',
    username: 'admin',
    password: 'admin123',
  },
  {
    role: '运营角色',
    note: '可新增与修改，无删除权限',
    username: 'ops',
    password: 'ops123',
  },
];

/** 仅接受站内绝对路径，忽略 //evil.com 这类协议相对地址 */
function resolveTarget(redirect: string | null): string {
  const fallback = layoutConfig.homePath || '/dashboard';
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return fallback;
  return redirect;
}

function LoginView() {
  const { isDark, toggleTheme } = useThemeMode();
  const { status } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<LoginFormValues>();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const target = resolveTarget(searchParams.get('redirect'));

  if (status === 'authenticated') return <Navigate to={target} replace />;

  const handleFinish = async ({ username, password }: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      const text = error instanceof Error && error.message ? error.message : '登录失败，请稍后再试';
      message.error(text, 4);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-a" />
      <div className="login-blob login-blob-b" />
      <div className="login-blob login-blob-c" />

      <Button
        className="login-theme-switch"
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
      >
        {isDark ? '浅色' : '深色'}
      </Button>

      <div className="login-card">
        <section className="login-brand">
          <div className="login-brand-head">
            <div className="login-brand-logo">{layoutConfig.logo}</div>
            <div className="login-brand-title">{layoutConfig.title}</div>
          </div>
          <p className="login-brand-desc">
            统一接入模型、知识库与向量库的一站式 AIGC
            中台。登录后导航与操作权限均由账号所属角色实时下发。
          </p>
          <ul className="login-features">
            {features.map((feature) => (
              <li key={feature.title}>
                <span className="login-feature-icon">{feature.icon}</span>
                <span>
                  <strong>{feature.title}</strong>
                  <em>{feature.description}</em>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="login-panel">
          <h2 className="login-panel-title">登录</h2>
          <p className="login-panel-sub">请使用平台账号登录</p>

          <Form<LoginFormValues>
            form={form}
            layout="vertical"
            disabled={submitting}
            onFinish={handleFinish}
          >
            <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="请输入账号"
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Button
              className="login-submit"
              type="primary"
              size="large"
              htmlType="submit"
              block={true}
              loading={submitting}
            >
              登录
            </Button>
          </Form>

          <div className="login-accounts">
            <span className="login-accounts-label">演示账号（点击填充）</span>
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                className="login-account"
                type="button"
                disabled={submitting}
                onClick={() =>
                  form.setFieldsValue({ username: account.username, password: account.password })
                }
              >
                <span className="login-account-role">{account.role}</span>
                <span className="login-account-credential">
                  {account.username} / {account.password}
                </span>
                <span className="login-account-note">{account.note}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <ThemeProvider
      defaultMode={layoutConfig.defaultThemeMode}
      colorPrimary={layoutConfig.colorPrimary}
      storageKey={layoutConfig.storageKey}
    >
      <App component={false}>
        <LoginView />
      </App>
    </ThemeProvider>
  );
}

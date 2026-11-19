import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Radio,
  Row,
  Tabs,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';
import { updatePassword } from '@/api/auth';
import type { SysUserRecord } from '@/api/system';
import { deptApi, userApi } from '@/api/system';
import { useAuth } from '@/auth/AuthProvider';
import PageContainer from '@/components/PageContainer';

interface BasicValues {
  realName: string;
  sex?: string;
  phone?: string;
  email?: string;
}

interface PasswordValues {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

/** 个人中心：基本资料与安全设置 */
export default function Profile() {
  const { message } = App.useApp();
  const { user, refreshUser } = useAuth();
  const [basicForm] = Form.useForm<BasicValues>();
  const [passwordForm] = Form.useForm<PasswordValues>();
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<SysUserRecord | null>(null);
  const [deptName, setDeptName] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const [record, deptResult] = await Promise.all([
          userApi.getById(String(user.id)),
          deptApi.list(),
        ]);
        if (cancelled) return;
        setDetail(record);
        setDeptName(deptResult.list.find((item) => item.id === record.deptId)?.name ?? '');
        basicForm.setFieldsValue({
          realName: record.realName ?? user.name,
          sex: record.gender,
          phone: record.phone,
          email: record.email,
        });
      } catch {
        if (cancelled) return;
        basicForm.setFieldsValue({ realName: user.realName ?? user.name });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, basicForm]);

  const saveBasic = async (values: BasicValues) => {
    if (!user) return;
    setSaving(true);
    try {
      await userApi.update({
        id: user.id,
        realName: values.realName,
        gender: values.sex,
        phone: values.phone,
        email: values.email,
      });
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              realName: values.realName,
              gender: values.sex,
              phone: values.phone,
              email: values.email,
            }
          : prev,
      );
      await refreshUser();
      message.success('资料已保存');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (values: PasswordValues) => {
    setSaving(true);
    try {
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      message.success('密码已更新');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '修改失败');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.realName ?? user?.name ?? '-';

  return (
    <PageContainer
      title="个人中心"
      contentBordered={false}
      extra={
        <span className="text-12px text-[var(--ant-color-text-tertiary)]">
          维护个人资料与登录密码
        </span>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div className="flex flex-col items-center py-4">
              <Avatar
                size={72}
                src={user?.avatar}
                icon={!user?.avatar ? <UserOutlined /> : undefined}
                style={{ background: 'var(--ant-color-primary)', fontSize: 28 }}
              >
                {!user?.avatar ? displayName.slice(0, 1).toUpperCase() : undefined}
              </Avatar>
              <div className="mt-3 text-16px font-600">{displayName}</div>
              <div className="text-13px text-[var(--ant-color-text-tertiary)]">
                @{user?.username ?? '-'}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {(user?.roles ?? []).map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
              </div>
            </div>
            <Descriptions column={1} size="small" className="mt-2">
              <Descriptions.Item label="所属部门">
                {deptName || user?.deptName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {detail?.gender || user?.sex || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {detail?.createTime ?? user?.createTime ?? '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              items={[
                {
                  key: 'basic',
                  label: '基本设置',
                  children: (
                    <Form<BasicValues>
                      form={basicForm}
                      layout="vertical"
                      className="max-w-520px"
                      onFinish={saveBasic}
                    >
                      <Form.Item label="用户名">
                        <Input prefix={<UserOutlined />} value={user?.username ?? ''} disabled />
                      </Form.Item>
                      <Form.Item
                        name="realName"
                        label="真实姓名"
                        rules={[{ required: true, message: '请输入真实姓名' }]}
                      >
                        <Input placeholder="用于展示" maxLength={20} />
                      </Form.Item>
                      <Form.Item name="sex" label="性别">
                        <Radio.Group
                          options={[
                            { label: '男', value: '男' },
                            { label: '女', value: '女' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item name="phone" label="手机号">
                        <Input placeholder="选填" maxLength={11} />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[{ type: 'email', message: '邮箱格式不正确' }]}
                      >
                        <Input placeholder="选填" maxLength={60} />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" loading={saving}>
                        保存资料
                      </Button>
                    </Form>
                  ),
                },
                {
                  key: 'security',
                  label: '安全设置',
                  children: (
                    <Form<PasswordValues>
                      form={passwordForm}
                      layout="vertical"
                      className="max-w-520px"
                      onFinish={savePassword}
                    >
                      <Form.Item
                        name="oldPassword"
                        label="原密码"
                        rules={[{ required: true, message: '请输入原密码' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
                      </Form.Item>
                      <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                          { required: true, message: '请输入新密码' },
                          { min: 6, message: '至少 6 位' },
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
                      </Form.Item>
                      <Form.Item
                        name="confirm"
                        label="确认新密码"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: '请再次输入新密码' },
                          ({ getFieldValue }) => ({
                            validator: (_, value) =>
                              !value || getFieldValue('newPassword') === value
                                ? Promise.resolve()
                                : Promise.reject(new Error('两次输入不一致')),
                          }),
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" loading={saving}>
                        修改密码
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

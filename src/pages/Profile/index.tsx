import { useState } from 'react';
import { Button, Modal, Form, Input, message, Space, Card, Descriptions } from 'antd';
import type { FormProps } from 'antd';
import { useMutation} from '@tanstack/react-query';
import { axiosClient } from '../../library/axiosClient';
import { globalSetting } from '../../constants/configs';
import { TypeStaff } from '../../types/type';
import useAuth from '../../hooks/useAuth';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form] = Form.useForm();

  // Mutation để update profile
  const updateProfile = useMutation({
    mutationFn: async (values: TypeStaff) => {
      const { _id, ...updateData } = values;
      const res = await axiosClient.put(`${globalSetting.URL_API}/staffs/${_id}`, updateData);
      return res.data.data;
    },
    onSuccess: (data) => {
      // Cập nhật lại user trong zustand store
      setUser(data);
      message.success('Cập nhật tài khoản thành công!');
      setIsModalOpen(false);
      setShowPasswordForm(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Cập nhật tài khoản thất bại!');
    }
  });

  const showModal = () => {
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setShowPasswordForm(false);
    form.resetFields();
  };

  const onFinish: FormProps<TypeStaff>['onFinish'] = (values) => {
    updateProfile.mutate(values);
  };

  return (
    <div style={{ padding: '24px' }}>
       <Card 
        title="Thông tin cá nhân" 
        bordered={false}
        extra={
          <Button 
            type="primary" 
            onClick={showModal}
            className='common_button btn_add'
          >
            Cập nhật tài khoản
          </Button>
        }
      >
      <Descriptions 
          bordered 
          column={1}
          labelStyle={{ 
            width: '200px',
            fontWeight: 'bold',
            backgroundColor: '#fafafa'
          }}
        >
          <Descriptions.Item label="Họ và Tên">
            {user?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {user?.phone}
          </Descriptions.Item>
        </Descriptions>

        <Modal
          title="Cập nhật thông tin"
          open={isModalOpen}
          onOk={() => form.submit()}
          onCancel={handleCancel}
          okText="Cập nhật"
          cancelText="Huỷ"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item name="_id" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="Họ và Tên"
              name="fullName"
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên!' },
                { min: 5, message: 'Tối thiểu 5 ký tự!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="role" hidden>
              <Input />
            </Form.Item>

            <Space>
              <Button
                type="link"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Huỷ đổi mật khẩu' : 'Đổi mật khẩu'}
              </Button>
            </Space>

            {showPasswordForm && (
              <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự!' }
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Profile;
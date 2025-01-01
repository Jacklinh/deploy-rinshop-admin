import { useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input} from 'antd';
import {type FormProps } from 'antd';
import { useNavigate } from "react-router-dom";

import useAuth from '../../hooks/useAuth';
// import images
import styles from './LoginAPI.module.css'
import '../../App.css'
type FieldType = {
	email: string;
	password: string;
};
const LoginAPI = () => {
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	//Neu da login roi, thi tra lại dashboard
	useEffect(() => {
		if(isAuthenticated){
			navigate("/")
		}
	},[navigate,isAuthenticated]);
	const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        //login api
        const result = await login(values.email, values.password);
        //Chuyen trang neu login thanh cong
        if (result && result.isAuthenticated) {
        navigate("/");
        }
    };
	const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };
	return (
		<div className={styles.sec_login}>
            <div className={styles.box_login}>
                <p className={styles.login_heading}>RinKart</p>
                <p className={styles.login_desc}><i>Đăng nhập vào dashboard</i></p>
                <Form
                    name="form_login_api"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    >
                    <Form.Item
                        label="Email"
                        name="email"
                        
                        rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="email role viewer" defaultValue="an.nguyen@example.com" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} type="password" defaultValue="password123" placeholder="password" />
                    </Form.Item>
                    <Form.Item shouldUpdate>
                        {() => (
                            <Button 
                                block type="primary"
                                htmlType="submit"
                            >
                                Đăng nhập
                            </Button>
                        )}
                        
                    </Form.Item>
                    <Form.Item
                        label="Note"
                        extra="Với quyền viewer chỉ cho phép xem. còn user cho phép thêm sửa"
                    >
                        
                    </Form.Item>
                </Form>
            </div>
           
        </div>
	)
}

export default LoginAPI
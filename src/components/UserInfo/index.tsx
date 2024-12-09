import { Link } from 'react-router-dom';
import { Popover, Space, Avatar, Button  } from 'antd';
import { UserOutlined,LogoutOutlined } from '@ant-design/icons';
import useAuth from '../../hooks/useAuth'; 
import styles from "./UserInfo.module.css"
const UserInfo = () => {
    const { user, logout } = useAuth();
    const content = (
        <div className={styles.box_open_userinfo}>
            <div className={styles.user_info_item}>
                <p className={styles.user_avatar}>
                    <Avatar>
                        {user?.role}     
                    </Avatar>
                </p>
                <p className={styles.user_info}>
                    <span className={styles.user_name}>{user?.fullName}</span>
                    <span className={styles.user_email}>{user?.email}</span>
                </p>
            </div>
            <Button className={styles.user_profile}><UserOutlined /><Link to={"/profile"}>Quản lý tài khoản</Link></Button>
            <Button className={styles.user_logout} onClick={logout}><LogoutOutlined /> Đăng xuất</Button>
        </div>
    );
    return (
        <>
            {
                user ? (
                    <Popover content={content} title="" trigger="click">
                        <div role="button" tabIndex={0}  className={styles.user_info_item}>
                            <p className={styles.user_avatar}>
                                <Avatar>
                                    {user.role}     
                                </Avatar>
                            </p>
                            <p className={styles.user_info}>
                                <span className={styles.user_name}>{user.fullName}</span>
                            </p>
                        </div>
                    </Popover>
                ): (
                    <Space wrap size={16}>
                        <Link to={"/login"}>
                            Đăng nhập
                        </Link>
                    </Space>
                )
            }
            
        </>
    )
}

export default UserInfo
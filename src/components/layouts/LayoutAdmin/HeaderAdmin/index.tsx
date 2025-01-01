import { Layout } from 'antd';
import styles from './HeaderAdmin.module.css'
import UserInfo from '../../../UserInfo';
import { Link } from 'react-router-dom';
import { TbHomeShare } from "react-icons/tb";
const HeaderAdmin = () => {
    const { Header } = Layout;
    return (
        <>
        <Header className={styles.sec_header} >
            <Link 
                to="https://deploy-rinshop-client-nextjs.vercel.app/" 
                target='_blank' 
                className="common_button btn_add btn_link" 
            >
                <TbHomeShare className="mr-2" />
                Trang đặt hàng
            </Link>
            <UserInfo />
        </Header>
        </>
    )
}

export default HeaderAdmin
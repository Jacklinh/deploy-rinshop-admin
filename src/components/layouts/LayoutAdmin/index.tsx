import { useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  AppstoreOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { TbUsersGroup,TbCategory } from "react-icons/tb"
import type { MenuProps } from 'antd';
import { Layout, Menu} from 'antd';
import HeaderAdmin from './HeaderAdmin';
import Logo from '../../Logo';
const { Content, Footer, Sider } = Layout;
const items: MenuProps['items'] = [
   {    
        label: "MAIN",
        type: "group",
        children: [
            {
                key: "",// router bên app.tsx
                icon: <AppstoreOutlined />,
                label: "Dashboard"
            }
          ],
       
   },
   {    
    label: "QUẢN LÝ SẢN PHẨM",
    type: "group",
    children: [
        {
            key: "products",
            icon: <ShopOutlined />,
            label: "SẢN PHẨM"
        },
        {
            key: "categories",
            icon: <TbCategory />,
            label: "DANH MỤC"
        }
      ],
   
    },
    {    
        label: "QUẢN LÝ NGƯỜI DÙNG",
        type: "group",
        children: [
            {
                key: "staffs",
                icon: <TbUsersGroup />,
                label: "NHÂN VIÊN"
            },
            {
                key: "customers",
                icon: <TbUsersGroup />,
                label: "KHÁCH HÀNG"
            }
        ],
    },
    {    
        label: "QUẢN LÝ ĐƠN HÀNH",
        type: "group",
        children: [
            {
                key: "orders",
                icon: <TbUsersGroup />,
                label: "ĐƠN HÀNG"
            }
        ],
    },
    {    
        label: "QUẢN LÝ TRANG CHỦ",
        type: "group",
        children: [
            {
                key: "carousel",
                icon: <TbUsersGroup />,
                label: "Carousel"
            }
        ],
    }
];
const LayoutAdmin = () => {
    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();

    //check login
    useEffect(() => {
        if (!isAuthenticated) {
        navigate("/login");
        }
    }, [navigate, isAuthenticated]);
    return (
        <>
            <Layout style={{ minHeight: "100vh" }} className='page-body-wrapper'>
                <Sider className='sidebar-wrapper'>
                    <Logo />
                    <Menu 
                        mode="inline" 
                        className='sidebar-menu'
                        items={items} 
                        onClick={({ key }) => {
                        navigate("/" + key.split("-").join("/"));
                    }} 
                    />
                </Sider>
                <Layout className='page-body'>
                    <HeaderAdmin />
                    <Content className='content-wrapper'>
                        <Outlet />
                    </Content>
                    <Footer className='sec_footer'>
                        Rin vegetables - fruits ©{new Date().getFullYear()} Created by Le Van Linh
                    </Footer>
                </Layout>
            </Layout>
        </>
    )
}

export default LayoutAdmin
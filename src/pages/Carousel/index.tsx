import { useState } from 'react';
import { Table, Pagination, Button, Space, message, Popconfirm, Modal, Form, Image, Upload, Switch } from 'antd';
import type { TableProps, FormProps, UploadFile} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { EnumRole } from '../../types/type';
import useAuth from '../../hooks/useAuth';
const Carousel = () => {
    // Khai báo type
    interface carouselDataType {
        _id: string,
        images: UploadFile[],
        file?: UploadFile,
        active?: boolean
    }

    // Pagination
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const limit = 5;
    const page_str = params.get('page');
    const page = page_str ? parseInt(page_str) : 1;

    //============== Get all carousels ============= //
    const fetchCarousel = async () => {
        let url = `${globalSetting.URL_API}/carousel?`;
        url += `page=${page}&limit=${limit}`;
        const res = await axiosClient.get(url);
        return res.data.data;
    }
    const getCarousel = useQuery({
        queryKey: ['carousel', page],
        queryFn: fetchCarousel
    });

    //============== Delete carousel ============= //
    const fetchDeleteCarousel = async (id: string) => {
        const url = `${globalSetting.URL_API}/carousel/${id}`;
        const res = await axiosClient.delete(url);
        return res.data.data;
    }
    const queryClient = useQueryClient();
    const deleteCarousel = useMutation({
        mutationFn: fetchDeleteCarousel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carousel', page] });
            message.success('Xoá thành công!');
        },
        onError: () => {
            message.error('Xoá lỗi!');
        },
    });

    //============== Add carousel ============= //
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [formAdd] = Form.useForm();
    const fetchCreateCarousel = async (payload: FormData) => {
        const url = `${globalSetting.URL_API}/carousel`;
        const res = await axiosClient.post(url, payload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.data;
    }
    const createMutationCarousel = useMutation({
        mutationFn: fetchCreateCarousel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carousel', page] });
            message.success('Thêm thành công!');
            setIsModalAddOpen(false);
            formAdd.resetFields();
        },
        onError: () => {
            message.error('Thêm lỗi!');
        }
    });

    const showModalAdd = () => {
        setIsModalAddOpen(true);
    }
    const handleCancelAdd = () => {
        setIsModalAddOpen(false);
    }
   // Trong hàm onFinishAdd
const onFinishAdd: FormProps<carouselDataType>['onFinish'] = (values) => {
    const formData = new FormData();

    // Kiểm tra xem values.images có phải là mảng không
    if (Array.isArray(values.images)) {
        values.images.forEach((file) => {
            if (file.originFileObj) {
                formData.append('images', file.originFileObj); // Sử dụng originFileObj để lấy tệp gốc
            } else {
                console.error('originFileObj không hợp lệ:', file); // Log lỗi nếu không có originFileObj
            }
        });
    } else {
        console.error('values.images không phải là mảng hoặc không hợp lệ:', values.images);
    }

    createMutationCarousel.mutate(formData);
};
    const onFinishFailedAdd: FormProps<carouselDataType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }
    const handleOkAdd = () => {
        formAdd.submit();
    }


    // Phân quyền, lấy user từ hook useAuth
    const { user } = useAuth();

    // Khai báo columns
    const carouselColumns: TableProps<carouselDataType>["columns"] = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images: string[]) => {
                return (
                    <div>
                        {images.map((image, index) => (
                            <Image
                                key={index}
                                width={100}
                                src={`${globalSetting.UPLOAD_DIRECTORY}${image}`}
                                alt=""
                            />
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Trạng Thái Hoạt Động',
            key: 'active',
            dataIndex: 'active',
            render: (active: boolean) => (
                <Switch size="small" checked={active} />
            ),
        }
    ];

    if (user?.role.includes(EnumRole.ADMIN) || user?.role.includes(EnumRole.USER)) {
        carouselColumns.push({
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {user?.role.includes(EnumRole.ADMIN) && (
                        <Popconfirm
                            title="Xoá hình ảnh"
                            description="Bạn có muốn xoá hình ảnh này phải không?"
                            onConfirm={() => {
                                deleteCarousel.mutate(record._id);
                            }}
                            okText="Xoá"
                            cancelText="Không xoá"
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<AiOutlineDelete />}
                                danger
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        });
    }

    // Render nút Add Carousel theo role
    const renderAddButton = () => {
        if (user?.role.includes(EnumRole.ADMIN) || user?.role.includes(EnumRole.USER)) {
            return (
                <Button type="primary" icon={<AiOutlinePlus />} onClick={showModalAdd} className='common_button btn_add'>Thêm Carousel</Button>
            );
        }
        return null;
    };

    return (
        <>
            <div className="box_heading">
                <h2>CAROUSEL</h2>
                {renderAddButton()}
            </div>
            <div className="data_table">
                <Table
                    columns={carouselColumns}
                    dataSource={getCarousel?.data?.carousel_list || []}
                    rowKey={(record) => record._id}
                    pagination={false}
                />
                <Pagination
                    className='pagination_page'
                    defaultCurrent={1}
                    current={page}
                    align="center"
                    pageSize={getCarousel?.data?.pagination.limit || 5}
                    total={getCarousel?.data?.pagination.totalRecords || 0}
                    onChange={(p) => {
                        navigate(`/carousel?page=${p}`);
                    }}
                />
            </div>


            {/* Modal Add */}
            <Modal
                title="THÊM CAROUSEL"
                open={isModalAddOpen}
                onOk={handleOkAdd}
                onCancel={handleCancelAdd}
                className='box_modal'
                okText="Thêm mới"
                cancelText="Huỷ"
            >
                <Form
                    name="formAddCarousel"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    onFinish={onFinishAdd}
                    onFinishFailed={onFinishFailedAdd}
                    autoComplete="off"
                    form={formAdd}
                >
                    <Form.Item name="images" label="Hình ảnh">
                        <Upload
                            multiple
                            beforeUpload={() => false}
                            onChange={({ fileList }) => {
                                formAdd.setFieldsValue({ images: fileList }); // Lưu danh sách tệp vào form
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Tải hình ảnh lên</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default Carousel;
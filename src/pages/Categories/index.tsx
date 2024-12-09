import { useState } from 'react';
import {Table,Pagination,Input,Button,Space,message, Popconfirm, Modal, Form, Image, Upload } from 'antd'
import type { TableProps, FormProps, UploadProps, UploadFile, GetProp} from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useNavigate,useSearchParams  } from 'react-router-dom';
import { AiOutlinePlus,AiOutlineEdit,AiOutlineDelete } from "react-icons/ai";
import { TypeCategory,EnumRole } from '../../types/type';
import useAuth from '../../hooks/useAuth';
import noImage from '../../assets/noImage.jpg'
const { TextArea } = Input;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const Categories = () => {
    // khai báo type
    interface categoryDataType {
        _id: string,
        category_name: string,
        description: string,
        slug: string,
        banner: string,
        file?: UploadFile
    }
    // pagination
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const limit = 4;
    const page_str = params.get('page');
    const page = page_str ? parseInt(page_str) : 1;
    
    // search keyword
	const keyword_str = params.get('keyword');
	const keyword = keyword_str ? keyword_str : null;
    //============== get all category ============= //
    const fetchCategory = async() => {
        let url= `${globalSetting.URL_API}/categories?`;
        if (keyword) {
			url += `keyword=${keyword}&`;
		}
        url += `page=${page}&limit=${limit}`;
        const res = await axiosClient.get(url);
        return res.data.data;
    }
    const getCategory = useQuery({
        queryKey: ['categories',page,keyword],
        queryFn: fetchCategory
    })
    //============== delete find id ============= //
    const fetchDeleteCategory = async (id: string) => {
        const url = `${globalSetting.URL_API}/categories/${id}`;
        const res = await axiosClient.delete(url);
        return res.data.data;
    }
    const queryClient = useQueryClient();
    const deleteCategory = useMutation({ // sử dụng hook useMutation để biến đổi dữ liệu như thêm , sửa , xoá dữ liệu
        mutationFn: fetchDeleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ // làm mới dữ liệu
                queryKey: ['categories',page]
            })
            message.success('Xoá thành công!');
        },
        onError: () => {
            message.error('Xoá lỗi!');
        },
    })
    //============== add category ============= //
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [formAdd] = Form.useForm();
    const fetchCreateCategory = async (payload: FormData) => {
        const url = `${globalSetting.URL_API}/categories`;
        const res = await axiosClient.post(url,payload,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.data;
    }
    //============== add  banner ============= //
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const propsUploadAdd: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
		setFileList([file]);  // Chỉ chọn một file, nếu cần nhiều file thì sử dụng `setFileList([...fileList, file])`
		return false;  // Tắt upload tự động
		},
		fileList,
	};
    //============== end add banner ============= //
    const createMutationCategory = useMutation({
        mutationFn: fetchCreateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories',page]
            })
            message.success('Thêm thành công!');
            setIsModalAddOpen(false)
            formAdd.resetFields();
        },
        onError: () => {
            message.error('Thêm lỗi!')
        }
    })
    const showModalAdd = () => {
        setIsModalAddOpen(true);
    }
    const handleCancelAdd = () => {
        setIsModalAddOpen(false);
    }
    const onFinishAdd: FormProps<categoryDataType>['onFinish'] = (values: categoryDataType) => {
        // xử lý khi upload file
		if (fileList.length === 0) {
            message.error('Vui lòng chọn file trước khi thêm product.');
            return;
        }
		const formData = new FormData();
		// Lặp qua tất cả các trường trong values và thêm chúng vào formData
		Object.entries(values).forEach(([key, value]) => {
			formData.append(key,value);
		});
		fileList.forEach((file) => {
            formData.append('file', file as FileType);
        });
		
		// Gọi hàm mutate
		createMutationCategory.mutate(formData);
        // Gọi hàm mutate nếu k có image
        //createMutationCategory.mutate(values)
    }
    const onFinishFailedAdd: FormProps<categoryDataType>['onFinishFailed'] = (errorInfo)=> {
        console.log('Failed:', errorInfo);
    }
    const handleOkAdd = () => {
        formAdd.submit();
    }
    //============== update category ============= //
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [formUpdate] = Form.useForm();
    const fetchUpdateCategory = async (payload: categoryDataType) => {
        const {_id, ...params} = payload;
        const url = `${globalSetting.URL_API}/categories/${_id}`;
        const res = await axiosClient.put(url,params);
        return res.data.data;
    }
    const updateMutationCategory = useMutation({
        mutationFn: fetchUpdateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories',page]
            })
            message.success('Cập nhật thành công!');
            setIsModalEditOpen(false);
            formUpdate.resetFields();
        },
        onError: () => {
            message.error('Cập nhật lỗi!')
        }
    })
    const showModalEdit = () => {
        setIsModalEditOpen(true);
      };
      const handleOkEdit = () => {
        formUpdate.submit();
      };
      const handleCancelEdit = () => {
        setIsModalEditOpen(false);
      };
      
      const onFinishEdit: FormProps<categoryDataType>['onFinish'] = async (values) => {
        updateMutationCategory.mutate(values);
      };
      
      const onFinishFailedEdit: FormProps<categoryDataType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };
     //============== edit upload image ============= //
     const propsUploadSingle: UploadProps = {
        action: `${globalSetting.URL_API}/upload/photo`,
        listType: 'picture',
        maxCount: 1,
        onChange: (file) => {
          // Kiểm tra xem việc upload có thành công không
          if (file.file.status === 'done') {
            const imageUrl = file.file.response.data.link;
            formUpdate.setFieldValue('banner', imageUrl); // Cập nhật giá trị của input banner
          }
        },
        onRemove: () => {
          formUpdate.setFieldValue('banner', null); // Clear giá trị khỏi input banner
          // Gọi API xóa hình ảnh trên server (cần thêm API thực hiện việc này)
        },
    };
    //============== end edit upload image ============= //
    //============== search category ============= //
	const [formSearch] = Form.useForm();
	const [clientReadySearch, setClientReadySearch] = useState(false);
	const onFinishSearch: FormProps<TypeCategory>['onFinish'] = (values) => {
		// cập nhập lại url
		const params = new URLSearchParams();
		// duyệt qua từng cặp key -value trong object
		for (const [key, value] of Object.entries(values)) {
			if (value !== undefined && value !== '') {
				params.append(key, String(value));
			}
		}
		const searchString = params.toString();
		navigate(`/categories?${searchString}`);
	}
	const onFinishFailedSearch: FormProps<TypeCategory>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	}
	const handleInputChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setClientReadySearch(value.length > 0); // Hiện nút khi có giá trị
		// Điều hướng đến /categories nếu input rỗng
		if (value.length === 0) {
			navigate(`/categories`);
		}
	};
    // phân quyền, lấy user từ hook useAuth
	const { user } = useAuth();
    // khai bao columns
    const categoryColumns: TableProps<categoryDataType>["columns"] = [
        {
            title: 'Tên danh mục',
            dataIndex: 'category_name',
            key: 'category_name'
        },
        {
            title: 'Chi tiết',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'banner',
            key: 'banner',
            width: 150,
            render: (text: string) => {
                const urlImage = text ? `${globalSetting.UPLOAD_DIRECTORY}`+text : null;
                return (
                    urlImage ? (
                        <Image
                        width={100}
                        src= {urlImage}
                        alt=""
                        />
                    ) : (
                        <Image
                        width={100}
                        src={noImage}
                        alt="No Image"
                        />
                    )
                )
                
            },
        }
    ]
    if (user?.role.includes(EnumRole.ADMIN) || user?.role.includes(EnumRole.USER)) {
		categoryColumns.push({
			title: 'Hành Động',
			key: 'action',
			render: (_, record) => (
				<Space size="middle">
					<Button 
                    type="primary" 
                    shape="circle" 
                    className='common_button'
                    icon={<AiOutlineEdit />}
                    onClick={()=>{
                        showModalEdit();
                        formUpdate.setFieldsValue(record)
                      }}
                    ></Button>
					{/* admin có quyền xoá */}
					{user?.role.includes(EnumRole.ADMIN) && (
						<Popconfirm
                        title="Xoá danh mục sản phẩm"
                        description="Bạn có muốn xoá danh mục sản phẩm này phải không?"
                        onConfirm={()=> {
                            // gọi xử lý xoá bằng cách mutate ánh xạ
                            deleteCategory.mutate(record._id)
                        }}
                        okText="Xoá"
                        cancelText="Không xoá"
                    >
                        <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<AiOutlineDelete  /> } 
                        danger
                        >
                        </Button>
                    </Popconfirm>
					)}
				</Space>
			),
		})
	}
	// Render nút Add Staff theo role
	const renderAddButton = () => {
		if (user?.role.includes(EnumRole.ADMIN) || user?.role.includes(EnumRole.USER)) {
			return (
				<Button type="primary" icon={<AiOutlinePlus />} onClick={()=>{showModalAdd()}} className='common_button btn_add'>Thêm danh mục</Button>
			);
		}
		return null;
	};
    return (
        <>
            <div className="box_heading">
                <h2>DANH MỤC SẢN PHẨM</h2>
                <Form
					form={formSearch}
					name="category_search_form"
					onFinish={onFinishSearch}
					onFinishFailed={onFinishFailedSearch}
					autoComplete="on"
					layout="inline"
					className='form_search'
				>
					<Form.Item
						label=""
						name="keyword"
					>
						<Input onChange={handleInputChangeSearch} placeholder="Tìm kiếm theo tên danh mục" />
					</Form.Item>
					<Form.Item shouldUpdate labelCol={{ offset: 2 }}>
						<Space>
							<Button type="primary" htmlType="submit"
								disabled={
									!clientReadySearch ||
									!formSearch.isFieldsTouched(true) ||
									!formSearch.getFieldValue('keyword')
								}
							>
								Tìm kiếm
							</Button>
							<Button type="default" htmlType="reset"
								onClick={() => {
									formSearch.resetFields();
									navigate(`/categories`)
								}}
							>
								Reset
							</Button>
						</Space>
					</Form.Item>
				</Form>
                {renderAddButton()}
            </div>
            <div className="data_table">
                <Table
                columns={categoryColumns} 
                dataSource={getCategory?.data?.categories_list || [] } 
                rowKey={(record) => record._id}
                pagination={false} />
                <Pagination 
                    className='pagination_page'
                    defaultCurrent={1} 
                    current={page} 
                    align="center"
                    pageSize={getCategory?.data?.pagination.limit || 5}
                    total={getCategory?.data?.pagination.totalRecords || 0}
                    onChange={(p) => {
                        navigate(`/categories?page=${p}`)
                    }} 
                />
            </div>
            
            {/* modal edit */}
            <Modal
                title="CẬP NHẬT DANH MỤC"
                open={isModalEditOpen}
                onOk={handleOkEdit}
                onCancel={handleCancelEdit}
                className='box_modal'
                okText="Cập nhật"
                cancelText="Huỷ"
                >
                <Form
                name="formEditCategory"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinishEdit}
                onFinishFailed={onFinishFailedEdit}
                autoComplete="off"
                form={formUpdate}
                >
                <Form.Item<categoryDataType>
                label="id"
                name="_id"
                hidden={true}
                >
                <Input type="hidden" />
                </Form.Item>
                <Form.Item<categoryDataType>
                label="Tên Danh Mục"
                name="category_name"
                hasFeedback
                rules={[
                    {required: true, message: "Vui lòng nhập tên danh mục!" },
                    ]}
                >
                <Input />
                </Form.Item>
                <Form.Item<categoryDataType>
                label="Chi tiết danh mục"
                name="description"
                hasFeedback
                >
                <TextArea rows={4} />
                </Form.Item>
                <Form.Item label="Hình ảnh giới thiệu" name="banner">
                    <Input />
                </Form.Item>
                <Form.Item<TypeCategory>
                    label="Hình ảnh giới thiệu"
                    name="banner"
                >
                <Upload {...propsUploadSingle} >
                <Button icon={<UploadOutlined />}>Tải hình ảnh lên</Button>
                </Upload>
                </Form.Item>
                </Form>

            </Modal>
            {/* modal add  */}
            <Modal
            title="THÊM DANH MỤC"
            open={isModalAddOpen}
            onOk={handleOkAdd}
            onCancel={handleCancelAdd}
            className='box_modal'
            okText="Thêm mới"
            cancelText="Huỷ"
            >
            <Form
            name="formAddCategory"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            onFinish={onFinishAdd}
            onFinishFailed={onFinishFailedAdd}
            autoComplete="off"
            form={formAdd}
        >
            <Form.Item<categoryDataType>
            label="Tên Danh Mục"
            name="category_name"
            hasFeedback
            rules={[
                {required: true, message: "Vui lòng nhập tên danh mục!" },
                ]}
            >
            <Input />
            </Form.Item>
            <Form.Item<categoryDataType>
            label="Chi tiết danh mục"
            name="description"
            hasFeedback
            >
            <TextArea rows={4} />
            </Form.Item>
            <Form.Item<categoryDataType>
                label="Hình ảnh giới thiệu"
                name="banner"
            >
            <Upload {...propsUploadAdd} >
            <Button icon={<UploadOutlined />}>Tải hình ảnh lên</Button>
            </Upload>
            </Form.Item>
            </Form>
            </Modal>
        </>
    )
}

export default Categories

import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useQuery,useQueryClient,useMutation} from '@tanstack/react-query';
import { useNavigate,useSearchParams  } from 'react-router-dom';
import type { TableProps,PaginationProps, FormProps} from 'antd';
import {Table,Pagination,Button,Space,Popconfirm, Image,Switch,message, Form, Input, Radio, Flex, Slider} from 'antd'
import { AiOutlinePlus,AiOutlineEdit,AiOutlineDelete } from "react-icons/ai";
import { TypeProduct,EnumRole } from '../../types/type';
import noImage from '../../assets/noImage.jpg'
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';
const Products = () => {
    // pagination
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const limit_str = params.get("limit");
    const page_str = params.get('page');
    const page = page_str ? parseInt(page_str) : 1;
    const limit = limit_str ? parseInt(limit_str) : 7;
    // sort field
	const [timeOrder, setTimeOrder] = useState<string>("DESC");
    const [priceOrder, setPriceOrder] = useState<string>("DESC");
    const [sortBy, setSortBy] = useState<'time' | 'price'>('time');
    // search keyword
	const keyword_str = params.get('keyword');
	const keyword = keyword_str ? keyword_str : null;
    // filter theo khoảng giá
    const price_min = params.get('price_min');
    const price_max = params.get('price_max');
    const [priceRange, setPriceRange] = useState<[number, number]>([
        price_min ? parseInt(price_min) : 0,
        price_max ? parseInt(price_max) : 1000000
    ]);
    //============== get all product ============= //
    const fetchProduct = async() => {
        let url = `${globalSetting.URL_API}/products?`;
        if (keyword) {
			url += `keyword=${keyword}&`;
		}
        if (priceRange[0] > 0) {
            url += `price_min=${priceRange[0]}&`;
        }
        if (priceRange[1] < 1000000) {
            url += `price_max=${priceRange[1]}&`;
        }
        if (sortBy === 'time') {
            url += `sort=createdAt&order=${timeOrder}`;
        } else {
            url += `sort=price&order=${priceOrder}`;
        }
		url += `&page=${page}&limit=${limit}`;
        const res = await axiosClient.get(url);
        return res.data.data;
    }
    const getProduct = useQuery({
        queryKey: ['products',page,keyword,sortBy,timeOrder,priceOrder,priceRange],
        queryFn: fetchProduct
    })
    const onChangePagination: PaginationProps["onChange"] = (page) => {
        const searchParams = new URLSearchParams(params);
        if (page !== 1) {
            searchParams.set('page', page.toString());
        } else {
            searchParams.delete('page');
        }
        const queryString = searchParams.toString();
        navigate(`/products${queryString ? `?${queryString}` : ''}`);
    };
    // hàm xử lý khi thay đổi giá
    const handlePriceChange = (newValue: number[]) => {
        // Ép kiểu để đảm bảo là mảng 2 phần tử
        const [min, max] = newValue as [number, number];
        setPriceRange([min, max]);
        
        const searchParams = new URLSearchParams(params);
        searchParams.set('price_min', min.toString());
        searchParams.set('price_max', max.toString());
        
        // Reset page về 1 khi thay đổi filter
        searchParams.delete('page');
        
        const queryString = searchParams.toString();
        navigate(`/products${queryString ? `?${queryString}` : ''}`);
    };
    //============== delete find id ============= //
    const fetchDeleteProduct = async (id: string) => {
        const url = `${globalSetting.URL_API}/products/${id}`;
        const res = await axiosClient.delete(url);
        return res.data.data;
    }
    const queryClient = useQueryClient();
    const deleteProduct = useMutation({ // sử dụng hook useMutation để biến đổi dữ liệu như thêm , sửa , xoá dữ liệu
        mutationFn: fetchDeleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ // làm mới dữ liệu
                queryKey: ['products',page]
            })
            message.success('Xoá thành công!');
        },
        onError: () => {
            message.error('Xoá lỗi!');
        },
    })
    //============== search customer ============= //
    const [formSearch] = Form.useForm();
	const [clientReadySearch, setClientReadySearch] = useState(false);
	const onFinishSearch: FormProps<TypeProduct>['onFinish'] = (values) => {
		// cập nhập lại url
		const params = new URLSearchParams();
		// duyệt qua từng cặp key -value trong object
		for (const [key, value] of Object.entries(values)) {
			if (value !== undefined && value !== '') {
				params.append(key, String(value));
			}
		}
		const searchString = params.toString();
		navigate(`/products?${searchString}`);
	}
	const onFinishFailedSearch: FormProps<TypeProduct>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	}
	const handleInputChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setClientReadySearch(value.length > 0); // Hiện nút khi có giá trị
		// Điều hướng đến /products nếu input rỗng
		if (value.length === 0) {
			navigate(`/products`);
		}
	};
    // phân quyền, lấy user từ hook useAuth
	const { user } = useAuth();
    // khai bao columns
    const productColumns: TableProps<TypeProduct>["columns"] = [
        {
            title: 'Tên SP',
            dataIndex: 'product_name',
            key: 'product_name',
            width: 100,
            fixed: 'left',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 150,
            render: (text: string) => {
                const urlImage = text ? `${globalSetting.UPLOAD_DIRECTORY}`+text : null;
                return (
                    urlImage ? (
                        <Image
                        width={100}
                        height={100}
                        src= {urlImage}
                        alt=""
                        />
                    ) : (
                        <Image
                        width={100}
                        src={noImage}
                        height={100}
                        alt="No Image"
                        />
                    )
                )
                
            },
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            width: 120,
            key: 'category',
            render: (category)=> {
                return category?.category_name || 'Loại khác';
            }
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
        },
        {
            title: 'Số lượng tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
        },
        {
            title: 'SP nổi bật',
            dataIndex: 'isBest',
            key: 'isBest',
            width: 70,
            render: (active: boolean) => (
                <Switch size="small" checked={active} />
            ),
        },
        {
            title: 'SP mới về',
            dataIndex: 'isNewProduct',
            key: 'isNewProduct',
            width: 70,
            render: (active: boolean) => (
                <Switch size="small" checked={active} />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 70,
            render: (active: boolean) => (
                <Switch size="small" checked={active} />
            ),
        }
    ]
    if (user?.role.includes(EnumRole.ADMIN) || user?.role.includes(EnumRole.USER)) {
		productColumns.push({
			title: 'Hành Động',
			key: 'action',
            width: 100,
            fixed: 'right',
			render: (_, record) => (
				<Space size="middle">
					<Button 
                    type="primary" 
                    shape="circle" 
                    className='common_button'
                    icon={<AiOutlineEdit />}
                    onClick={()=>{
                        navigate(`/products/${record._id}`)
                    }}
                    ></Button>
					{/* admin có quyền xoá */}
					{user?.role.includes(EnumRole.ADMIN) && (
						<Popconfirm
                        title="Xoá sản phẩm"
                        description="Bạn có muốn xoá sản phẩm này?"
                        onConfirm={()=> {
                            // gọi xử lý xoá bằng cách mutate ánh xạ
                            deleteProduct.mutate(record._id?.toString() || '')
                        }}
                        okText="Yes"
                        cancelText="No"
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
				<Button type="primary" icon={<AiOutlinePlus />} onClick={()=>navigate(`/products/add`)} className='common_button btn_add'>Thêm sản phẩm</Button>
			);
		}
		return null;
	};
    return (
        <>
            <div className="box_heading">
                <h2>DANH SÁCH SẢN PHẨM</h2>
                <Form
					form={formSearch}
					name="formSearchProduct"
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
						<Input onChange={handleInputChangeSearch} placeholder="Tìm kiếm theo tên sản phẩm" />
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
									navigate(`/products`)
								}}
							>
								Reset
							</Button>
						</Space>
					</Form.Item>
				</Form>
                {renderAddButton()}
            </div>
            <Flex gap={20} align='center' className='box_filter'>
            <Space direction="horizontal" align="center" size="large">
                {/* Sort controls */}
                <Flex gap={20} align='center'>
                    <p>Sắp xếp theo : </p>
                    <Radio.Group 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <Radio.Button value="time">Sản phẩm</Radio.Button>
                        <Radio.Button value="price">Giá</Radio.Button>
                    </Radio.Group>
                </Flex>

                {sortBy === 'time' && (
                    <Flex gap={20} align='center'>
                        <Radio.Group 
                            value={timeOrder} 
                            onChange={(e) => setTimeOrder(e.target.value)}
                        >
                            <Radio.Button value="DESC">Mới nhất</Radio.Button>
                            <Radio.Button value="ASC">Cũ nhất</Radio.Button>
                        </Radio.Group>
                    </Flex>
                )}

                {sortBy === 'price' && (
                    <Flex gap={20} align='center'>
                        <Radio.Group 
                            value={priceOrder} 
                            onChange={(e) => setPriceOrder(e.target.value)}
                        >
                            <Radio.Button value="DESC">Cao đến thấp</Radio.Button>
                            <Radio.Button value="ASC">Thấp đến cao</Radio.Button>
                        </Radio.Group>
                    </Flex>
                )}

                {/* Price range filter */}
                <Flex gap={10} align='center' style={{ width: '500px' }}>
                    <p>Khoảng giá:</p>
                    <div style={{ width: '200px' }}>
                        <Slider
                            range
                            min={0}
                            max={1000000}
                            step={10000}
                            value={priceRange}
                            onChange={handlePriceChange}
                            tooltip={{
                                formatter: (value: number | undefined) => {
                                    if (typeof value === 'number') {
                                        return new Intl.NumberFormat('vi-VN', { 
                                            style: 'currency', 
                                            currency: 'VND' 
                                        }).format(value);
                                    }
                                    return '';
                                }
                            }}
                        />
                    </div>
                    <Flex gap={10} align='center' style={{paddingLeft: '10px'}} >
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[0]) }</span>
                            <span> - </span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[1]) }</span>
                    </Flex>
                </Flex>
            </Space>
        </Flex>
            
            <div className="data_table">
                <Table 
                columns={productColumns} 
                rowKey="_id"
                dataSource={getProduct?.data?.products_list || [] }
                scroll={{ x: 1500 }} 
                pagination={false } 
                />
                <Pagination 
                className='pagination_page'
                defaultCurrent={1} 
                current={page} 
                align='center'
                pageSize={getProduct?.data?.pagination.limit || 5}
                total={getProduct?.data?.pagination.totalRecords || 0}
                onChange={onChangePagination} 
                />;
            </div>
        </>
    )
}

export default Products
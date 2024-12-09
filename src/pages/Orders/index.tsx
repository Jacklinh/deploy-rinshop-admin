import { useState, useEffect } from 'react';
import { Table, Pagination, Input, Button, Space, message, Popconfirm, Modal, Form, Image, Select, InputNumber, Tag, Flex, Radio, DatePicker } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa";
import type { TableProps, FormProps, RadioChangeEvent } from 'antd';
import { TypeOrder, TypeOrderItem, EnumRole } from '../../types/type';
import noImage from '../../assets/noImage.jpg'
import useAuth from '../../hooks/useAuth';
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const Orders = () => {
    // Options cho phương thức thanh toán
    const paymentTypeOptions = [
        { value: '', label: 'Tất cả' },
        { value: 1, label: 'Thanh toán khi nhận hàng ' },
        { value: 2, label: 'Chuyển khoản ngân hàng' },
        { value: 3, label: 'Thanh toán qua ví điện tử' },
    ];
    // Options cho trạng thái thanh toán
    const paymentStatusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 1, label: 'Chưa thanh toán' },
        { value: 2, label: 'Đã thanh toán' },
        { value: 3, label: 'Hoàn tiền' }
    ];
    // Options cho trạng thái đơn hàng
    const orderStatusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 1, label: 'Chờ xác nhận' },
        { value: 2, label: 'Đã xác nhận' },
        { value: 3, label: 'Đang giao hàng' },
        { value: 4, label: 'Đã giao hàng' },
        { value: 5, label: 'Đã hủy' },
        { value: 6, label: 'Hoàn trả' }
    ];
    //============== start fetch all order ============= //
    const [formUpdate] = Form.useForm<TypeOrder>();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const limit = 5;
    const page_str = params.get('page');
    const page = page_str ? parseInt(page_str) : 1;
    // sort for fullName
    const [sortOrder, setSortOrder] = useState<string>("ASC");
    // search keyword
    const keyword_str = params.get('keyword');
    const keyword = keyword_str ? keyword_str : null;
    // filter payment_type, payment_status, status
    const [filters, setFilters] = useState({
        payment_type: null,
        payment_status: null,
        status: null,
        start_date: null,
        end_date: null
    });
    // Hàm xử lý chung cho tất cả filter
    const handleFilter = (type: 'payment_type' | 'payment_status' | 'status', value: number | null) => {
        setFilters(prev => ({ ...prev, [type]: value }));

        const searchParams = new URLSearchParams(params);
        if (value) {
            searchParams.set(type, value.toString());
        } else {
            searchParams.delete(type);
        }
        searchParams.delete('page'); // Reset page về 1
        navigate(`/orders?${searchParams.toString()}`);
    };
    // hàm xử lý filter khoảng thời gian đặt đơn hàng 
    const handleDateRangeChange = (dates: any | null) => {
        if (dates) {
            const [start, end] = dates;
            setFilters(prev => ({
                ...prev,
                start_date: start.format('YYYY-MM-DD'),
                end_date: end.format('YYYY-MM-DD')
            }));

            const searchParams = new URLSearchParams(params);
            searchParams.set('start_date', start.format('YYYY-MM-DD'));
            searchParams.set('end_date', end.format('YYYY-MM-DD'));
            searchParams.delete('page'); // Reset page về 1
            navigate(`/orders?${searchParams.toString()}`);
        } else {
            setFilters(prev => ({
                ...prev,
                start_date: null,
                end_date: null
            }));

            const searchParams = new URLSearchParams(params);
            searchParams.delete('start_date');
            searchParams.delete('end_date');
            searchParams.delete('page');
            navigate(`/orders?${searchParams.toString()}`);
        }
    };
    const fetchOrder = async () => {
        let url = `${globalSetting.URL_API}/orders?`;
        if (keyword) {
            url += `keyword=${keyword}&`;
        }
        // filter payment_type, payment_status, status
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null) {
                url += `${key}=${value}&`;
            }
        });
        url += `page=${page_str}&limit=${limit}&sort=createdAt&order=${sortOrder}`;
        const res = await axiosClient.get(url)
        return res.data.data
    }
    const getOrder = useQuery({
        queryKey: ['orders', page, keyword, sortOrder, filters],
        queryFn: fetchOrder
    });
    // handleSortChange
    const handleSortChange = (e: RadioChangeEvent) => {
        setSortOrder(e.target.value);
    };
    //============== order details ============= //
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TypeOrder | null>(null);
    const showModalDetail = (record: TypeOrder) => {
        setSelectedOrder(record);
        setIsModalDetailOpen(true);
    };

    const handleCancelDetail = () => {
        setIsModalDetailOpen(false);
        setSelectedOrder(null);
    };
    //============== order edit ============= //
    const [editingOrder, setEditingOrder] = useState<TypeOrder | null>(null);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [shippingFee, setShippingFee] = useState<number>(0);
    const queryClient = useQueryClient();
    const fetchUpdateOrder = async (payload: TypeOrder) => {
        const { _id, ...params } = payload;
        const url = `${globalSetting.URL_API}/orders/${_id}`;
        const res = await axiosClient.put(url, params);
        return res.data.data;
    };
    const updateMutationOrder = useMutation({
        mutationFn: fetchUpdateOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['orders', page]
            });
            message.success('Cập nhật thành công !');
            setIsModalEditOpen(false);
            setEditingOrder(null);
            // clear data từ form
            formUpdate.resetFields();
        },
        onError: () => {
            message.error('Cập nhật lỗi!');
        }
    });
    // Tính toán tổng tiền từ order items
    const calculateSubTotal = (items: TypeOrderItem[]) => {
        return items.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity * (1 - item.discount / 100);
            return sum + itemTotal;
        }, 0);
    };
    // Effect để tính toán tổng tiền
    useEffect(() => {
        if (editingOrder) {
            const subTotal = calculateSubTotal(editingOrder.order_items);
            setTotalAmount(subTotal + shippingFee);
        }
    }, [editingOrder, shippingFee]);

    const showModalEdit = (record: TypeOrder) => {
        setIsModalEditOpen(true);
        setEditingOrder(record);
        setShippingFee(record.shipping_fee);
        formUpdate.setFieldsValue({
            ...record,
            order_items: record.order_items,
            shipping_fee: record.shipping_fee
        });
    };

    const handleOkEdit = () => {
        formUpdate.submit();
    };

    const handleCancelEdit = () => {
        setIsModalEditOpen(false);
    };
    // Xử lý khi thay đổi trạng thái đơn hàng
    const handleStatusChange = (value: number) => {
        if (value === 5) {
            Modal.confirm({
                title: 'Xác nhận hủy đơn',
                content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                onOk() {
                    formUpdate.setFieldsValue({ status: value });
                },
                onCancel() {
                    formUpdate.setFieldsValue({ status: editingOrder?.status });
                }
            });
        } else if (value === 4) {
            Modal.confirm({
                title: 'Xác nhận hoàn thành đơn',
                content: 'Xác nhận đơn hàng đã được giao thành công?',
                onOk() {
                    formUpdate.setFieldsValue({ status: value });
                },
                onCancel() {
                    formUpdate.setFieldsValue({ status: editingOrder?.status });
                }
            });
        } else {
            formUpdate.setFieldsValue({ status: value });
        }
    };
    // Xử lý khi thay đổi số lượng
    const handleQuantityChange = (value: number | null, index: number) => {
        if (editingOrder) {
            const newItems = [...editingOrder.order_items];
            newItems[index] = {
                ...newItems[index],
                quantity: value || 1
            };
            setEditingOrder({
                ...editingOrder,
                order_items: newItems
            });
        }
    };

    // Xử lý khi thay đổi phí ship
    const handleShippingFeeChange = (value: number | null) => {
        const newShippingFee = value || 0;
        setShippingFee(newShippingFee);
        formUpdate.setFieldsValue({ shipping_fee: newShippingFee });
    };
    const onFinishEdit: FormProps<TypeOrder>['onFinish'] = async (values) => {
        if (!editingOrder?._id) {
            throw new Error('Không tìm thấy thông tin đơn hàng');
        }

        const updatedOrder: TypeOrder = {
            _id: editingOrder._id,
            customer: {
                _id: editingOrder.customer._id,
                fullName: editingOrder.customer.fullName,
                email: editingOrder.customer.email,
                phone: editingOrder.customer.phone,
                password: editingOrder.customer.password,
                address: editingOrder.customer.address
            },
            order_items: editingOrder.order_items.map(item => ({
                product: {
                    _id: item.product._id,
                    thumbnail: item.product.thumbnail
                },
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount
            })),
            payment_type: Number(values.payment_type),
            payment_status: Number(values.payment_status),
            status: Number(values.status),
            shipping_address: values.shipping_address,
            tracking_number: values.tracking_number,
            shipping_fee: Number(values.shipping_fee) || 0,
            note: values.note,
            cancelled_reason: values.cancelled_reason,
            cancelled_at: values.cancelled_at,
            total_amount: totalAmount,
            createdAt: new Date()
        };
        updateMutationOrder.mutate(updatedOrder);

    };
    //============== order delete ============= //
    const fetchDeleteOrder = async (id: string) => {
        const url = `${globalSetting.URL_API}/orders/${id}`;
        const res = await axiosClient.delete(url);
        return res.data.data;
    }
    const deleteOrder = useMutation({
        mutationFn: fetchDeleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['orders', page]
            });
            message.success('Xoá thành công!');
        },
        onError: () => {
            message.error('Xoá lỗi !');
        },
    });
    //============== search order  ============= //
    const [formSearch] = Form.useForm();
    const [clientReadySearch, setClientReadySearch] = useState(false);
    const onFinishSearch: FormProps<TypeOrder>['onFinish'] = (values) => {
        // cập nhập lại url
        const params = new URLSearchParams();
        // duyệt qua từng cặp key -value trong object
        for (const [key, value] of Object.entries(values)) {
            if (value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        }
        const searchString = params.toString();
        navigate(`/orders?${searchString}`);
    }
    const onFinishFailedSearch: FormProps<TypeOrder>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }
    const handleInputChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setClientReadySearch(value.length > 0); // Hiện nút khi có giá trị
        // Điều hướng đến /staffs nếu input rỗng
        if (value.length === 0) {
            navigate(`/orders`);
        }
    };
    // phân quyền, lấy user từ hook useAuth
    const { user } = useAuth();
    // render get all orders
    const columns: TableProps<TypeOrder>['columns'] = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_code',
        },
        {
            title: 'Khách Hàng',
            dataIndex: ['customer', 'fullName'],
            width: 350,
            key: 'customer',
        },
        {
            title: 'Email',
            dataIndex: ['customer', 'email'],
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: ['customer', 'phone'],
            key: 'phone',
        },
        {
            title: 'Số Lượng',
            key: 'totalItems',
            render: (_, record) => record.order_items.length
        },
        {
            title: 'Tổng Tiền',
            key: 'total',
            render: (_, record) => {
                const total = record.total_amount || 0;
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
            }
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'payment_type',
            key: 'payment_type',
            render: (status) => {
                const statusText = paymentTypeOptions.find(s => s.value === status)?.label;
                return <Tag color={status === 2 ? 'green' : status === 3 ? 'red' : 'orange'}>{statusText}</Tag>;
            }
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status) => {
                const statusText = paymentStatusOptions.find(s => s.value === status)?.label;
                return <Tag color={status === 2 ? 'green' : status === 3 ? 'red' : 'orange'}>{statusText}</Tag>;
            }
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusText = orderStatusOptions.find(s => s.value === status)?.label;
                const color = status === 4 ? 'green' :
                    status === 5 ? 'red' :
                        status === 3 ? 'blue' : status === 2 ? 'green' : 'orange';
                return <Tag color={color}>{statusText}</Tag>;
            }
        },
        {
            title: 'Ngày Đặt',
            key: 'createdAt',
            fixed: 'right',
            render: (_, record) => {
                const date = record.createdAt ? new Date(record.createdAt) : new Date();
                return <span>{date.toLocaleDateString('vi-VN')}</span>;
            }
        }
    ];
    const canViewOrder = user?.role.includes(EnumRole.ADMIN) || 
                        user?.role.includes(EnumRole.USER) || 
                        user?.role.includes(EnumRole.VIEWER);

    const canEditOrder = user?.role.includes(EnumRole.ADMIN) || 
                        user?.role.includes(EnumRole.USER);

    const canDeleteOrder = user?.role.includes(EnumRole.ADMIN);
    if (canViewOrder) {
        columns.push({
            title: 'Hành Động',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_, record) => {
                // Kiểm tra trạng thái đơn hàng để hiển thị nút sửa
                const canEdit = canEditOrder && record.status !== 4 && record.status !== 5; // Không cho sửa đơn đã giao hoặc đã hủy
                
                return (
                    <Space size="middle">
                        {/* Nút xem chi tiết - tất cả role có quyền xem đều thấy */}
                        <Button
                            type="primary"
                            shape="circle"
                            className='common_button'
                            icon={<FaRegEye />}
                            onClick={() => showModalDetail(record)}
                        />
    
                        {/* Nút sửa - chỉ hiện khi có quyền sửa và đơn hàng có thể sửa */}
                        {canEdit && (
                            <Button
                                type="primary"
                                shape="circle"
                                className='common_button'
                                icon={<AiOutlineEdit />}
                                onClick={() => showModalEdit(record)}
                            />
                        )}
    
                        {/* Nút xóa - chỉ ADMIN mới thấy */}
                        {canDeleteOrder && (
                            <Popconfirm
                                title="Xoá đơn hàng"
                                description="Bạn có chắc chắn muốn xoá đơn hàng này?"
                                onConfirm={() => deleteOrder.mutate(record._id)}
                                okText="Đồng ý"
                                cancelText="Hủy"
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
                );
            },
        })
    }
    return (
        <>
            {/*  get all orders */}
            <div className="box_heading">
                <h2>DANH SÁCH ĐƠN HÀNG</h2>
                <Form
                    form={formSearch} 
                    name="form_search_order"
                    onFinish={onFinishSearch}
                    onFinishFailed={onFinishFailedSearch}
                    autoComplete="on"
                    layout="inline"
                    className='form_search'
                >
                    <Form.Item
                        name="keyword"
                    >
                        <Input
                            onChange={handleInputChangeSearch}
                            placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc mã đơn hàng"
                        />
                    </Form.Item>

                    <Form.Item shouldUpdate>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={
                                    !clientReadySearch ||
                                    !formSearch.isFieldsTouched(true) ||
                                    !formSearch.getFieldValue('keyword')
                                }
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                type="default"
                                htmlType="reset"
                                onClick={() => {
                                    formSearch.resetFields();
                                    setClientReadySearch(false);
                                    navigate('/orders');
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
            <Flex gap={20} align='center' className='box_filter'>
                <Space direction="vertical" size="middle">
                    <Flex gap={10} align='center'>
                        <Space size="middle">
                            <div className='filter_item'>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Sắp xếp đơn hàng: </span>
                                <Radio.Group onChange={handleSortChange} value={sortOrder}>
                                    <Space direction="horizontal">
                                        <Radio.Button value="ASC">Mới nhất</Radio.Button>
                                        <Radio.Button value="DESC">Cũ</Radio.Button>
                                    </Space>
                                </Radio.Group>
                            </div>
                            <div className='filter_item'>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Thời gian đặt hàng:</span>
                                <RangePicker
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    style={{ width: 300 }}
                                />
                            </div>
                        </Space>
                    </Flex>
                    {/* Filter option */}
                    <Flex gap={10} align='center'>
                        <Space size="middle">
                            {/* Filter phương thức thanh toán */}
                            <div className='filter_item'>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Phương thức thanh toán:</span>
                                <Select
                                    style={{ width: 200 }}
                                    value={filters.payment_type}
                                    onChange={(value) => handleFilter('payment_type', value)}
                                    defaultValue={null}
                                >
                                    {paymentTypeOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>

                            {/* Filter trạng thái thanh toán */}
                            <div className='filter_item'>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Trạng thái thanh toán:</span>
                                <Select
                                    style={{ width: 200 }}
                                    value={filters.payment_status}
                                    onChange={(value) => handleFilter('payment_status', value)}
                                    defaultValue={null}
                                >
                                    {paymentStatusOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>

                            {/* Filter trạng thái đơn hàng */}
                            <div className='filter_item'>
                                <span style={{ marginRight: '8px', fontWeight: 'bold' }}>Trạng thái đơn hàng:</span>
                                <Select
                                    style={{ width: 200 }}
                                    value={filters.status}
                                    onChange={(value) => handleFilter('status', value)}
                                    defaultValue={null}
                                >
                                    {orderStatusOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </Space>
                    </Flex>
                </Space>

            </Flex>
            <div className="data_table">
                <Table
                    dataSource={getOrder?.data?.orders_list}
                    columns={columns}
                    rowKey={(record) => record._id}
                    pagination={false}
                />

                <Pagination
                    className='pagination_page'
                    defaultCurrent={1}
                    current={page}
                    align='center'
                    pageSize={getOrder?.data?.pagination.limit || 5}
                    total={getOrder?.data?.pagination.totalRecords || 0}
                    onChange={(page) => {
                        navigate(page !== 1 ? `/orders?page=${page}` : '/orders');
                    }}
                />
            </div>
            {/* Modal Chi tiết đơn hàng */}
            <Modal
                title="CHI TIẾT ĐƠN HÀNG"
                open={isModalDetailOpen}
                onCancel={handleCancelDetail}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div className='box_order_detail'>
                        <Table
                            dataSource={[
                                {
                                    label: 'Tên khách Hàng',
                                    value: selectedOrder.customer.fullName
                                },
                                {
                                    label: 'Email',
                                    value: selectedOrder.customer.email
                                },
                                {
                                    label: 'Số điện thoại',
                                    value: selectedOrder.customer.phone
                                },
                                {
                                    label: 'Địa chỉ',
                                    value: selectedOrder.shipping_address
                                },
                                {
                                    label: 'Phương thức thanh toán',
                                    value: paymentTypeOptions.find(p => p.value === selectedOrder.payment_type)?.label
                                },
                                {
                                    label: 'Trạng thái thanh toán',
                                    value: paymentStatusOptions.find(p => p.value === selectedOrder.payment_status)?.label
                                },
                                {
                                    label: 'Trạng thái đơn hàng',
                                    value: orderStatusOptions.find(p => p.value === selectedOrder.status)?.label
                                },
                                {
                                    label: 'Ngày đặt',
                                    value: new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')
                                }
                            ]}
                            pagination={false}
                            columns={[
                                {
                                    title: 'Thông tin',
                                    dataIndex: 'label',
                                    key: 'label',
                                    width: '30%',
                                    render: (text) => <strong>{text}</strong>
                                },
                                {
                                    title: 'Chi tiết',
                                    dataIndex: 'value',
                                    key: 'value',
                                    width: '70%'
                                }
                            ]}
                            size="small"
                            bordered
                        />
                        <h3 style={{ margin: '24px 0 16px' }}>Danh sách sản phẩm</h3>
                        <Table
                            dataSource={selectedOrder.order_items}
                            pagination={false}
                            rowKey={(record) => record.product._id}
                            columns={[
                                {
                                    title: 'Ảnh',
                                    dataIndex: ['product', 'thumbnail'],
                                    key: 'thumbnail',
                                    width: 100,
                                    render: (thumbnail: string) => {
                                        const urlImage = thumbnail ? `${globalSetting.UPLOAD_DIRECTORY}${thumbnail}` : noImage;
                                        return (
                                            <Image
                                                width={50}
                                                height={50}
                                                src={urlImage}
                                                alt=""
                                            />
                                        );
                                    }
                                },
                                {
                                    title: 'Tên sản phẩm',
                                    dataIndex: 'product_name',
                                    key: 'product_name'
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    key: 'quantity'
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
                                },
                                {
                                    title: 'Giảm giá',
                                    dataIndex: 'discount',
                                    key: 'discount',
                                    render: (discount) => `${discount}%`
                                },
                                {
                                    title: 'Thành tiền',
                                    key: 'total',
                                    render: (_, record) => {
                                        const total = record.price * record.quantity * (1 - record.discount / 100);
                                        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
                                    }
                                }
                            ]}
                            summary={() => (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={5} align="right">
                                            <strong>Tạm tính:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(selectedOrder.total_amount - selectedOrder.shipping_fee)}
                                            </strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={5} align="right">
                                            <strong>Phí vận chuyển:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(selectedOrder.shipping_fee)}
                                            </strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={5} align="right">
                                            <strong>Tổng cộng:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(selectedOrder.total_amount)}
                                            </strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            )}
                        />
                    </div>
                )}
            </Modal>
            {/* Modal Cập nhật đơn hàng */}
            <Modal
                title="CẬP NHẬT ĐƠN HÀNG"
                open={isModalEditOpen}
                onOk={handleOkEdit}
                onCancel={handleCancelEdit}
                width={800}
                className='box_modal'
                okText="CẬP NHẬT"
                cancelText="HỦY"
            >
                <Form
                    name="form_edit_order"
                    onFinish={onFinishEdit}
                    form={formUpdate}
                    className='form_edit'
                    layout="vertical"
                >
                    <Form.Item name="_id" hidden={true}>
                        <Input type="hidden" />
                    </Form.Item>

                    <div className="form_edit_items">
                        <h3>Thông tin sản phẩm</h3>
                        <div className="form_edit_contents">
                            <Table
                                dataSource={editingOrder?.order_items}
                                pagination={false}
                                rowKey={(record) => record.product._id}
                                columns={[
                                    {
                                        title: 'Ảnh',
                                        dataIndex: ['product', 'thumbnail'],
                                        key: 'thumbnail',
                                        width: 100,
                                        render: (thumbnail: string) => {
                                            const urlImage = thumbnail ? `${globalSetting.UPLOAD_DIRECTORY}${thumbnail}` : noImage;
                                            return (
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    src={urlImage}
                                                    alt=""
                                                />
                                            );
                                        }
                                    },
                                    {
                                        title: 'Tên sản phẩm',
                                        dataIndex: 'product_name',
                                        key: 'product_name'
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        render: (_, record, index) => (
                                            <InputNumber
                                                min={1}
                                                value={record.quantity}
                                                onChange={(value) => handleQuantityChange(value, index)}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
                                    },
                                    {
                                        title: 'Giảm giá(%)',
                                        dataIndex: 'discount',
                                        key: 'discount',
                                    }
                                ]}
                            />
                        </div>
                        <Form.Item
                            name="shipping_fee"
                            label="Phí vận chuyển"
                            rules={[{ required: true, message: 'Vui lòng nhập phí vận chuyển!' }]}
                        >
                            <InputNumber
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                style={{ width: '100%' }}
                                onChange={handleShippingFeeChange}
                            />
                        </Form.Item>

                        <div className="order-summary" style={{ marginTop: '24px' }}>
                            <Table
                                pagination={false}
                                showHeader={false}
                                dataSource={[
                                    {
                                        key: '1',
                                        label: 'Tạm tính:',
                                        value: new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(calculateSubTotal(editingOrder?.order_items || []))
                                    },
                                    {
                                        key: '2',
                                        label: 'Phí vận chuyển:',
                                        value: new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(editingOrder?.shipping_fee || 0)
                                    },
                                    {
                                        key: '3',
                                        label: 'Tổng cộng:',
                                        value: new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalAmount || 0)
                                    }
                                ]}
                                columns={[
                                    {
                                        dataIndex: 'label',
                                        key: 'label',
                                        align: 'right',
                                        width: '50%',
                                        render: (text) => <strong>{text}</strong>
                                    },
                                    {
                                        dataIndex: 'value',
                                        key: 'value',
                                        width: '50%',
                                        render: (text) => <strong>{text}</strong>
                                    }
                                ]}
                                size="small"
                                bordered
                                style={{ marginTop: '16px' }}
                            />
                        </div>
                    </div>
                    <div className="form_edit_items">
                        <h3>Thông tin khách hàng</h3>
                        <div className="form_edit_contents">
                            <Table
                                dataSource={[
                                    {
                                        label: 'Tên khách Hàng',
                                        value: editingOrder?.customer?.fullName
                                    },
                                    {
                                        label: 'Email',
                                        value: editingOrder?.customer?.email
                                    },
                                    {
                                        label: 'Số điện thoại',
                                        value: editingOrder?.customer?.phone
                                    },
                                    {
                                        label: 'Địa chỉ giao hàng',
                                        value: editingOrder?.shipping_address
                                    }
                                ]}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Thông tin',
                                        dataIndex: 'label',
                                        key: 'label',
                                        width: '30%',
                                        render: (text) => <strong>{text}</strong>
                                    },
                                    {
                                        title: 'Chi tiết',
                                        dataIndex: 'value',
                                        key: 'value',
                                        width: '70%'
                                    }
                                ]}
                                size="small"
                                bordered
                            />
                        </div>
                    </div>
                    <div className="form_edit_items">
                        <h3>Thông tin đơn hàng</h3>
                        <div className="form_edit_contents">
                            <Form.Item
                                name="payment_type"
                                label="Phương thức thanh toán"
                                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                            >
                                <Select>
                                    <Select.Option value={1}>Thanh toán khi nhận hàng</Select.Option>
                                    <Select.Option value={2}>Chuyển khoản ngân hàng</Select.Option>
                                    <Select.Option value={3}>Thanh toán qua ví điện tử</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="payment_status"
                                label="Trạng thái thanh toán"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái thanh toán!' }]}
                            >
                                <Select>
                                    <Select.Option value={1}>Chưa thanh toán</Select.Option>
                                    <Select.Option value={2}>Đã thanh toán</Select.Option>
                                    <Select.Option value={3}>Hoàn tiền</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="status"
                                label="Trạng thái đơn hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái đơn hàng!' }]}
                            >
                                <Select onChange={handleStatusChange}>
                                    <Select.Option value={1}>Chờ xác nhận</Select.Option>
                                    <Select.Option value={2}>Đã xác nhận</Select.Option>
                                    <Select.Option value={3}>Đang giao hàng</Select.Option>
                                    <Select.Option value={4}>Đã giao hàng</Select.Option>
                                    <Select.Option value={5}>Đã hủy</Select.Option>
                                    <Select.Option value={6}>Hoàn trả</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="shipping_address"
                                label="Địa chỉ giao hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                dependencies={['status']}
                                noStyle
                            >
                                {({ getFieldValue }) => (
                                    <Form.Item
                                        name="tracking_number"
                                        label="Số điện thoại giao hàng"
                                        rules={[
                                            {
                                                required: [3].includes(getFieldValue('status')),
                                                message: 'Vui lòng nhập số điện thoại giao hàng!'
                                            },
                                            {
                                                pattern: /^[0-9]{10}$/,
                                                message: 'Số điện thoại không hợp lệ!'
                                            }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                )}
                            </Form.Item>

                            <Form.Item name="note" label="Ghi chú">
                                <TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                dependencies={['status']}
                                noStyle
                            >
                                {({ getFieldValue }) => (
                                    <Form.Item
                                        name="cancelled_reason"
                                        label="Lý do hủy đơn"
                                        rules={[
                                            {
                                                required: getFieldValue('status') === 5,
                                                message: 'Vui lòng nhập lý do hủy đơn!'
                                            }
                                        ]}
                                    >
                                        <Input disabled={getFieldValue('status') !== 5} />
                                    </Form.Item>
                                )}
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default Orders;
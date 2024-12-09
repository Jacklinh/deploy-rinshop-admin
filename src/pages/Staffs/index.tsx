import { useState } from 'react';
import { Table, Pagination, Input, Button, Space, message, Popconfirm, Modal, Form, Switch, Select, Tag, Radio, Flex } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { globalSetting } from '../../constants/configs';
import { axiosClient } from '../../library/axiosClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import type { TableProps, FormProps, RadioChangeEvent } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { TypeStaff, EnumRole } from '../../types/type';
import useAuth from '../../hooks/useAuth';
const Staffs = () => {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const limit = 5;
	const page_str = params.get('page');
	const page = page_str ? parseInt(page_str) : 1;
	// sort for fullName
	const [sortOrder, setSortOrder] = useState<string>("DESC");
	// filter role
	const [roleFilter, setRoleFilter] = useState<string | null>(null);
	// search keyword
	const keyword_str = params.get('keyword');
	const keyword = keyword_str ? keyword_str : null;
	//============== all staff ============= //
	const fetchStafff = async () => {
		let url = `${globalSetting.URL_API}/staffs?`;
		if (keyword) {
			url += `keyword=${keyword}&`;
		}
		if (roleFilter) {
			url += `role=${roleFilter}&`;
		}
		url += `page=${page}&limit=${limit}&sort=fullName&order=${sortOrder}`;
		const res = await axiosClient.get(url)
		return res.data.data
	}
	const getStaff = useQuery({
		queryKey: ['staffs', page, keyword, sortOrder, roleFilter, roleFilter],
		queryFn: fetchStafff
	});
	// handleSortChange
	const handleSortChange = (e: RadioChangeEvent) => {
		setSortOrder(e.target.value);
	};
	// Hàm xử lý khi thay đổi filter role
	const handleRoleFilterChange = (value: string | null) => {
		setRoleFilter(value);
		navigate(`/staffs${value ? `?role=${value}` : ''}`);
	};
	//============== delete find id ============= //
	const queryClient = useQueryClient();
	const fetchDeleteStaff = async (id: string) => {
		const url = `${globalSetting.URL_API}/staffs/${id}`;
		const res = await axiosClient.delete(url);
		return res.data.data;
	}
	const deleteStaff = useMutation({
		mutationFn: fetchDeleteStaff,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['staffs', page]
			});
			message.success('Xoá thành công!');
		},
		onError: () => {
			message.error('Xoá lỗi !');
		},
	})
	//============== add staff ============= //
	const [isModalAddOpen, setIsModalAddOpen] = useState(false);
	const [formAdd] = Form.useForm();
	const fetchCreateStaff = async (payload: TypeStaff) => {
		const url = `${globalSetting.URL_API}/staffs`;
		const res = await axiosClient.post(url, payload);
		return res.data.data;
	}
	const createMutationStaff = useMutation({
		mutationFn: fetchCreateStaff,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['staffs', page]
			})
			message.success('Thêm thành công !');
			// close modal
			setIsModalAddOpen(false);
			// clear data tu form
			formAdd.resetFields();
		},
		onError: () => {
			message.error('Thêm lỗi !');
		}
	})
	const showModalAdd = () => {
		setIsModalAddOpen(true);
	};
	const handleOkAdd = () => {
		formAdd.submit();
	};
	const handleCancelAdd = () => {
		setIsModalAddOpen(false);
	};

	const onFinishAdd: FormProps<TypeStaff>['onFinish'] = (values) => {
		// goi ham api de xu ly add 
		// khi dung mutate nó sẽ ánh xạ lại hàm trên
		createMutationStaff.mutate(values)
	};

	const onFinishFailedAdd: FormProps<TypeStaff>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};
	// lấy role mặc định
	const getDefaultRole = () => {
		if (user?.role.includes(EnumRole.USER)) {
			return EnumRole.VIEWER;
		}
		return undefined;
	};
	//============== update staff ============= //
	const [isModalEditOpen, setIsModalEditOpen] = useState(false);
	const [formUpdate] = Form.useForm();
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const fetchUpdateStaff = async (payload: TypeStaff) => {
		const { _id, ...params } = payload;
		const url = `${globalSetting.URL_API}/staffs/${_id}`;
		const res = await axiosClient.put(url, params);
		return res.data.data;
	}
	const updateMutationStaff = useMutation({
		mutationFn: fetchUpdateStaff,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['staffs', page]
			});
			message.success('Cập nhật thành công !');
			// đóng modal
			setIsModalEditOpen(false);
			// clear data từ form
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
		//submit === ok modal
		formUpdate.submit();
	};
	const handleCancelEdit = () => {
		setIsModalEditOpen(false);
		setShowPasswordForm(false);
	};

	const onFinishEdit: FormProps<TypeStaff>['onFinish'] = async (values) => {
		// gọi api để cập nhật staff
		updateMutationStaff.mutate(values);
	};

	const onFinishFailedEdit: FormProps<TypeStaff>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};
	//============== search staff ============= //
	const [formSearch] = Form.useForm();
	const [clientReadySearch, setClientReadySearch] = useState(false);
	const onFinishSearch: FormProps<TypeStaff>['onFinish'] = (values) => {
		// cập nhập lại url
		const params = new URLSearchParams();
		// duyệt qua từng cặp key -value trong object
		for (const [key, value] of Object.entries(values)) {
			if (value !== undefined && value !== '') {
				params.append(key, String(value));
			}
		}
		const searchString = params.toString();
		navigate(`/staffs?${searchString}`);
	}
	const onFinishFailedSearch: FormProps<TypeStaff>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	}
	const handleInputChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setClientReadySearch(value.length > 0); // Hiện nút khi có giá trị
		// Điều hướng đến /staffs nếu input rỗng
		if (value.length === 0) {
			navigate(`/staffs`);
		}
	};
	// phân quyền, lấy user từ hook useAuth
	const { user } = useAuth();
	// render role với màu sắc tương ứng
	const renderRole = (role: string) => {
		let color = '';
		let label = '';

		switch (role) {
			case EnumRole.ADMIN:
				color = 'red';
				label = 'ADMIN';
				break;
			case EnumRole.USER:
				color = 'blue';
				label = 'USER';
				break;
			case EnumRole.VIEWER:
				color = 'green';
				label = 'VIEWER';
				break;
			default:
				color = 'default';
				label = role;
		}

		return <Tag color={color}>{label}</Tag>;
	};
	// columns
	const columns: TableProps<TypeStaff>['columns'] = [
		{
			title: 'Tên Người Dùng',
			dataIndex: 'fullName',
			key: 'fullName',
		},
		{
			title: 'Số Điện Thoại',
			dataIndex: 'phone',
			key: 'phone',
		},
		{
			title: 'Email',
			key: 'email',
			dataIndex: 'email',
		},
		{
			title: 'Quyền',
			key: 'role',
			dataIndex: 'role',
			render: (role: string) => renderRole(role)
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
		columns.push({
			title: 'Hành Động',
			key: 'action',
			render: (_, record) => (
				<Space size="middle">
					<Button
						type="primary"
						shape="circle"
						className='common_button'
						icon={<AiOutlineEdit />}
						onClick={() => {
							// hiện modal 
							showModalEdit();
							// lấy thông tin của record đổ vào form
							formUpdate.setFieldsValue(record)
						}}
					></Button>
					{/* admin có quyền xoá */}
					{user?.role.includes(EnumRole.ADMIN) && (
						<Popconfirm
							title="Xoá nhân viên"
							description="Bạn có muốn xoá nhân viên này đúng không?"
							onConfirm={() => {
								deleteStaff.mutate(record._id);
							}}
							okText="Yes"
							cancelText="No"
						>
							<Button
								type="primary"
								shape="circle"
								icon={<AiOutlineDelete />}
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
				<Button
					type="primary"
					icon={<AiOutlinePlus />}
					onClick={showModalAdd}
					className='common_button btn_add'
				>
					Thêm nhân viên
				</Button>
			);
		}
		return null;
	};
	// Thêm role options cho form
	const getRoleOptions = () => {
		if (user?.role.includes(EnumRole.ADMIN)) {
			return [
				{ label: 'Admin', value: EnumRole.ADMIN },
				{ label: 'User', value: EnumRole.USER },
				{ label: 'Viewer', value: EnumRole.VIEWER }
			];
		} else if (user?.role.includes(EnumRole.USER)) {
			return [
				{ label: 'User', value: EnumRole.USER },
				{ label: 'Viewer', value: EnumRole.VIEWER }
			];
		}
		return [];
	};
	return (
		<>
			<div className="box_heading">
				<h2>DANH SÁCH NHÂN VIÊN</h2>
				<Form
					form={formSearch}
					name="staff_search_form"
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
						<Input onChange={handleInputChangeSearch} placeholder="Tìm kiếm theo tên hoặc email hoặc số điện thoại" />
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
									navigate(`/staffs`)
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
				<p>Sắp xếp: </p>
				<Radio.Group onChange={handleSortChange} value={sortOrder}>
					<Space direction="horizontal">
						<Radio.Button value="DESC">A-Z</Radio.Button>
						<Radio.Button value="ASC">Z-A</Radio.Button>
					</Space>
				</Radio.Group>
				<p>Lọc: </p>
				<Select
					style={{ width: 200 }}
					placeholder="Lọc theo role"
					allowClear
					onChange={handleRoleFilterChange}
					options={[
						{ value: EnumRole.ADMIN, label: 'Admin' },
						{ value: EnumRole.USER, label: 'User' },
						{ value: EnumRole.VIEWER, label: 'Viewer' }
					]}
				/>

			</Flex>
			<Table
				columns={columns}
				dataSource={getStaff?.data?.staffs_list || []}
				rowKey={(record) => record._id} // Chỉ định _id làm row key
				pagination={false} />
			<Pagination
				className='pagination_page'
				defaultCurrent={1}
				current={page}
				pageSize={limit}
				align='center'
				total={getStaff?.data?.pagination.totalRecords || 0}
				onChange={(page) => {
					// Điều hướng với page mới
					if (page !== 1) {
						navigate(`/staffs?page=${page}`);
					} else {
						navigate('/staffs');
					}
				}}
			/>;
			{/* modal edit */}
			<Modal
				title="CẬP NHẬT NHÂN VIÊN"
				open={isModalEditOpen}
				onOk={handleOkEdit}
				onCancel={handleCancelEdit}
				className='box_modal'
				okText="CẬP NHẬT"
				cancelText="HUỶ"
			>
				<Form
					name="staff_edit_form"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={onFinishEdit}
					onFinishFailed={onFinishFailedEdit}
					autoComplete="off"
					form={formUpdate}
				>
					<Form.Item<TypeStaff>
						label="id"
						name="_id"
						hidden={true}
					>
						<Input type="hidden" />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Tên Người Dùng"
						name="fullName"
						hasFeedback
						rules={[
							{ required: true, message: "Vui lòng nhập họ và tên" },
							{ min: 5, message: "Tối thiểu 5 ký tự!" }
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Số Điện Thoại"
						name="phone"
						hasFeedback
						rules={[
							{ pattern: /^[0-9]{10}$/, required: true, message: "Số điện thoại phải 10 số!" },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Email"
						name="email"
						hasFeedback
						rules={[
							{ type: 'email', required: true, message: "Email phải đúng định dạng @" },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Quyền"
						name="role"
					>
						<Select
							options={getRoleOptions()}
							disabled={!user?.role.includes(EnumRole.ADMIN)}
						/>
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Trạng Thái"
						name="active"
					>
						<Switch
							checkedChildren={<CheckOutlined />}
							unCheckedChildren={<CloseOutlined />}
							defaultChecked
						/>
					</Form.Item>
					{/* đổi mật khẩu */}
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button
							type="link"
							onClick={() => setShowPasswordForm(!showPasswordForm)}
						>
							{showPasswordForm ? 'Huỷ đổi mật khẩu' : 'Đổi mật khẩu'}
						</Button>
					</Form.Item>
					{showPasswordForm && (
						<Form.Item
							label="Mật khẩu mới"
							name="password"
							rules={[
								{ required: showPasswordForm, message: 'Vui lòng nhập mật khẩu mới!' },
							]}
						>
							<Input.Password />
						</Form.Item>
					)}
				</Form>
			</Modal>
			{/* modal add  */}
			<Modal
				title="THÊM NHÂN VIÊN"
				open={isModalAddOpen}
				onOk={handleOkAdd}
				onCancel={handleCancelAdd}
				className='box_modal'
				okText="Thêm mới"
				cancelText="Huỷ"
			>
				<Form
					name="staff_add_form"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={onFinishAdd}
					onFinishFailed={onFinishFailedAdd}
					autoComplete="off"
					form={formAdd}
					initialValues={{  // Thêm initialValues
						role: getDefaultRole(),
						active: true
					}}
				>
					<Form.Item<TypeStaff>
						label="Tên Người Dùng"
						name="fullName"
						hasFeedback
						rules={[
							{ required: true, message: "Vui lòng nhập họ và tên" },
							{ min: 5, message: "Tối thiểu 5 ký tự!" }
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Mật Khẩu"
						name="password"
						hasFeedback
						rules={[
							{ required: true, message: 'Vui lòng nhập password!' },
							{ min: 8, message: 'mật khẩu tối thiểu phải 8 ký tự', },
						]}

					>
						<Input.Password />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Số Điện Thoại"
						name="phone"
						hasFeedback
						rules={[
							{ pattern: /^[0-9]{10}$/, required: true, message: "Số điện thoại phải 10 số!" },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Email"
						name="email"
						hasFeedback
						rules={[
							{ type: 'email', required: true, message: "Email phải đúng định dạng @" },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Quyền"
						name="role"
					>
						<Select
							options={getRoleOptions()}
							disabled={user?.role.includes(EnumRole.VIEWER)}
						/>
					</Form.Item>
					<Form.Item<TypeStaff>
						label="Trạng Thái"
						name="active"
					>
						<Switch
							checkedChildren={<CheckOutlined />}
							unCheckedChildren={<CloseOutlined />}
							defaultChecked
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default Staffs
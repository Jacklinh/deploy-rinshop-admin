import { FaBasketShopping,FaBoxOpen,FaUser,FaMoneyBill } from "react-icons/fa6";
import { globalSetting } from "../constants/configs";
import { axiosClient } from "../library/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, DatePicker, Input, Space, Table, Tag } from "antd";
import { TableProps } from "antd";
import { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
interface OrderTypeDashboard {
    _id: string;
    order_code: string;
    customer: {
        fullName: string;
        email: string;
        phone: string;
    };
    total_amount: number;
    status: number;
    createdAt: string;
}
interface InventoryData {
	name: string;
	value: number;
  }
const DashboardPage = () => {
  // get dashboard total
  const fetchDashboardTotal = async () => {
    const url = `${globalSetting.URL_API}/dashboard`
    const res = await axiosClient.get(url)
    return res.data.data
  }
  const getDashboardTotal = useQuery({
    queryKey: ['dashboard-total'],
    queryFn: fetchDashboardTotal
  }) 
  // get đơn hàng gần đây
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const fetchRecentOrders = async () => {
	const url = `${globalSetting.URL_API}/dashboard/recent-orders?page=${currentPage}&limit=5`;
	const params = new URLSearchParams();
	if (selectedDate) {
		params.append('date', selectedDate);
	}
	if (searchKeyword) {
		params.append('keyword', searchKeyword);
	}
	const finalUrl = `${url}&${params.toString()}`;
	const res = await axiosClient.get(finalUrl);
    return res.data.data
  }
  const getRecentOrders = useQuery({
	queryKey: ['recent-orders', selectedDate, searchKeyword, currentPage],
	queryFn: fetchRecentOrders
  })
  // Hàm xử lý khi chọn ngày
  const handleDateChange = (_: Date | null, dateString: string | string[]) => {
	setSelectedDate(dateString as string);
	setCurrentPage(1); // Reset về trang 1 khi filter
};
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
  const columns: TableProps<OrderTypeDashboard>['columns'] = [
	{
		title: 'Mã đơn hàng',
		dataIndex: 'order_code',
		key: 'order_code',
		width: 200,
	},
	{
		title: 'Khách Hàng',
		dataIndex: ['customer', 'fullName'],
		width: 200,
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
		title: 'Tổng Tiền',
		key: 'total',
		render: (_, record) => {
			const total = record.total_amount || 0;
			return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
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
// quản lý hàng tồn kho
const fetchInventory = async () => {
  const url = `${globalSetting.URL_API}/dashboard/inventory`
  const res = await axiosClient.get(url)
  return res.data.data
}
const getInventory = useQuery({
  queryKey: ['inventory'],
  queryFn: fetchInventory
})
// Cấu hình màu sắc cho biểu đồ
const COLORS = ['#2ecc71', '#e74c3c', '#f1c40f'];
  
// Dữ liệu cho biểu đồ
const inventoryData = [
  { name: 'Còn hàng', value: getInventory.data?.inStock || 0 },
  { name: 'Hết hàng', value: getInventory.data?.outOfStock || 0 },
  { name: 'Sắp hết hàng', value: getInventory.data?.lowStock || 0 }
];

// Custom label cho biểu đồ
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const RADIAN = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
	<text 
	  x={x} 
	  y={y} 
	  fill="white" 
	  textAnchor={x > cx ? 'start' : 'end'} 
	  dominantBaseline="central"
	>
	  {`${(percent * 100).toFixed(0)}%`}
	</text>
  );
};
	return (
		<div className="dashboard_page">
			{/* thống kê tổng */}
			<div className="dashboard_list">
				<div className="dashboard_col">
					<div className="dashboard_item" style={{borderBottom: "4px solid green"}}>
						<div className="dashboard_icon">
							<FaBasketShopping />
						</div>
						<div className="dashboard_info">
							<span className="dashboard_title">Tổng số đơn hàng</span>
							<span className="dashboard_value">{getDashboardTotal.data?.totalOrders}</span>
						</div>
					</div>
				</div>
        <div className="dashboard_col">
					<div className="dashboard_item" style={{borderBottom: "4px solid yellow"}}>
						<div className="dashboard_icon">
							<FaBoxOpen />
						</div>
						<div className="dashboard_info">
							<span className="dashboard_title">Tổng sản phẩm</span>
							<span className="dashboard_value">{getDashboardTotal.data?.totalProducts}</span>
						</div>
					</div>
				</div>
        <div className="dashboard_col">
					<div className="dashboard_item" style={{borderBottom: "4px solid orange"}}>
						<div className="dashboard_icon">
							<FaUser />
						</div>
						<div className="dashboard_info">
							<span className="dashboard_title">Tổng số khách hàng</span>
							<span className="dashboard_value">{getDashboardTotal.data?.totalCustomers}</span>
						</div>
					</div>
				</div>
        <div className="dashboard_col">
					<div className="dashboard_item" style={{borderBottom: "4px solid red"}}>
						<div className="dashboard_icon">
							<FaMoneyBill />
						</div>
						<div className="dashboard_info">
							<span className="dashboard_title">Tổng doanh thu</span>
							<span className="dashboard_value">{ getDashboardTotal.data?.totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
						</div>
					</div>
				</div>
			</div>
			{/* đơn hàng gần đây */}
			<Card 
				title="Đơn hàng gần đây" 
				style={{ marginTop: 20 }}
				extra={
					<Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
					  <DatePicker 
						onChange={handleDateChange}
						format="YYYY-MM-DD"
						allowClear
						placeholder="Tìm đơn hàng theo ngày"
						style={{ width: 200 }}
					  />
					  <Input
						placeholder="Tìm kiếm đơn hàng, tên khách hàng, email, số điện thoại"
						allowClear
						onChange={(e) => setSearchKeyword(e.target.value)}
						style={{ width: 400 }}
						
					  />	
					</Space>
				  }
			>
                <Table
                    columns={columns}
                    dataSource={getRecentOrders.data?.orders_list}
                    loading={getRecentOrders.isLoading}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        total: getRecentOrders.data?.pagination.totalRecords,
                        pageSize: 5,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false
                    }}
                />
				
            </Card>
			{/* quản lý hàng tồn kho */}
			<Card 
        title="Quản lý hàng tồn kho" 
        style={{ marginTop: 20 }}
        extra={
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <strong>Tổng sản phẩm: </strong>
              {getInventory.data?.totalProducts || 0}
            </div>
            <div>
              <strong>Tổng số lượng: </strong>
              {getInventory.data?.totalQuantity || 0}
            </div>
          </div>
        }
      >
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inventoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {inventoryData.map((_: InventoryData, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} sản phẩm`, '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: string) => {
                  const item = inventoryData.find(d => d.name === value);
                  return `${value} (${item?.value || 0} sản phẩm)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Thêm bảng thống kê chi tiết */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: '40px' }}>
          {inventoryData.map((item, index) => (
            <div 
              key={item.name}
              style={{ 
                padding: '15px 25px',
                borderRadius: 8,
                backgroundColor: `${COLORS[index]}20`,
                border: `1px solid ${COLORS[index]}`
              }}
            >
              <div style={{ color: COLORS[index], fontWeight: 'bold', fontSize: 16 }}>
                {item.name}
              </div>
              <div style={{ marginTop: 5, fontSize: 20, fontWeight: 'bold' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
		</div>
	)
}

export default DashboardPage
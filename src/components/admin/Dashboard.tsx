import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Lấy đơn hàng từ API
        let apiOrders: Order[] = [];
        try {
          const response = await axios.get('http://localhost:3000/orders');
          apiOrders = response.data;
        } catch (apiError) {
          console.error('Lỗi khi lấy đơn hàng từ API:', apiError);
        }
        
        // Lấy đơn hàng từ localStorage (được lưu từ Checkout.tsx)
        let localOrders: Order[] = [];
        try {
          const storedOrders = localStorage.getItem('orders');
          if (storedOrders) {
            localOrders = JSON.parse(storedOrders);
          }
        } catch (localError) {
          console.error('Lỗi khi lấy đơn hàng từ localStorage:', localError);
        }
        
        // Kết hợp đơn hàng từ cả hai nguồn
        // Loại bỏ trùng lặp bằng cách sử dụng Map
        const orderMap = new Map<number, Order>();
        
        // Thêm đơn hàng từ API
        apiOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        // Thêm đơn hàng từ localStorage (sẽ ghi đè nếu trùng ID)
        localOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        // Chuyển đổi Map thành mảng và sắp xếp theo thời gian tạo (mới nhất lên đầu)
        const combinedOrders = Array.from(orderMap.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(combinedOrders);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu đơn hàng');
        setLoading(false);
        console.error('Lỗi khi lấy đơn hàng:', err);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on selected time range
  const getFilteredOrders = () => {
    if (timeRange === 'all') {
      return orders;
    }

    const now = new Date();
    let startDate = new Date();

    if (timeRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  };

  const filteredOrders = getFilteredOrders();

  // Calculate total revenue
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate total number of orders
  const totalOrders = filteredOrders.length;

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Count orders by status
  const ordersByStatus = filteredOrders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Handle time range change
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  // Generate monthly revenue data for chart
  const getMonthlyRevenueData = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlyData = Array(12).fill(0);
    const currentMonth = new Date().getMonth();

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= oneYearAgo) {
        // Calculate the index in our array (0-11)
        // If current month is April (3), then April last year should be at index 0,
        // May at index 1, and so on until current April at index 11
        let monthIndex = (orderDate.getMonth() - currentMonth - 1 + 12) % 12;
        monthlyData[monthIndex] += order.totalAmount;
      }
    });

    return monthlyData;
  };

  const monthlyRevenue = getMonthlyRevenueData();
  const maxMonthlyRevenue = Math.max(...monthlyRevenue);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  // Get month names for the last 12 months
  const getMonthNames = () => {
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const currentMonth = new Date().getMonth();
    
    return Array(12).fill(0).map((_, index) => {
      const monthIndex = (currentMonth - 11 + index + 12) % 12;
      return months[monthIndex];
    });
  };

  const monthNames = getMonthNames();

  // Translate status to Vietnamese
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    
    return statusMap[status] || status;
  };

  // Thêm hàm để cập nhật trạng thái đơn hàng
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // Cố gắng cập nhật trên API
      try {
        await axios.patch(`http://localhost:3000/orders/${orderId}`, { status: newStatus });
      } catch (apiError) {
        console.error('Không thể cập nhật trạng thái trên API:', apiError);
      }
      
      // Cập nhật trạng thái trong state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Cập nhật trạng thái trong localStorage
      try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const localOrders = JSON.parse(storedOrders);
          const updatedLocalOrders = localOrders.map((order: Order) => 
            order.id === orderId ? { ...order, status: newStatus } : order
          );
          localStorage.setItem('orders', JSON.stringify(updatedLocalOrders));
        }
      } catch (localError) {
        console.error('Không thể cập nhật trạng thái trong localStorage:', localError);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    }
  };

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-semibold mb-6">Bảng điều khiển</h1>

      {/* Time range filter */}
      <div className="mb-6">
        <label htmlFor="timeRange" className="mr-2 font-medium">Khoảng thời gian:</label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={handleTimeRangeChange}
          className="border rounded p-2"
        >
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="year">Năm qua</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm uppercase">Tổng doanh thu</h2>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
          <p className="text-gray-600 text-sm mt-2">
            {timeRange === 'all' ? 'Tất cả thời gian' : 
             timeRange === 'today' ? 'Hôm nay' : 
             timeRange === 'week' ? '7 ngày qua' :
             timeRange === 'month' ? '30 ngày qua' : 'Năm qua'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm uppercase">Tổng đơn hàng</h2>
          <p className="text-3xl font-bold mt-2">{totalOrders}</p>
          <p className="text-gray-600 text-sm mt-2">
            {timeRange === 'all' ? 'Tất cả thời gian' : 
             timeRange === 'today' ? 'Hôm nay' : 
             timeRange === 'week' ? '7 ngày qua' :
             timeRange === 'month' ? '30 ngày qua' : 'Năm qua'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm uppercase">Giá trị đơn hàng trung bình</h2>
          <p className="text-3xl font-bold mt-2">{formatCurrency(averageOrderValue)}</p>
          <p className="text-gray-600 text-sm mt-2">
            {timeRange === 'all' ? 'Tất cả thời gian' : 
             timeRange === 'today' ? 'Hôm nay' : 
             timeRange === 'week' ? '7 ngày qua' :
             timeRange === 'month' ? '30 ngày qua' : 'Năm qua'}
          </p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng (12 tháng qua)</h2>
        <div className="h-64 flex items-end space-x-2">
          {monthlyRevenue.map((revenue, index) => {
            const height = maxMonthlyRevenue > 0 ? (revenue / maxMonthlyRevenue) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t" 
                  style={{ height: `${height}%` }}
                  title={formatCurrency(revenue)}
                ></div>
                <div className="text-xs mt-1 text-gray-600">{monthNames[index]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders by status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Đơn hàng theo trạng thái</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="capitalize font-medium">{translateStatus(status)}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Mã đơn hàng</th>
                <th className="py-2 px-4 text-left">Ngày</th>
                <th className="py-2 px-4 text-left">Trạng thái</th>
                <th className="py-2 px-4 text-right">Số tiền</th>
                <th className="py-2 px-4 text-left">Số sản phẩm</th>
                <th className="py-2 px-4 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b">
                  <td className="py-2 px-4">{order.id}</td>
                  <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 capitalize">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border rounded px-2 py-1 bg-gray-50"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipped">Đã gửi hàng</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 text-right">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-2 px-4">{order.items.length} sản phẩm</td>
                  <td className="py-2 px-4">
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => alert(`Chi tiết đơn hàng #${order.id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
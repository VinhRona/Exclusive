import React, { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/Cart";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = () => {
    // Reset error message
    setCheckoutError("");
    
    // Check if cart is empty
    if (cartItems.length === 0) {
      setCheckoutError("Không thể thanh toán vì giỏ hàng trống");
      return;
    }
    
    // Check if subtotal is 0 or negative
    if (subtotal <= 0) {
      setCheckoutError("Tổng giá trị đơn hàng phải lớn hơn 0");
      return;
    }

    if (!currentUser) {
      // Redirect to login if not logged in
      navigate("/asm/login?redirectTo=/asm/checkout");
    } else {
      // Proceed to checkout
      navigate("/asm/checkout");
    }
  };

  // Fixed shipping cost: 15,000 VND
  const shipping = cartItems.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  // Format price for display
  const formatPrice = (price: number) => {
    // Check if price is small (likely stored in thousands)
    if (price < 1000 && price > 0) {
      // Assume this is in thousands (e.g., 69 should be 69,000)
      price = price * 1000;
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ Hàng</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 mb-6">Giỏ hàng của bạn đang trống</p>
          <Link 
            to="/asm/home" 
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cart Items */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4">Sản phẩm</th>
                    <th className="text-center p-4">Đơn giá</th>
                    <th className="text-center p-4">Số lượng</th>
                    <th className="text-center p-4">Thành tiền</th>
                    <th className="text-center p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded mr-4" 
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">{formatPrice(item.price)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 border rounded-l"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 border-t border-b">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 border rounded-r"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-center">
                          <span className="text-red-500 font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6">
              <Link 
                to="/asm/home" 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Tiếp tục mua sắm
              </Link>
              <button 
                onClick={clearCart}
                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
              >
                Xóa giỏ hàng
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-6">Tổng Thanh Toán</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatPrice(total)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 text-right">
                    (Đã bao gồm VAT nếu có)
                  </p>
                </div>
              </div>
              
              {checkoutError && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm">
                  {checkoutError}
                </div>
              )}
              
              <button 
                onClick={handleCheckout}
                className={`w-full mt-6 ${total <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white py-2 rounded-md transition`}
                disabled={total <= 0}
              >
                Tiến hành đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

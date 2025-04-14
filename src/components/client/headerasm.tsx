import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHeart, faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/react.svg'
import { useAuth } from "../../context/AuthContext";

const HeaderAsm = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search submitted with query:", searchQuery);
    if (searchQuery.trim()) {
      navigate(`/asm/home?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/asm/home");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="bg-white shadow-md">
      
      <div className="bg-black text-white text-sm py-2 flex justify-between items-center px-10">
        <p className="pl-96">
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!  
          <a href="#" className="font-bold underline ml-2 hover:text-gray-300">ShopNow</a>
        </p>

        {/* Dropdown chọn ngôn ngữ */}
        <div className="flex items-center space-x-0 mr-20">
         
          <select className="bg-black text-white p-1 rounded cursor-pointer">
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>

      {/* Header chính */}
      <div className="flex justify-between items-center px-10 py-4">
        {/* Logo hoặc tiêu đề */}
        <div className="text-black pl-20 text-xl font-bold">
          <Link to="/asm/home">Exclusive</Link>
        </div>

        {/* Thanh điều hướng */}
        <nav className="space-x-16 hidden md:flex mr-15 " >
          <Link to="/asm/home" className="hover:underline text-black">
            Home
          </Link>
          <Link to="/asm/cart" className="hover:underline text-black">
            Cart
          </Link>
          <a href="#" className="hover:underline text-black">Contact</a>
          <a href="#" className="hover:underline text-black">About</a>
          
          {!currentUser ? (
            <>
              <Link to="/asm/login" className="hover:underline text-black">
                Login
              </Link>
              <Link to="/asm/register" className="hover:underline text-black">
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <FontAwesomeIcon icon={faUser} className="text-black" />
                <span className="text-black">{currentUser.name || currentUser.email}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {isAdmin && (
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link 
                    to="/asm/checkout" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Ô tìm kiếm + icon giỏ hàng */}
        <div className="flex space-x-6 items-center mr-20">
          <form onSubmit={handleSearch} className="relative w-60 hidden md:block">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              className="bg-gray-100 p-2 pl-2 w-full rounded-lg text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer border-none bg-transparent">
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor' className='w-5 h-5'>
                <path strokeLinecap='round' strokeLinejoin='round' d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z' />
              </svg>
            </button>
          </form>
          <FontAwesomeIcon icon={faHeart} className="text-black text-xl cursor-pointer hover:text-red-500 transition duration-200" />
          <Link to="/asm/cart">         
             <FontAwesomeIcon icon={faShoppingCart} className="text-black text-xl cursor-pointer hover:text-gray-500 transition duration-200" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderAsm;

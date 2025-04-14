import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const { login, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from URL query parameters (if any)
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirectTo') || '';

  // If already logged in, redirect accordingly
  useEffect(() => {
    if (currentUser) {
      if (isAdmin) {
        navigate('/dashboard');
      } else if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/asm/home');
      }
    }
  }, [currentUser, isAdmin, navigate, redirectTo]);

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    // Email validation
    if (!email) {
      setEmailError("Email không được để trống");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Vui lòng nhập email hợp lệ");
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const { success, isAdmin, message } = await login(email, password);
      
      if (success) {
        if (isAdmin) {
          navigate('/dashboard');
        } else if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate('/asm/home');
        }
      } else {
        setError(message || "Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center mt-10">
      <div className="flex overflow-hidden w-[2100px]">
        
        <div className="w-[900px] h-[800px]">
          <img src="/img/login.jpg" alt="Shopping Login" className="w-full h-full object-cover" />
        </div>

        <div className="w-[500px] p-10 flex flex-col justify-center pl-[160px]">
          <h2 className="text-3xl font-semibold mb-2">Đăng nhập</h2>
          <p className="text-gray-500 mb-6 text-sm">Nhập thông tin của bạn bên dưới</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-2 border-b ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:border-black`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Mật khẩu"
                className={`w-full px-4 py-2 border-b ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:border-black`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition disabled:bg-gray-400"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="text-right mt-2">
              <a href="#" className="text-red-500 text-sm hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Bạn chưa có tài khoản?{" "}
              <Link to="/asm/register" className="text-red-500 hover:underline">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

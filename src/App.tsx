import React, { useEffect } from 'react'
import { useRoutes, Navigate, useNavigate, useLocation } from 'react-router-dom'

import ClientAsm from './layout/clienasm1'
import ClienHome from './asm1/trangchu'
import Detail from './asm1/Detail'
import Cart from './asm1/Cart'
import Login from './asm1/Login'
import Register from './asm1/Register'
import NotFound from './asm1/Notfound'
import ProductList from './components/admin/productlist'
import ProductAdd from './components/admin/productadd'
import ProductEdit from './components/admin/productedit'
import UserList from './components/admin/userlist'

import AdminLayout from './layout/admin'
import CategoryList from './components/admin/categorylist'
import CategoryAdd from './components/admin/categoryadd'
import CategoryEdit from './components/admin/categoryedit'
import { AuthProvider, useAuth } from './context/AuthContext'
import Checkout from './asm1/Checkout'
import Dashboard from './components/admin/Dashboard'
import CartProvider from './context/Cart'

// Protected route component for admin access
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && !currentUser) {
      // Redirect to login with return URL if not logged in
      navigate(`/asm/login?redirectTo=${encodeURIComponent(location.pathname)}`);
    } else if (!isLoading && currentUser && !isAdmin) {
      // Redirect to home if logged in but not admin
      navigate('/asm/home');
      alert('Access denied. Admin privileges required.');
    }
  }, [currentUser, isAdmin, isLoading, navigate, location]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!currentUser || !isAdmin) {
    return null; // Will be redirected by the useEffect
  }
  
  return <>{children}</>;
};

// Protected route component for regular user access
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && !currentUser) {
      // Redirect to login with return URL
      navigate(`/asm/login?redirectTo=${encodeURIComponent(location.pathname)}`);
    }
  }, [currentUser, isLoading, navigate, location]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    return null; // Will be redirected by the useEffect
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const routes = useRoutes([
    {
      path:"/asm",
      element:<ClientAsm/>,
      children:[
        {path:"", element: <Navigate to="/asm/home" />},
        {path:"home",element:<ClienHome/>},
        {path:"detail/:id",element:<Detail/>},
        {path:"cart",element:<Cart/>},
        {path:"checkout", element: 
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        },
        {path:"login",element:<Login/>},
        {path:"register",element:<Register/>},
        {path:"*",element:<NotFound/>},
      ]
    },
    {
      path:"/search", 
      element: <Navigate to="/asm/home" />
    },
    {
      path: "/dashboard", 
      element: 
        <AdminRoute>
          <AdminLayout/>
        </AdminRoute>, 
      children:[
        {path: "", element: <Dashboard/>}, // Dashboard with statistics
        {path: "products", element: <ProductList/>},
        {path: "products/add", element: <ProductAdd/>},
        {path: "products/edit/:id", element: <ProductEdit/>},
        {path: "category", element: <CategoryList/>},
        {path: "category/add", element: <CategoryAdd/>},
        {path: "category/edit/:id", element: <CategoryEdit/>},
        {path: "users", element: <UserList/>}
      ]
    },
    {
      path: "/",
      element: <Navigate to="/asm/home" />
    }
  ]);
  
  return routes;
}

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App
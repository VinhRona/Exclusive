"use client"

import { DashboardFilled, FileTextFilled, HighlightFilled, ProductFilled, AppstoreFilled, UserOutlined } from "@ant-design/icons"
import { Menu, type MenuProps } from "antd"
import { useNavigate } from "react-router-dom"

const AdminSidebar = () => {
  type MenuItem = Required<MenuProps>["items"][number]
  const navigate = useNavigate()
  const items: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardFilled />,
    },
    {
      key: "productmanage",
      label: "Quản lý sản phẩm",
      icon: <ProductFilled />,
      children: [
        { key: "productlist", label: "Danh sách sản phẩm" },
        { key: "productadd", label: "Thêm sản phẩm" },
      ],
    },
    {
      key: "categorymanage",
      label: "Quản lý danh mục",
      icon: <AppstoreFilled />,
      children: [
        { key: "categorylist", label: "Danh sách danh mục" },
        { key: "categoryadd", label: "Thêm danh mục" },
      ],
    },
    {
      key: "variant",
      label: "Quản lý thuộc tính",
      icon: <HighlightFilled />,
      children: [
        { key: "variantlist", label: "Thuộc tính" },
        { key: "variantadd", label: "Thêm thuộc tính" },
      ],
    },
    {
      key: "usermanage",
      label: "Quản lý người dùng",
      icon: <UserOutlined />,
      children: [
        { key: "userlist", label: "Danh sách người dùng" },
      ],
    },
    {
      key: "report",
      label: "Thống kê",
      icon: <FileTextFilled />,
    },
  ]
  const onClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/dashboard")
        break
      case "productlist":
        navigate("/dashboard/products")
        break
      case "productadd":
        navigate("/dashboard/products/add")
        break
      case "categorylist":
        navigate("/dashboard/category")
        break
      case "categoryadd":
        navigate("/dashboard/category/add")
        break
      case "variantlist":
        navigate("/dashboard/variant")
        break
      case "userlist":
        navigate("/dashboard/users")
        break
      case "report":
        navigate("/dashboard")
        break
      default:
        navigate("/dashboard")
        break
    }
  }
  return (
    <div className="w-1/5 h-screen bg-white">
      <Menu
        onClick={onClick}
        style={{ width: "100%" }}
        defaultSelectedKeys={["dashboard"]}
        mode="inline"
        items={items}
      />
    </div>
  )
}

export default AdminSidebar


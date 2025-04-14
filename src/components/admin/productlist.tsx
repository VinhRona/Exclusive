"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { IProduct } from "../../interface/product"
import axios from "axios"
import { Link } from "react-router-dom"

const ProductList = () => {
  const { data, isLoading } = useQuery<IProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        // Use _expand to get category information with each product
        const { data: products } = await axios.get("http://localhost:3000/products?_expand=category")
        return products
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error)
        return []
      }
    },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await axios.delete(`http://localhost:3000/products/${id}`)
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error)
      }
    },
    onSuccess: () => {
      alert("Xóa thành công")
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  if (isLoading) {
    return <p className="text-center text-lg text-gray-500">Đang tải dữ liệu...</p>
  }

  const DelProduct = (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      mutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Danh sách sản phẩm</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-700 text-white text-center">
              <th className="border border-gray-300 px-4 py-2">STT</th>
              <th className="border border-gray-300 px-4 py-2 w-[120px]">Ảnh</th>
              <th className="border border-gray-300 px-4 py-2">Tên</th>
              <th className="border border-gray-300 px-4 py-2">Danh mục</th>
              <th className="border border-gray-300 px-4 py-2">Giá</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((product, index) => (
                <tr key={product.id} className="bg-white border border-gray-200 hover:bg-gray-100 transition">
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 flex justify-center">
                    <img
                      src={product.images || "/placeholder.svg"}
                      className="w-[80px] h-[80px] object-cover rounded-lg shadow-sm"
                      alt={product.name}
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.category ? product.category.name : "Không có danh mục"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-red-600 font-semibold text-center">
                    {product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "0 ₫"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Link
                      to={`/dashboard/products/edit/${product.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition mx-1"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => DelProduct(product.id!)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition mx-1"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductList


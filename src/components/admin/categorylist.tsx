"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ICategory } from "../../interface/category"
import axios from "axios"
import { Link } from "react-router-dom"
import { api } from "../../config/axios"

const CategoryList = () => {
  const { data, isLoading } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data: categories } = await api.get(`categories`)
        return categories
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error)
        return []
      }
    },
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await axios.delete(`http://localhost:3000/categories/${id}`)
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error)
      }
    },
    onSuccess: () => {
      alert("Xóa danh mục thành công")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  if (isLoading) {
    return <p className="text-center text-lg text-gray-500">Đang tải dữ liệu...</p>
  }

  const DelCategory = (id: number) => {
    if (confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
      mutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Danh sách danh mục</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-700 text-white text-center">
              <th className="border border-gray-300 px-4 py-2">STT</th>
              <th className="border border-gray-300 px-4 py-2">Tên danh mục</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((category, index) => (
                <tr key={category.id} className="bg-white border border-gray-200 hover:bg-gray-100 transition">
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{category.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Link
                      to={`/dashboard/category/edit/${category.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition mx-1"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => DelCategory(category.id!)}
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

export default CategoryList


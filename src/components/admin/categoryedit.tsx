"use client"

import { useEffect } from "react"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import type { ICategory } from "../../interface/category"

const CategoryEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ICategory>()
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Lấy dữ liệu danh mục từ API
  const { data, isLoading } = useQuery<ICategory>({
    queryKey: ["category", params.id],
    queryFn: async () => {
      const { data: category } = await axios.get(`http://localhost:3000/categories/${params.id}`)
      return category
    },
  })

  // Reset form với dữ liệu danh mục khi data thay đổi
  useEffect(() => {
    if (data) {
      reset(data)
    }
  }, [data, reset])

  // Mutation để cập nhật danh mục
  const mutation = useMutation({
    mutationFn: async (category: ICategory) => {
      try {
        const { data } = await axios.put(`http://localhost:3000/categories/${params.id}`, category)
        return data
      } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error)
      }
    },
    onSuccess: (response) => {
      alert("Cập nhật danh mục thành công!")
      console.log("Danh mục sau khi cập nhật:", response)

      // Cập nhật danh sách danh mục & danh mục hiện tại
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", params.id] })

      navigate("/dashboard/category")
    },
  })

  // Xử lý submit form
  const onSubmit = (category: ICategory) => {
    console.log("Dữ liệu gửi đi:", category)
    mutation.mutate(category)
  }

  if (isLoading) {
    return <p>Đang tải...</p>
  }

  return (
    <div>
      <h1 className="text-center text-xl font-bold my-4">Sửa danh mục</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto flex flex-col gap-3 p-4 border rounded-lg shadow-lg bg-white"
      >
        <label className="font-medium">Tên danh mục:</label>
        <input
          type="text"
          {...register("name", {
            required: "Tên danh mục không được bỏ trống",
          })}
          placeholder="Tên danh mục"
          className="border px-2 py-1 rounded w-full"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Cập nhật
        </button>
      </form>
    </div>
  )
}

export default CategoryEdit


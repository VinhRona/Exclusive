"use client"

import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import type { ICategory } from "../../interface/category"
import { useNavigate } from "react-router-dom"
import { api } from "../../config/axios"

const CategoryAdd = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ICategory>()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (category: ICategory) => {
      try {
        const { data } = await api.post(`categories`, category)
        return data
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: (response) => {
      alert("Thêm danh mục thành công!")
      console.log(response)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      navigate("/dashboard/category")
    },
  })

  const onSubmit = (category: ICategory) => {
    mutation.mutate(category)
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-semibold text-center mb-4">Thêm mới danh mục</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Nhập tên danh mục */}
        <div>
          <label className="block font-medium">Tên danh mục</label>
          <input
            type="text"
            {...register("name", {
              required: "Tên danh mục không được bỏ trống",
            })}
            placeholder="Nhập tên danh mục"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Nút thêm mới */}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all">
          Thêm danh mục
        </button>
      </form>
    </div>
  )
}

export default CategoryAdd;


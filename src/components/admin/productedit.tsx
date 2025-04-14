"use client"

import { useEffect } from "react"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import type { IProduct } from "../../interface/product"
import type { ICategory } from "../../interface/Category"

const ProductEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IProduct>()
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/categories")
        return data
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error)
        return []
      }
    },
  })

  // Lấy dữ liệu sản phẩm từ API
  const { data, isLoading } = useQuery<IProduct>({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const { data: product } = await axios.get(`http://localhost:3000/products/${params.id}`)
      return product
    },
  })

  // Reset form với dữ liệu sản phẩm khi data thay đổi
  useEffect(() => {
    if (data) {
      reset(data)
    }
  }, [data, reset])

  // Mutation để cập nhật sản phẩm
  const mutation = useMutation({
    mutationFn: async (product: IProduct) => {
      try {
        const { data } = await axios.put(`http://localhost:3000/products/${params.id}`, product)
        return data
      } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error)
      }
    },
    onSuccess: (response) => {
      alert("Cập nhật thành công!")
      console.log("Sản phẩm sau khi cập nhật:", response)

      // Cập nhật danh sách sản phẩm & sản phẩm hiện tại
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", params.id] })

      navigate("/dashboard/products")
    },
  })

  // Xử lý submit form
  const onSubmit = (product: IProduct) => {
    console.log("Dữ liệu gửi đi:", product)
    mutation.mutate(product)
  }

  if (isLoading) {
    return <p>Đang tải...</p>
  }

  return (
    <div>
      <h1 className="text-center text-xl font-bold my-4">Sửa sản phẩm</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto flex flex-col gap-3 p-4 border rounded-lg shadow-lg bg-white"
      >
        <label className="font-medium">Tên sản phẩm:</label>
        <input
          type="text"
          {...register("name", {
            required: "Tên không được bỏ trống",
          })}
          placeholder="Tên sản phẩm"
          className="border px-2 py-1 rounded w-full"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}

        {/* Chọn danh mục */}
        <label className="font-medium">Danh mục:</label>
        <select
          {...register("categoryId", {
            required: "Vui lòng chọn danh mục",
          })}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-600 text-sm">{errors.categoryId.message}</p>}

        <label className="font-medium">Ảnh sản phẩm:</label>
        <input
          type="text"
          {...register("images", {
            required: "Ảnh không được bỏ trống",
          })}
          placeholder="Ảnh sản phẩm"
          className="border px-2 py-1 rounded w-full"
        />
        {errors.images && <p className="text-red-600 text-sm">{errors.images.message}</p>}

        <label className="font-medium">Giá sản phẩm:</label>
        <input
          type="number"
          {...register("price", {
            required: "Giá sản phẩm không được bỏ trống",
            min: {
              value: 1000,
              message: "Giá phải lớn hơn > 1000",
            },
          })}
          placeholder="Giá sản phẩm"
          className="border px-2 py-1 rounded w-full"
        />
        {errors.price && <p className="text-red-600 text-sm">{errors.price.message}</p>}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Cập nhật
        </button>
      </form>
    </div>
  )
}

export default ProductEdit


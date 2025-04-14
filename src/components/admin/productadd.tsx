"use client"

import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { IProduct } from "../../interface/product"
import type { ICategory } from "../../interface/Category"
import { useNavigate } from "react-router-dom"
import { api } from "../../config/axios"

const ProductAdd = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IProduct>()
  const [image, setImage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Fetch categories
  const { data: categories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data } = await api.get("categories")
        return data
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error)
        return []
      }
    },
  })

  const mutation = useMutation({
    mutationFn: async (product: IProduct) => {
      try {
        const { data } = await api.post(`products`, product)
        return data
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: (response) => {
      alert("Thêm sản phẩm thành công!")
      console.log(response)
      queryClient.invalidateQueries({ queryKey: ["products"] })
      navigate("/dashboard/home")
    },
  })

  const onSubmit = (product: IProduct) => {
    mutation.mutate(product)
  }

  const uploadImage = async (file: any) => {
    console.log(file[0])
    setLoading(true)
    const formdata = new FormData()
    formdata.append("file", file[0])
    formdata.append("upload_preset", "reacttest")
    const endpoint = "https://api.cloudinary.com/v1_1/dkpfaleot/image/upload"
    try {
      const { data } = await api.post(endpoint, formdata)
      console.log(data)
      reset({
        images: data.url,
      })
      setImage(data.url)
      setLoading(false)
    } catch (error) {
      console.error("Lỗi khi tải ảnh", error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-semibold text-center mb-4">Thêm mới sản phẩm</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Nhập tên sản phẩm */}
        <div>
          <label className="block font-medium">Tên sản phẩm</label>
          <input
            type="text"
            {...register("name", {
              required: "Tên sản phẩm không được bỏ trống",
            })}
            placeholder="Nhập tên sản phẩm"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Chọn danh mục */}
        <div>
          <label className="block font-medium">Danh mục</label>
          <select
            {...register("categoryId", {
              required: "Vui lòng chọn danh mục",
            })}
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="block font-medium">Hình ảnh</label>
          <input
            type="file"
            onChange={(e) => uploadImage(e.target.files)}
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
          />
          {loading && <p className="text-sm text-gray-500 mt-2">Đang tải ảnh...</p>}
          {image && (
            <div className="mt-3">
              <img src={image || "/placeholder.svg"} alt="Preview" className="w-32 rounded shadow-md" />
            </div>
          )}
          <input
            type="hidden"
            {...register("images", {
              required: "Ảnh sản phẩm không được bỏ trống",
            })}
          />
          {errors.images && <p className="text-sm text-red-600">{errors.images.message}</p>}
        </div>

        {/* Giá sản phẩm */}
        <div>
          <label className="block font-medium">Giá sản phẩm</label>
          <input
            type="number"
            {...register("price", {
              required: "Giá sản phẩm không được bỏ trống",
              min: {
                value: 1000,
                message: "Giá sản phẩm phải lớn hơn 1000",
              },
            })}
            placeholder="Nhập giá sản phẩm"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
        </div>

        {/* Nút thêm mới */}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all">
          Thêm sản phẩm
        </button>
      </form>
    </div>
  )
}

export default ProductAdd


export interface IProduct {
  id: number
  name: string
  price: number
  description?: string
  images: string
  category?: string | { name: string }
}

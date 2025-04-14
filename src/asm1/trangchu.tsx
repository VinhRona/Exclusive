"use client"

import { useState, useEffect } from "react"
import { FaArrowLeft, FaArrowRight, FaShippingFast, FaHeadset, FaUndo, FaShoppingCart } from "react-icons/fa"
import { useNavigate, useLocation } from "react-router-dom"
import ProductItem from "../components/client/products/item"
import axios from "axios"
import type { IProduct } from "../interface/product"
import type { ICategory } from "../interface/category"
import { useCart } from "../context/Cart"

// Add this type definition after the imports
type CategoryIconsType = {
  [key: string]: JSX.Element
}

// Updated productCategoryIcons with appropriate icons for each category
const productCategoryIcons: CategoryIconsType = {
  "Điện thoại": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12" y2="18"></line>
    </svg>
  ),
  Laptop: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  "Giày dép": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"></path>
      <path d="M18 14V8a5 5 0 0 0-5-5H8"></path>
      <path d="M10 3v5"></path>
      <path d="M6 8h4"></path>
    </svg>
  ),
  "Đồ chơi": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <line x1="6" y1="12" x2="10" y2="12"></line>
      <line x1="8" y1="10" x2="8" y2="14"></line>
      <circle cx="16" cy="12" r="1"></circle>
      <circle cx="18" cy="10" r="1"></circle>
    </svg>
  ),
  HiHi: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <path d="M8 10h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M16 10h.01"></path>
    </svg>
  ),
  Camera: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  ),
  HeadPhones: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  ),
  SmartWatch: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="6" width="12" height="12" rx="3"></rect>
      <path d="M9 1v4"></path>
      <path d="M15 1v4"></path>
      <path d="M9 19v4"></path>
      <path d="M15 19v4"></path>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
}

const features = [
  {
    icon: <FaShippingFast size={32} />,
    title: "FREE AND FAST DELIVERY",
    description: "Free delivery for all orders over $140",
  },
  {
    icon: <FaHeadset size={32} />,
    title: "24/7 CUSTOMER SERVICE",
    description: "Friendly 24/7 customer support",
  },
  {
    icon: <FaUndo size={32} />,
    title: "MONEY BACK GUARANTEE",
    description: "We return money within 30 days",
  },
]

const ClienHome = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState<ICategory[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [bestSellingProducts, setBestSellingProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<IProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { totalItems } = useCart();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get("http://localhost:3000/categories")
        setCategories(categoriesResponse.data)

        if (categoriesResponse.data.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesResponse.data[0].name)
        }

        // Fetch products
        const productsResponse = await axios.get("http://localhost:3000/products")
        const allProducts = productsResponse.data;
        
        if (searchQuery) {
          setIsSearching(true);
          const lowerCaseQuery = searchQuery.toLowerCase();
          const filteredProducts = allProducts.filter((product: IProduct) => 
            product.name.toLowerCase().includes(lowerCaseQuery)
          );
          setSearchResults(filteredProducts);
        } else {
          setIsSearching(false);
        }
        
        // Set best selling products randomly (4 random products)
        const randomProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 4);
        setBestSellingProducts(randomProducts);

        // Filter products by selected category if a category is selected
        if (selectedCategory) {
          const filteredProducts = allProducts.filter((product: IProduct) => {
            // Check if category is an object with a name property or a string
            if (product.category && typeof product.category === "object" && "name" in product.category) {
              return product.category.name === selectedCategory
            }
            // If it's a string, compare directly
            return product.category === selectedCategory
          })
          setProducts(filteredProducts)
        } else {
          setProducts(allProducts)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory, searchQuery])

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Update the formatProductForItem function to include rating
  const formatProductForItem = (
    product: IProduct,
  ): {
    id: number
    name: string
    price: string
    images: string
    rating?: number
  } => {
    return {
      id: product.id || 0,
      name: product.name,
      price: formatPrice(product.price),
      images: product.images,
      rating: Math.floor(Math.random() * 5) + 1 // Random rating between 1-5 for demo
    }
  }

  // Navigate to product detail page
  const handleProductClick = (product: IProduct) => {
    // Ensure product ID exists before navigating
    if (product.id) {
      // Navigate to the detail page using the product ID in the URL
      navigate(`/asm/detail/${product.id}`);
    } else {
      // Handle cases where product ID might be missing (optional)
      console.error("Cannot navigate to detail page: Product ID is missing.");
    }
  }

  const navigateToCart = () => {
    navigate('/asm/cart');
  };

  const displayedProducts = isSearching ? searchResults : products;

  return (
    <div className="overflow-x-hidden pb-20">
      {/* Shopping Cart button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={navigateToCart}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center"
        >
          <FaShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row h-auto md:h-96 w-full">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block md:w-1/4 h-96 p-6 border-r border-gray-300">
          <ul className="h-96 pl-4 md:pl-20">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex justify-between py-2 px-4 cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
                <span className="text-gray-500">›</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 flex justify-center items-center p-4 md:p-0">
          <div className="relative w-full px-2 md:px-10">
            {/* Banner */}
            <div className="bg-black text-white p-6 md:p-12 h-auto md:h-80 flex flex-col md:flex-row items-center justify-between relative md:top-3 w-full md:w-11/12 md:left-2 rounded-lg">
              <div className="z-10 mb-8 md:mb-0">
                <h2 className="text-sm text-gray-300 flex items-center">
                  <img className="w-8 md:w-12 mr-2" src="/img/logo.jpg" alt="" />
                  <p>iPhone 14 Series</p>
                </h2>
                <p className="text-3xl md:text-5xl font-bold leading-tight mt-2">
                  Up to 10% <br /> off Voucher
                </p>
                <button className="mt-4 md:mt-6 px-6 md:px-8 py-2 md:py-3 rounded-lg flex items-center">
                  <p className="text-white underline underline-offset-4">Shop Now</p> <span className="ml-2">→</span>
                </button>
              </div>
              <img
                src="/img/ip.jpg"
                alt="iPhone 14"
                className="w-full md:w-1/2 md:absolute md:right-0 md:-top-0 max-h-48 md:max-h-none object-contain md:object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:-translate-x-1/3 flex space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 mx-0 rounded-full ${
                      activeIndex === index ? "bg-red-500" : "bg-gray-400"
                    } cursor-pointer`}
                    onClick={() => setActiveIndex(index)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full md:w-11/12 mx-auto mt-10 px-4 md:px-0">
        <div className="flex items-center space-x-2 pl-2 md:pl-14">
          <span className="w-2 md:w-4 h-5 md:h-7 bg-red-500 rounded"></span>
          <h2 className="text-base md:text-lg font-semibold text-red-500">Categories</h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mt-2 pl-2 md:pl-14">Browse By Category</h1>

        <div className="">
          <div className="relative w-full flex justify-end">
            <div className="absolute -top-12 transform -translate-x-1/2 flex space-x-2">
              <button className="w-10 h-10 border rounded-full flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200">
                <FaArrowLeft />
              </button>
              <button className="w-10 h-10 border rounded-full flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200">
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Product Categories - Scrollable on mobile */}
        <div className="mt-6 pl-2 md:pl-14 overflow-x-auto">
          <div className="flex space-x-4 md:space-x-11 min-w-max pb-4 md:pb-0">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-4 md:p-6 w-32 md:w-44 h-32 md:h-40 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === category.name
                    ? "bg-red-500 text-white border-red-500"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="text-3xl md:text-5xl">
                  {productCategoryIcons[category.name] || (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  )}
                </div>
                <p className="mt-2 text-xs md:text-sm">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="w-full md:w-11/12 mx-auto mt-10 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 pl-2 md:pl-14">
            <span className="w-2 md:w-4 h-5 md:h-7 bg-red-500 rounded"></span>
            <h2 className="text-base md:text-lg font-semibold text-red-500">This Month</h2>
          </div>
          <button className="bg-red-500 text-white px-3 py-1.5 md:px-5 md:py-2 rounded mr-2 md:mr-14 hover:bg-red-600 text-sm md:text-base">
            View All
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mt-2 pl-2 md:pl-14">Best Selling Products</h1>

        {/* Product Grid - Responsive - Now using ProductItem component */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6 px-2 md:px-14">
          {loading ? (
            <p className="col-span-4 text-center py-10">Loading products...</p>
          ) : bestSellingProducts.length > 0 ? (
            bestSellingProducts.map((product) => (
              <div
                key={product.id}
                className="p-2 rounded-lg relative cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <ProductItem product={formatProductForItem(product)} />
                <div className="flex items-center mt-2 text-yellow-400">
                  {'★'.repeat(formatProductForItem(product).rating || 0)}
                  {'☆'.repeat(5 - (formatProductForItem(product).rating || 0))}
                  <span className="text-gray-500 text-sm ml-2">({Math.floor(Math.random() * 100) + 1})</span>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-4 text-center py-10">No products found in this category</p>
          )}
        </div>
      </div>

      {/* Music Experience Banner */}
      <div className="w-11/12 md:w-10/12 mx-auto bg-gray-950 text-white rounded-lg mt-16 md:mt-20 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 md:px-16 md:py-1">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <p className="text-green-400 text-xs md:text-sm">Categories</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">
              Enhance Your <br className="hidden md:block" /> Music Experience
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-4">
              <div className="text-center bg-white text-black px-2 py-1 md:px-4 md:py-2 rounded-lg">
                <p className="text-base md:text-xl font-bold">23</p>
                <p className="text-xs md:text-sm">Hours</p>
              </div>
              <div className="text-center bg-white text-black px-2 py-1 md:px-4 md:py-2 rounded-lg">
                <p className="text-base md:text-xl font-bold">05</p>
                <p className="text-xs md:text-sm">Days</p>
              </div>
              <div className="text-center bg-white text-black px-2 py-1 md:px-4 md:py-2 rounded-lg">
                <p className="text-base md:text-xl font-bold">59</p>
                <p className="text-xs md:text-sm">Minutes</p>
              </div>
              <div className="text-center bg-white text-black px-2 py-1 md:px-4 md:py-2 rounded-lg">
                <p className="text-base md:text-xl font-bold">35</p>
                <p className="text-xs md:text-sm">Seconds</p>
              </div>
            </div>

            <button className="mt-4 md:mt-6 bg-green-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-green-600">
              Buy Now!
            </button>
          </div>

          <img
            src="/img/loa.png"
            alt="Speaker"
            className="w-full md:w-2/4 max-h-48 md:h-96 object-contain md:object-cover"
          />
        </div>
      </div>

      {/* Explore Products */}
      <div className="w-full md:w-11/12 mx-auto mt-16 md:mt-32 px-4 md:px-0">
        <div className="flex items-center space-x-2 pl-2 md:pl-16">
          <span className="w-2 md:w-4 h-5 md:h-7 bg-red-500 rounded"></span>
          <h2 className="text-base md:text-lg font-semibold text-red-500">
            {isSearching ? "Kết quả tìm kiếm" : "Our Products"}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold mt-2 md:mt-5 pl-2 md:pl-16">
            {isSearching 
              ? `Tìm kiếm "${searchQuery}"` 
              : (selectedCategory ? `${selectedCategory} Products` : "Explore Our Products")
            }
          </h1>
          {selectedCategory && !isSearching && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-sm text-gray-600 hover:text-red-500 mr-2 md:mr-14"
            >
            </button>
          )}
        </div>

        <div className="hidden md:flex justify-end mr-3">
          <div className="relative w-full flex justify-end">
            <div className="absolute -top-12 transform -translate-x-1/2 flex space-x-2">
              <button className="w-10 h-10 border rounded-full flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200">
                <FaArrowLeft />
              </button>
              <button className="w-10 h-10 border rounded-full flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200">
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid - Responsive - Now using ProductItem component */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6 px-2 md:px-14">
          {loading ? (
            <p className="col-span-4 text-center py-10">Loading products...</p>
          ) : displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                className="p-2 rounded-lg relative cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <ProductItem product={formatProductForItem(product)} />
                <div className="flex items-center mt-2 text-yellow-400">
                  {'★'.repeat(formatProductForItem(product).rating || 0)}
                  {'☆'.repeat(5 - (formatProductForItem(product).rating || 0))}
                  <span className="text-gray-500 text-sm ml-2">({Math.floor(Math.random() * 100) + 1})</span>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-4 text-center py-10">
              {isSearching ? "Không tìm thấy sản phẩm phù hợp" : "No products found in this category"}
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <button className="bg-red-500 text-white px-4 py-2 md:px-6 md:py-2 rounded hover:bg-red-600">
            View All Products
          </button>
        </div>
      </div>

      {/* Featured Section */}
      <div className="w-full md:w-11/12 mx-auto mt-10 px-4 md:px-0">
        <div className="flex items-center space-x-2 pl-2 md:pl-16">
          <span className="w-2 md:w-4 h-5 md:h-7 bg-red-500 rounded"></span>
          <h2 className="text-base md:text-lg font-semibold text-red-500">Featured</h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mt-2 md:mt-5 pl-2 md:pl-16">New Arrival</h1>

        {/* Featured Products - Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 mt-6 px-2 md:px-16">
          {/* PlayStation 5 - Full width on mobile */}
          <div className="relative bg-black rounded-lg overflow-hidden h-64 md:h-[565px]">
            <img src="/img/20.png" alt="PlayStation 5" className="w-full h-full object-cover md:object-contain" />
            <div className="absolute bottom-5 left-5 text-white">
              <h3 className="text-lg md:text-xl font-bold">PlayStation 5</h3>
              <p className="text-xs md:text-sm text-gray-300">Black and White version of the PS5 coming out on sale.</p>
              <a href="#" className="underline text-white hover:text-gray-200 text-xs md:text-sm underline-offset-4">
                Shop Now
              </a>
            </div>
          </div>

          {/* Women's Collections & Small Items - Grid on desktop, stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Women's Collections */}
            <div className="relative bg-black rounded-lg overflow-hidden h-64 md:h-[300px]">
              <img src="/img/21.jpg" alt="Women's Collections" className="w-full h-full object-cover opacity-75" />
              <div className="absolute bottom-5 left-5 text-white">
                <h3 className="text-lg md:text-xl font-bold">Women's Collections</h3>
                <p className="text-xs md:text-sm text-gray-300">
                  Featured woman collections that give you another vibe.
                </p>
                <a href="#" className="underline text-white hover:text-gray-200 text-xs md:text-sm underline-offset-4">
                  Shop Now
                </a>
              </div>
            </div>

            {/* Small Items Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Speakers */}
              <div className="relative bg-black rounded-lg overflow-hidden h-48 md:h-auto">
                <img src="/img/22.png" alt="Speakers" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 text-white">
                  <h3 className="text-sm md:text-xl font-bold">Speakers</h3>
                  <p className="text-xs text-gray-300">Amazon wireless speakers</p>
                  <a
                    href="#"
                    className="underline text-white hover:text-gray-200 text-xs md:text-sm underline-offset-4"
                  >
                    Shop Now
                  </a>
                </div>
              </div>

              {/* Perfume */}
              <div className="relative bg-black rounded-lg overflow-hidden h-48 md:h-auto">
                <img src="/img/23.png" alt="Perfume" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 text-white">
                  <h3 className="text-sm md:text-xl font-bold">Perfume</h3>
                  <p className="text-xs text-gray-300">GUCCI INTENSE OUD EDP</p>
                  <a
                    href="#"
                    className="underline text-white hover:text-gray-200 text-xs md:text-sm underline-offset-4"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 md:mt-[50px] pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-32">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-gray-200 p-3 md:p-4 rounded-full text-black">{feature.icon}</div>
              <h3 className="font-bold text-base md:text-lg mt-3 md:mt-4">{feature.title}</h3>
              <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị thông báo tìm kiếm nếu có tìm kiếm */}
      {isSearching && (
        <div className="text-center my-8">
          <h2 className="text-2xl font-bold">
            {searchResults.length > 0 
              ? `Kết quả tìm kiếm cho "${searchQuery}" (${searchResults.length} sản phẩm)` 
              : `Không tìm thấy sản phẩm phù hợp với "${searchQuery}"`
            }
          </h2>
          <button 
            onClick={() => navigate('/asm/home')}
            className="mt-2 text-red-500 hover:text-red-700 font-medium"
          >
            Quay lại trang chủ
          </button>
        </div>
      )}
    </div>
  )
}

export default ClienHome

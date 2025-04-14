import { useState, useEffect } from "react";
import { Minus, Plus, Truck, RefreshCw, Heart, ShoppingCart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/Cart";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  images: string;
  description?: string;
  category?: Category; // Use the Category interface
  categoryId?: string | number; // Add categoryId for fetching
  additionalImages?: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addItemToCart, totalItems } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Allow null initial state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch product details with category expanded
    fetch(`http://localhost:3000/products/${id}?_expand=category`)
      .then(res => {
        if (res.status === 404) { // Check specifically for 404
          throw new Error('Product not found');
        }
        if (!res.ok) { // Handle other potential errors
          throw new Error('Failed to fetch product details');
        }
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        // Set selectedImage only if data.images is a non-empty string
        setSelectedImage(data.images && typeof data.images === 'string' ? data.images : null);
        setLoading(false);

        // Fetch related products based on the fetched product's categoryId
        if (data.categoryId) {
          fetch(`http://localhost:3000/products?categoryId=${data.categoryId}&_limit=5`) // Limit to 5, incl current
            .then(res => res.json())
            .then((relatedData: Product[]) => {
              // Filter out the current product and take up to 4 others
              const filteredRelated = relatedData.filter(p => p.id !== data.id).slice(0, 4);
              setRelatedProducts(filteredRelated);
            })
            .catch(err => console.error("Failed to fetch related products:", err));
        } else {
           // Fallback: Fetch random products if categoryId is missing
           fetch(`http://localhost:3000/products?_limit=5`)
           .then(res => res.json())
           .then((randomData: Product[]) => {
                const filteredRandom = randomData.filter(p => p.id !== data.id).slice(0, 4);
                setRelatedProducts(filteredRandom);
           })
           .catch(err => console.error("Failed to fetch random related products:", err));
        }
      })
      .catch(err => {
        console.error("Failed to fetch product:", err);
        setError(err.message || 'Could not load product.');
        setLoading(false);
      });

  }, [id]);

  // Function to safely format price
  const formatPrice = (priceString: string): string => {
    const priceNumber = parseFloat(priceString);
    if (isNaN(priceNumber)) {
      return 'Invalid Price'; // Or handle as needed
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNumber);
  };

  // Function to add product to cart
  const addToCart = (redirect: boolean = false) => {
    if (!product) return;
    
    // Parse price to number
    let priceNumber = 0;
    
    // Check if price contains 'k' or 'K' for thousands
    if (typeof product.price === 'string' && (product.price.includes('k') || product.price.includes('K'))) {
      // Extract the numeric part and multiply by 1000
      const numericPart = parseFloat(product.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      if (!isNaN(numericPart)) {
        priceNumber = numericPart * 1000;
      }
    } else {
      // Regular price format - just extract numbers
      let priceText = typeof product.price === 'string' ? 
        product.price.replace(/\s/g, '') : // Remove spaces
        String(product.price);
      priceText = priceText.replace(/[^\d]/g, ''); // Keep only digits
      priceNumber = parseInt(priceText, 10);
    }
    
    if (isNaN(priceNumber) || priceNumber <= 0) {
      console.error('Invalid price format:', product.price);
      alert('Lỗi giá sản phẩm. Vui lòng thử lại sau.');
      return;
    }
    
    // Add to cart using context
    addItemToCart({
      id: Number(product.id),
      name: product.name,
      price: priceNumber,
      quantity: quantity,
      image: product.images
    });
    
    // Show success message or redirect
    if (redirect) {
      navigate("/asm/checkout");
    } else {
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      navigate("/asm/cart");
    }
  };

  // Function to handle "Buy Now" click
  const handleBuyNow = () => {
    addToCart(true);
  };
  
  // Function to handle "Add to Cart" click
  const handleAddToCart = () => {
    addToCart(false);
  };

  const navigateToCart = () => {
    navigate('/asm/cart');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">Product not found.</div>;
  }

  const additionalImages = product.additionalImages || [];

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Shopping Cart button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={navigateToCart}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center"
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="text-gray-500 text-sm mb-4">
        <span className="hover:text-black cursor-pointer">Home</span>
        <span> / </span>
        <span className="hover:text-black cursor-pointer">{product.category?.name || 'Category'}</span>
        <span> / </span>
        <span className="font-semibold text-black">{product.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left: Product Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4 items-start md:w-1/2">
          {/* Thumbnail Images */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {/* Main image thumbnail */}
            {product.images && (
              <img
                src={product.images}
                alt={`${product.name} - main thumbnail`}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-lg cursor-pointer border-2 object-cover flex-shrink-0 ${
                  selectedImage === product.images ? "border-red-500" : "border-gray-200"
                }`}
                onClick={() => setSelectedImage(product.images)}
              />
            )}
            {/* Additional image thumbnails */}
            {additionalImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} - thumbnail ${index + 1}`}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-lg cursor-pointer border-2 object-cover flex-shrink-0 ${
                  selectedImage === image ? "border-red-500" : "border-gray-200"
                }`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 w-full">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-auto md:h-[510px] rounded-lg p-2 bg-gray-100 object-contain hover:shadow-lg transition-shadow duration-300"
              />
            ) : (
              <div className="w-full h-[300px] md:h-[510px] rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
            {/* You might want a modal zoom library here instead of just an icon */}
            {selectedImage && (
                <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 opacity-75 hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3h-6" /> {/* Zoom In Icon */}
                    </svg>
                </button>
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="flex-1 md:w-1/2">
          <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex text-yellow-400">
                {/* Static stars for now, replace with actual rating if available */}
                {'★'.repeat(4)}{'☆'.repeat(1)}
            </div>
            <span className="text-gray-500">(150 Reviews)</span>
            <span className="text-green-600 font-medium">In Stock</span>
          </div>

          <p className="text-3xl font-bold mb-4">{formatPrice(product.price)}</p>

          <p className="text-gray-600 mb-6">
            {product.description || 'Vui lòng xem sản phẩm trước khi thêm giỏ hàng.'} {/* Added placeholder description */} 
          </p>

          {/* Variants (Color/Size) - Add logic if needed */}
          {/* ... */} 

          {/* Quantity & Buy Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="px-5 py-2 text-lg font-medium w-16 text-center" aria-live="polite">{quantity}</span>
              <button
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
            <button 
              onClick={handleBuyNow} 
              className="w-full sm:w-auto bg-red-500 text-white px-10 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors duration-300 flex-grow sm:flex-grow-0">
              Buy Now
            </button>
            <button 
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-black text-white px-10 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors duration-300 flex-grow sm:flex-grow-0">
              Add to Cart
            </button>
            <button aria-label="Add to Wishlist" className="p-3 border rounded-md hover:bg-gray-100 hover:text-red-500 transition-colors duration-200">
                 <Heart className="cursor-pointer" size={20} />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border rounded-md overflow-hidden">
            <div className="p-4 border-b">
              <p className="flex items-center gap-3 font-medium">
                <Truck size={24} className="text-gray-700"/> Free Delivery
              </p>
              <p className="text-sm text-gray-500 pl-10 underline cursor-pointer hover:text-red-500">
                Enter your postal code for Delivery Availability
              </p>
            </div>
             <div className="p-4">
              <p className="flex items-center gap-3 font-medium">
                <RefreshCw size={24} className="text-gray-700"/> Return Delivery
              </p>
              <p className="text-sm text-gray-500 pl-10">
                Free 30 Days Delivery Returns. <span className="underline cursor-pointer hover:text-red-500">Details</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
          <div className="mt-20">
             <div className="flex items-center space-x-3 mb-6">
                <span className="w-3 h-8 bg-red-500 rounded"></span>
                <h2 className="text-xl font-semibold text-red-500">Related Items</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="p-3 border rounded-lg relative group transition-shadow duration-300 hover:shadow-md">
                  <a href={`/asm/detail/${relatedProduct.id}`}>
                    <div className="relative overflow-hidden rounded-md mb-3 aspect-square bg-gray-100">
                      <img
                        src={relatedProduct.images}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Add to cart button on hover - Example */}
                      <button 
                        onClick={() => {
                          if (relatedProduct.id) {
                            navigate(`/asm/detail/${relatedProduct.id}`);
                          }
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-black text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View Details
                      </button>
                    </div>
                    <h3 className="text-gray-800 font-medium text-base mb-1 truncate" title={relatedProduct.name}>{relatedProduct.name}</h3>
                    <p className="text-red-600 text-lg font-semibold mb-2">
                      {formatPrice(relatedProduct.price)}
                    </p>
                    {/* Add ratings if available */}
                     <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(4)}{'☆'.repeat(1)}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default ProductDetail;

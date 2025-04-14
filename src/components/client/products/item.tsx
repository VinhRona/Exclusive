import React from 'react';
import { FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../../context/Cart';
import { useNavigate } from 'react-router-dom';

interface ProductItemProps {
  product: {
    id: number;
    name: string;
    price: string;
    oldPrice?: string;
    score?: number;
    reviews?: number;
    images: string;
    new?: boolean;
    colors?: string[];
  };
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to detail page when clicking add to cart

    // Parse the price string to get a proper number value
    let priceValue = 0;
    
    // Check if price contains 'k' or 'K' for thousands
    if (product.price.includes('k') || product.price.includes('K')) {
      // Extract the numeric part and multiply by 1000
      const numericPart = parseFloat(product.price.replace(/[^0-9,.]/g, '').replace(',', '.'));
      if (!isNaN(numericPart)) {
        priceValue = numericPart * 1000;
      }
    } else {
      // Regular price format - just extract numbers
      let priceText = product.price.replace(/\s/g, ''); // Remove spaces
      priceText = priceText.replace(/[^\d]/g, ''); // Keep only digits
      priceValue = parseInt(priceText, 10);
    }
    
    if (isNaN(priceValue) || priceValue <= 0) {
      console.error('Invalid price format:', product.price);
      alert('Lỗi giá sản phẩm. Vui lòng thử lại sau.');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: priceValue,
      quantity: 1,
      image: product.images
    });
    
    // Show success message in Vietnamese
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const viewCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to detail page
    navigate('/asm/cart');
  };

  return (
    <div className="group">
      {/* Product Image with Overlay */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-3">
        <img 
          src={product.images || "/placeholder.svg"} 
          alt={product.name} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* New Tag */}
        {product.new && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            MỚI
          </span>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex flex-col gap-2">
            <button 
              className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Thêm vào yêu thích"
            >
              <FaRegHeart className="text-gray-700" />
            </button>
            
            <button 
              onClick={handleAddToCart}
              className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Thêm vào giỏ hàng"
            >
              <FaShoppingCart className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div>
        <h3 className="font-medium text-sm md:text-base truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-red-600 font-semibold text-sm md:text-base">{product.price}</span>
          {product.oldPrice && (
            <span className="text-gray-500 line-through text-xs md:text-sm">{product.oldPrice}</span>
          )}
        </div>
        
        {/* Color Options */}
        {product.colors && (
          <div className="flex gap-1 mt-2">
            {product.colors.map((color, index) => (
              <div 
                key={index} 
                className="w-3 h-3 rounded-full border border-gray-300" 
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add to Cart Button */}
      <div className="flex gap-2 mt-3">
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md text-sm transition-colors"
        >
          Thêm vào giỏ
        </button>
        <button 
          onClick={viewCart}
          className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-md text-sm transition-colors"
        >
          <FaShoppingCart />
        </button>
      </div>

      {/* Rating Display */}
      {product.score && (
        <div className="flex items-center mt-2 text-yellow-400">
          {'★'.repeat(product.score)}
          {'☆'.repeat(5 - product.score)}
          {product.reviews && (
            <span className="text-gray-500 text-sm ml-2">({product.reviews})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
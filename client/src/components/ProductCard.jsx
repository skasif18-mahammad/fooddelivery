import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Check, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const selectedOption = product.options[selectedOptionIndex] || product.options[0];
  const discountPercent = Math.round(
    ((selectedOption.originalPrice - selectedOption.price) / selectedOption.originalPrice) * 100
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedOption, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      {/* Product Image & Badges */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative h-56 sm:h-64 overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Floating Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/30 shadow-md">
            {product.badge}
          </span>
        )}

        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
            {discountPercent}% OFF
          </span>
        )}

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className="absolute inset-x-4 bottom-3 bg-white/90 backdrop-blur-md text-stone-900 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 shadow-lg hover:bg-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View & Details</span>
        </button>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating and Origin */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-stone-400 font-normal">({product.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-400 truncate max-w-[140px]">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.origin}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-nikhila-amber-600 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Weight / Pack Options Selector */}
        <div>
          <div className="text-[11px] font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
            Select Pack Size:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.options.map((opt, idx) => (
              <button
                key={opt.size}
                type="button"
                onClick={() => setSelectedOptionIndex(idx)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedOptionIndex === idx
                    ? 'bg-amber-50 border-nikhila-amber-500 text-amber-900 font-bold ring-1 ring-amber-500/30'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {opt.size}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing and Action Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-stone-950">
                ₹{selectedOption.price}
              </span>
              {selectedOption.originalPrice > selectedOption.price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{selectedOption.originalPrice}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Doorstep Delivery</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-nikhila-amber-400" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Star, CheckCircle, ShieldCheck, Truck, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const selectedOption = product.options[selectedOptionIndex] || product.options[0];
  const discountPercent = Math.round(
    ((selectedOption.originalPrice - selectedOption.price) / selectedOption.originalPrice) * 100
  );

  const handleAdd = () => {
    addToCart(product, selectedOption, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative max-h-[90vh] flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image & Badge */}
        <div className="md:w-1/2 relative bg-stone-100 min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {product.badge}
            </span>
          )}
        </div>

        {/* Right: Details & Order Controls */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[85vh]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="font-semibold text-amber-700 uppercase tracking-wider text-[10px]">
                  {product.category.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-stone-400">({product.reviewCount} verified reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-serif leading-tight">
                {product.name}
              </h2>

              <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quality Highlights */}
            {product.highlights && (
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                  Purity & Quality Promise:
                </div>
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Farm Origin & Shelf Life */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5 bg-amber-50/50 p-2 rounded-xl border border-amber-200/40">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <div>
                  <span className="text-stone-400 block text-[9px] uppercase">Origin</span>
                  <strong className="text-stone-800">{product.origin}</strong>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-xl border border-emerald-200/40">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <div>
                  <span className="text-stone-400 block text-[9px] uppercase">Shelf Life</span>
                  <strong className="text-stone-800">{product.shelfLife}</strong>
                </div>
              </div>
            </div>

            {/* Size / Weight Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Choose Pack / Weight:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.options.map((opt, idx) => (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedOptionIndex === idx
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-900">{opt.size}</div>
                    <div className="text-xs font-extrabold text-amber-700 mt-0.5">₹{opt.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-6 border-t border-stone-200 mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Total Price:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-stone-950">
                    ₹{selectedOption.price * quantity}
                  </span>
                  {selectedOption.originalPrice > selectedOption.price && (
                    <span className="text-xs text-stone-400 line-through">
                      ₹{selectedOption.originalPrice * quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 font-bold text-base"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-bold text-sm text-stone-900 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 hover:bg-stone-200 text-stone-700 font-bold text-base"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-nikhila-amber-500 hover:bg-nikhila-amber-600 text-stone-950 shadow-amber-500/30'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAdded ? 'Added to Cart Successfully!' : 'Add to Food Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

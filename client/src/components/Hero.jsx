import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, HeartHandshake } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Hero({ onExploreClick }) {
  const { setIsTrackerOpen } = useCart();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-stone-50 to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle decorative background circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Direct From Farms & Traditional Kitchens</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Authentic Taste Delivered <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nikhila-amber-600 via-amber-500 to-nikhila-green-700">
                Fresh To Your Doorstep.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to <strong>Nikhila Foods</strong>. Indulge in naturally ripened sweet <strong>Mangoes</strong>, grandma-style handcrafted <strong>Pickles</strong>, and 100% pure <strong>Wood-Pressed Cooking Oils</strong> delivered safely with care when you order.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-nikhila-amber-500 hover:bg-nikhila-amber-600 active:scale-95 text-stone-950 font-bold text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all"
              >
                <span>Order Fresh Items</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-base rounded-2xl shadow-sm hover:shadow transition-all"
              >
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Track Live Delivery</span>
              </button>
            </div>

            {/* Delivery Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-200/80">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Swift Delivery</div>
                  <div className="text-[11px] text-stone-500">Same-Day / Express</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">100% Chemical-Free</div>
                  <div className="text-[11px] text-stone-500">Naturally Ripened</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="p-2 rounded-xl bg-red-100 text-red-800">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">Grandma's Touch</div>
                  <div className="text-[11px] text-stone-500">Authentic Recipes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Feature Banner Card */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 text-white relative group">
                <img
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&auto=format&fit=crop&q=80"
                  alt="Juicy Sweet Mangoes"
                  className="w-full h-80 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-6 flex flex-col justify-end">
                  <span className="bg-amber-500 text-stone-950 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider w-max mb-2">
                    Harvest Season Live
                  </span>
                  <h3 className="text-2xl font-bold font-serif">Juicy Farm-Fresh Mangoes</h3>
                  <p className="text-stone-300 text-xs mt-1">
                    Banganapalli & Alphonso naturally ripened in grass crates. Order now for today's dispatch!
                  </p>
                </div>
              </div>

              {/* Floating Mini Card 1: Traditional Pickle */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white p-3.5 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3.5 max-w-xs animate-bounce" style={{ animationDuration: '4s' }}>
                <img
                  src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80"
                  alt="Avakaya Pickle"
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-stone-900">🌶️ Andhra Avakaya</div>
                  <div className="text-[11px] text-stone-500">Pure Cold-Pressed Oil Base</div>
                  <div className="text-xs font-extrabold text-amber-600 mt-0.5">From ₹189</div>
                </div>
              </div>

              {/* Floating Mini Card 2: Pure Cooking Oil */}
              <div className="absolute -top-5 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3 max-w-[210px]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
                  🛢️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-900">Chekku Groundnut Oil</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">100% Wood-Pressed</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

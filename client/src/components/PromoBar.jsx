import React from 'react';
import { Truck, Sparkles, ShieldCheck } from 'lucide-react';

export default function PromoBar() {
  return (
    <aside aria-label="Special Offers" className="bg-gradient-to-r from-nikhila-amber-600 via-nikhila-amber-500 to-nikhila-green-700 text-white text-xs sm:text-sm py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Truck className="w-4 h-4 text-amber-200 animate-bounce" />
          <span className="font-medium">
            Express Doorstep Delivery on all orders! <strong className="underline decoration-amber-300">Free delivery</strong> over ₹499
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-amber-100">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Use Code: <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold text-white">NIKHILA10</span> for 10% OFF
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            100% Chemical-Free Freshness Guaranteed
          </span>
        </div>
      </div>
    </aside>
  );
}

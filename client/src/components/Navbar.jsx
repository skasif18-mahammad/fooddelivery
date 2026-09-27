import React, { useState } from 'react';
import { ShoppingBag, Search, Truck, PhoneCall, Menu, X, User, ChevronDown, LogOut, Package, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ selectedCategory, onSelectCategory, searchQuery, setSearchQuery }) {
  const { itemCount, setIsCartOpen, setIsTrackerOpen } = useCart();
  const { user, setIsAuthOpen, logout, userOrders, setIsOrdersModalOpen } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => { onSelectCategory('all'); setSearchQuery(''); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nikhila-amber-500 via-amber-400 to-nikhila-green-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-2xl">🥭</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-stone-900 font-serif">
                  Nikhila<span className="text-nikhila-amber-600">Foods</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  PURE
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 tracking-wide">
                Fresh Mangoes • Grandma Pickles • Wood-Pressed Oils
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search sweet mangoes, spicy avakaya, pure oils..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-stone-100/90 border border-stone-200 rounded-full text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-nikhila-amber-500/50 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Live Track Order Button */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-all shadow-sm"
              title="Track your live food delivery"
            >
              <Truck className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </button>

            {/* Helpline / Contact */}
            <a
              href="tel:+919848022338"
              className="hidden xl:flex items-center gap-1.5 text-stone-600 hover:text-nikhila-amber-600 text-xs font-medium px-2 py-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-nikhila-amber-600" />
              <span>+91 98480 22338</span>
            </a>

            {/* Blinkit-Style Login / User Profile Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-xs transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs">
                    🥭
                  </div>
                  <span className="hidden sm:inline truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <div className="font-extrabold text-sm text-stone-900">{user.name}</div>
                      <div className="text-xs text-stone-500 font-mono">+91 {user.phone}</div>
                      {user.email && <div className="text-[11px] text-stone-400 truncate">{user.email}</div>}
                    </div>

                    <button
                      onClick={() => setIsOrdersModalOpen(true)}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span>My Orders</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {userOrders.length}
                      </span>
                    </button>

                    <div className="px-4 py-2 text-[11px] text-stone-500 bg-stone-50/50 border-t border-b border-stone-100">
                      <div className="flex items-center gap-1 font-bold text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved Address:</span>
                      </div>
                      <p className="line-clamp-2 mt-0.5">{user.address || 'Hyderabad'}</p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-full shadow-sm shadow-emerald-600/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-full font-semibold text-xs sm:text-sm transition-all shadow-md shadow-stone-900/10"
            >
              <ShoppingBag className="w-4 h-4 text-nikhila-amber-400" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-nikhila-amber-500 text-stone-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-stone-200 space-y-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nikhila-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>

            {/* Mobile Auth Row */}
            {user ? (
              <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-stone-900">{user.name} (+91 {user.phone})</div>
                  <button 
                    onClick={() => { setIsOrdersModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="text-amber-800 font-bold underline text-[11px] mt-0.5"
                  >
                    View My Orders ({userOrders.length})
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Login with Mobile Number</span>
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <button
                onClick={() => { onSelectCategory('mangoes'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-lg border ${selectedCategory === 'mangoes' ? 'bg-amber-500 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'}`}
              >
                🥭 Mangoes
              </button>
              <button
                onClick={() => { onSelectCategory('pickles'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-lg border ${selectedCategory === 'pickles' ? 'bg-amber-500 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'}`}
              >
                🌶️ Pickles
              </button>
              <button
                onClick={() => { onSelectCategory('cooking-oil'); setIsMobileMenuOpen(false); }}
                className={`py-2 px-3 rounded-lg border ${selectedCategory === 'cooking-oil' ? 'bg-amber-500 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'}`}
              >
                🛢️ Oils
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

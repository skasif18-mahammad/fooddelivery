import React, { useState, useEffect, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import PromoBar from './components/PromoBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryPills from './components/CategoryPills';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import BlinkitLoginModal from './components/BlinkitLoginModal';
import UserOrdersModal from './components/UserOrdersModal';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import { Filter, ArrowUpDown, Sparkles, AlertCircle } from 'lucide-react';

import { seedProductsToFirestore } from './services/firestoreService';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [modalProduct, setModalProduct] = useState(null);

  // Fetch products from server and sync to Cloud Firestore
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
          // Sync catalog to Cloud Firestore
          seedProductsToFirestore(data.products).catch(err => console.warn('Firestore seed warning:', err));
        }
      } catch (err) {
        console.error('Failed to fetch from /api/products, checking fallback', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: products.length,
      mangoes: products.filter(p => p.category === 'mangoes').length,
      pickles: products.filter(p => p.category === 'pickles').length,
      oils: products.filter(p => p.category === 'cooking-oil').length,
    };
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.options[0].price - b.options[0].price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.options[0].price - a.options[0].price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleExploreScroll = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-amber-200">
          
          {/* Top Announcement */}
          <PromoBar />

          {/* Navigation Bar */}
          <Navbar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="flex-1">
            {/* Hero Section */}
            <Hero onExploreClick={handleExploreScroll} />

            {/* Category Quick Pills */}
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              counts={categoryCounts}
            />

            {/* Product Catalog Section */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-24">
              
              {/* Catalog Controls Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                    {selectedCategory === 'all' && 'All Fresh Specialties'}
                    {selectedCategory === 'mangoes' && '🥭 Farm Fresh Juicy Mangoes'}
                    {selectedCategory === 'pickles' && '🌶️ Grandma’s Traditional Pickles'}
                    {selectedCategory === 'cooking-oil' && '🛢️ Pure Wood-Pressed Oils'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Showing {filteredProducts.length} premium food items ready for doorstep delivery
                  </p>
                </div>

                {/* Sorting Filter */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-stone-200 shadow-xs text-xs font-semibold">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-stone-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-stone-900 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured / Popular</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 rounded-3xl bg-stone-200 animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="text-5xl">🔍</div>
                  <h4 className="font-bold text-lg text-stone-800">No food items found</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your search query or reset category filter.
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(prod) => setModalProduct(prod)}
                    />
                  ))}
                </div>
              )}

            </section>

            {/* Why Choose Nikhila Foods & Testimonials */}
            <WhyChooseUs />
          </main>

          {/* Footer */}
          <Footer onSelectCategory={setSelectedCategory} />

          {/* Interactive Modals & Drawers */}
          <ProductModal
            product={modalProduct}
            onClose={() => setModalProduct(null)}
          />
          <CartDrawer />
          <CheckoutModal />
          <OrderTracker />
          <BlinkitLoginModal />
          <UserOrdersModal />

        </div>
      </CartProvider>
    </AuthProvider>
  );
}

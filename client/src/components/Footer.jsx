import React from 'react';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Truck } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-nikhila-amber-500 to-nikhila-green-600 flex items-center justify-center text-xl shadow-md">
                🥭
              </div>
              <span className="text-2xl font-black text-white font-serif tracking-tight">
                Nikhila<span className="text-amber-500">Foods</span>
              </span>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Authentic Indian food store dedicated to bringing the purest flavors to your dining table. Our mission is to deliver delicious naturally-ripened mangoes, artisanal pickles, and wood-pressed cooking oils right when you order.
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                FSSAI Certified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-amber-400" />
                Contactless Delivery
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Our Specialties
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <button 
                  onClick={() => onSelectCategory('mangoes')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Juicy Fresh Mangoes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('pickles')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Grandma's Andhra Pickles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('cooking-oil')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Wood-Pressed Cooking Oils
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-amber-400 transition-colors"
                >
                  All Seasonal Batches
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery Hubs */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Express Delivery Hubs
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>Hyderabad & Secunderabad</li>
              <li>Bengaluru City</li>
              <li>Vijayawada & Guntur</li>
              <li>Visakhapatnam</li>
              <li>Chennai Metro</li>
              <li className="text-amber-400/90 text-xs font-semibold pt-1">
                + Pan-India Express Courier
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Order Helpline
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-stone-400">
              <a 
                href="tel:+919848022338" 
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+91 98480 22338</span>
              </a>

              <a 
                href="mailto:orders@nikhilafoods.com" 
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>orders@nikhilafoods.com</span>
              </a>

              <div className="flex items-start gap-2 text-stone-400 text-xs pt-1">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Nikhila Foods Central Processing Hub, Farm Sector, Hyderabad 500033</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Nikhila Foods Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1 text-stone-400">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for food authenticity and doorstep happiness.
          </p>
        </div>
      </div>
    </footer>
  );
}

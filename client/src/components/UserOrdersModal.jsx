import React from 'react';
import { X, Package, Clock, Truck, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function UserOrdersModal() {
  const { user, userOrders, isOrdersModalOpen, setIsOrdersModalOpen } = useAuth();
  const { setActiveOrder, setIsTrackerOpen } = useCart();

  if (!isOrdersModalOpen) return null;

  const handleTrackOrder = (order) => {
    setActiveOrder(order);
    setIsOrdersModalOpen(false);
    setIsTrackerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm">
              📦
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 font-serif">
                Your Food Orders
              </h3>
              <p className="text-xs text-stone-500">
                Logged in as <strong>{user ? user.name : 'Guest'}</strong> (+91 {user ? user.phone : ''})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrdersModalOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {userOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🥭</div>
              <h4 className="font-bold text-base text-stone-800">No past orders yet</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our fresh mangoes, authentic pickles, and pure cooking oils to place your first doorstep order!
              </p>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="px-5 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
              >
                Browse Specialties
              </button>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-stone-900 text-sm">
                      {order.orderId}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 capitalize">
                    {order.currentStage || order.manualStage || 'Confirmed'}
                  </span>
                </div>

                {/* Items preview */}
                <div className="text-xs text-stone-700 space-y-1">
                  {order.items && order.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{it.quantity}x {it.name} ({it.size})</span>
                      <span className="font-semibold text-stone-900">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500">Total: </span>
                    <strong className="text-stone-900 font-extrabold text-sm">
                      ₹{order.pricing ? order.pricing.totalAmount : 'Paid'}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleTrackOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Track Live Delivery</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

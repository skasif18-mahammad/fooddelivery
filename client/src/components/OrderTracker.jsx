import React, { useState, useEffect } from 'react';
import { 
  X, Truck, CheckCircle2, Clock, MapPin, Phone, ShieldCheck, 
  PackageCheck, UserCheck, Home, ArrowRight, RefreshCw, AlertCircle, Flame 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { subscribeToOrderFromFirestore, updateOrderStageInFirestore } from '../services/firestoreService';

export default function OrderTracker() {
  const { isTrackerOpen, setIsTrackerOpen, activeOrder, setActiveOrder } = useCart();
  const [lookupId, setLookupId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);

  // Poll or refresh current active order status
  const refreshStatus = async (idToFetch) => {
    const id = idToFetch || (activeOrder && activeOrder.orderId);
    if (!id) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setActiveOrder(data.order);
        setError('');
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // If no order is active when opening tracker, fetch recent seed order NF-88210
  useEffect(() => {
    if (isTrackerOpen && !activeOrder) {
      refreshStatus('NF-88210');
    }
  }, [isTrackerOpen]);

  // Real-time listener from Cloud Firestore
  useEffect(() => {
    if (!isTrackerOpen || !activeOrder?.orderId) return;

    const unsubscribe = subscribeToOrderFromFirestore(activeOrder.orderId, (updatedOrder) => {
      if (updatedOrder) {
        setIsFirestoreConnected(true);
        setActiveOrder((prev) => ({
          ...prev,
          ...updatedOrder
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isTrackerOpen, activeOrder?.orderId]);

  const handleLookup = (e) => {
    e.preventDefault();
    if (lookupId.trim()) {
      refreshStatus(lookupId.trim());
    }
  };

  const handleAdvanceSimulation = async () => {
    if (!activeOrder) return;
    try {
      setIsAdvancing(true);
      
      const stages = ['confirmed', 'packing', 'assigned', 'out_for_delivery', 'delivered'];
      const cur = activeOrder.manualStage || activeOrder.currentStage || 'confirmed';
      const nxt = stages[Math.min(stages.indexOf(cur) + 1, stages.length - 1)];

      // 1. Update Cloud Firestore
      updateOrderStageInFirestore(activeOrder.orderId, nxt);

      // 2. Call local backend endpoint
      const res = await fetch(`/api/orders/${activeOrder.orderId}/advance`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.order) {
        setActiveOrder(data.order);
      } else {
        setActiveOrder({ ...activeOrder, manualStage: nxt, currentStage: nxt });
      }
    } catch (e) {
      console.error(e);
      // Fallback stage advancement
      const stages = ['confirmed', 'packing', 'assigned', 'out_for_delivery', 'delivered'];
      const cur = activeOrder.manualStage || 'confirmed';
      const nxt = stages[Math.min(stages.indexOf(cur) + 1, stages.length - 1)];
      setActiveOrder({ ...activeOrder, manualStage: nxt, currentStage: nxt });
    } finally {
      setIsAdvancing(false);
    }
  };

  if (!isTrackerOpen) return null;

  const currentStage = activeOrder ? (activeOrder.manualStage || activeOrder.currentStage || 'confirmed') : 'confirmed';

  const stagesList = [
    { key: 'confirmed', title: 'Order Confirmed', subtitle: 'Verified & Queued', icon: CheckCircle2 },
    { key: 'packing', title: 'Packed with Fresh Seal', subtitle: 'Sanitized Eco-Boxes', icon: PackageCheck },
    { key: 'assigned', title: 'Driver Picked Up', subtitle: 'Dispatched from Hub', icon: UserCheck },
    { key: 'out_for_delivery', title: 'Out for Delivery', subtitle: 'On the Way to You', icon: Truck },
    { key: 'delivered', title: 'Safely Delivered', subtitle: 'Enjoy Fresh Food!', icon: Home }
  ];

  const stageKeys = stagesList.map(s => s.key);
  const currentStageIndex = stageKeys.indexOf(currentStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-nikhila-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-serif">Live Doorstep Tracking</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
                {isFirestoreConnected && (
                  <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-medium">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Firestore Sync
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Nikhila Foods Fresh Express Logistics Network
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackerOpen(false)}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Search by Order ID */}
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Track by Order ID (e.g. NF-88210)"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Track</span>}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeOrder && (
            <>
              {/* Order Status Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-500/10 p-5 rounded-2xl border border-amber-200/70 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-stone-500">Active Order ID</div>
                  <div className="text-xl font-black font-mono text-stone-900">
                    {activeOrder.orderId}
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    Slot: <strong className="text-stone-800">{activeOrder.deliverySlot}</strong>
                  </div>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-stone-200 shadow-xs text-right">
                  <div className="text-[11px] text-stone-500 uppercase tracking-wide font-bold">
                    Estimated Delivery
                  </div>
                  <div className="text-lg font-black text-emerald-700 flex items-center gap-1.5 justify-end">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{activeOrder.estimatedDeliveryTime || 'In 30 Mins'}</span>
                  </div>
                </div>
              </div>

              {/* Visual Multi-Step Progress Tracker */}
              <div className="py-4">
                <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-5">
                  Delivery Progress Timeline
                </div>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-200 -z-0">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-700"
                      style={{ width: `${(currentStageIndex / (stageKeys.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Stage Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {stagesList.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isPast = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={stage.key} className="flex sm:flex-col items-center gap-3 sm:text-center">
                          <div 
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                              isCurrent
                                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400/30 scale-110'
                                : isPast
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div>
                            <div className={`text-xs font-extrabold ${isCurrent ? 'text-amber-700' : isPast ? 'text-stone-900' : 'text-stone-400'}`}>
                              {stage.title}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {stage.subtitle}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Driver & Partner Card */}
              {activeOrder.deliveryPartner && (
                <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/90 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      👨🏽‍🌾
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                        Assigned Delivery Partner
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                        {activeOrder.deliveryPartner.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {activeOrder.deliveryPartner.vehicle} • ★ {activeOrder.deliveryPartner.rating}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeOrder.deliveryPartner.phone}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver ({activeOrder.deliveryPartner.phone})</span>
                  </a>
                </div>
              )}

              {/* Delivery Destination & Order Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Destination */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Delivery Location</span>
                  </div>
                  <p className="text-stone-800 font-semibold">{activeOrder.customer.name}</p>
                  <p className="text-stone-600">{activeOrder.customer.address}</p>
                  <p className="text-stone-500">{activeOrder.customer.city} - {activeOrder.customer.pincode}</p>
                  {activeOrder.customer.notes && (
                    <p className="text-amber-800 text-[11px] bg-amber-50 p-1.5 rounded border border-amber-200/60 mt-1">
                      Note: {activeOrder.customer.notes}
                    </p>
                  )}
                </div>

                {/* Items in this Delivery */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900">Items in Package:</div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {activeOrder.items && activeOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-stone-700">
                        <span className="line-clamp-1">{it.quantity}x {it.name} ({it.size})</span>
                        <span className="font-semibold text-stone-900">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-950">
                    <div>
                      <span>Grand Total: </span>
                      <span>₹{activeOrder.pricing ? activeOrder.pricing.totalAmount : 'Paid'}</span>
                    </div>
                    {activeOrder.paymentDetails?.status === 'PAID' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        ✓ PAID via Razorpay
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                        {activeOrder.paymentMethod || 'COD Due'}
                      </span>
                    )}
                  </div>
                  {activeOrder.paymentDetails?.paymentId && (
                    <div className="text-[10px] text-stone-400 font-mono truncate">
                      Txn: {activeOrder.paymentDetails.paymentId}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Simulation Controls */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-amber-950">Interactive Delivery Demo (Firestore Synced)</div>
                  <div className="text-[11px] text-amber-800">
                    Advances state in real time across Cloud Firestore and local server!
                  </div>
                </div>

                <button
                  onClick={handleAdvanceSimulation}
                  disabled={isAdvancing || currentStage === 'delivered'}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAdvancing ? 'animate-spin' : ''}`} />
                  <span>{currentStage === 'delivered' ? '✓ Order Completed' : 'Simulate Next Delivery Step'}</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Nikhila Foods Fresh Delivery Guarantee • Firebase Firestore Connected</span>
          </div>

          <button
            onClick={() => setIsTrackerOpen(false)}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-all"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
}

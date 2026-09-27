import React, { useState, useEffect } from 'react';
import { 
  X, Truck, ShieldCheck, CreditCard, Banknote, QrCode, CheckCircle2, 
  Clock, MapPin, User, Phone, ArrowLeft, Loader2, Sparkles, Lock, ArrowRight 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { saveOrderToFirestore, saveUserToFirestore } from '../services/firestoreService';
import { launchRazorpayPayment } from '../services/razorpayService';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartItems,
    subtotal,
    deliveryFee,
    tax,
    couponCode,
    couponDiscount,
    grandTotal,
    clearCart,
    setActiveOrder,
    setIsTrackerOpen
  } = useCart();

  const { user, setIsAuthOpen, fetchUserOrders } = useAuth();

  const [formData, setFormData] = useState({
    name: 'Ananya Sharma',
    phone: '9848022338',
    email: 'ananya@gmail.com',
    address: 'Flat 402, Green Meadows, Jubilee Hills Road No 36',
    city: 'Hyderabad',
    pincode: '500033',
    notes: 'Please handle mangoes gently. Call upon reaching gate.'
  });

  // Auto-fill from user profile when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address,
        city: user.city || prev.city,
        pincode: user.pincode || prev.pincode
      }));
    }
  }, [user]);

  const [deliverySlot, setDeliverySlot] = useState('Express 45-60 Mins');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' | 'COD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrderRecord = async (paymentDetails) => {
    const orderPayload = {
      customer: formData,
      items: cartItems,
      paymentMethod: paymentDetails.method,
      paymentDetails: {
        status: paymentDetails.status,
        paymentId: paymentDetails.paymentId || null,
        orderId: paymentDetails.orderId || null,
        signature: paymentDetails.signature || null,
        paidAt: paymentDetails.status === 'PAID' ? new Date().toISOString() : null
      },
      deliverySlot,
      couponCode
    };

    // 1. Post to Backend Server
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (data.success && data.order) {
      const finalOrder = {
        ...data.order,
        paymentDetails: orderPayload.paymentDetails
      };

      // 2. Sync to Cloud Firestore
      saveOrderToFirestore(finalOrder);
      saveUserToFirestore(formData);

      // 3. Update Cart Context & Open Live Order Tracking
      clearCart();
      setActiveOrder(finalOrder);
      setIsCheckoutOpen(false);
      setIsTrackerOpen(true);

      if (fetchUserOrders) {
        fetchUserOrders(formData.phone);
      }
      return true;
    } else {
      throw new Error(data.message || 'Failed to place order.');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      setErrorMsg('Please fill in all mandatory delivery fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Flow 1: Online Payment via Razorpay
    if (paymentMethod === 'Razorpay') {
      try {
        await launchRazorpayPayment({
          amount: grandTotal,
          customer: formData,
          items: cartItems,
          onSuccess: async (rzpResult) => {
            try {
              await createOrderRecord({
                method: 'Razorpay Online (UPI/Cards/NetBanking)',
                status: 'PAID',
                paymentId: rzpResult.paymentId,
                orderId: rzpResult.orderId,
                signature: rzpResult.signature
              });
            } catch (err) {
              setErrorMsg(err.message || 'Order creation failed after payment verification.');
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (errMsg) => {
            setIsSubmitting(false);
            setErrorMsg(`Razorpay error: ${errMsg}`);
          },
          onDismiss: () => {
            setIsSubmitting(false);
          }
        });
      } catch (err) {
        setIsSubmitting(false);
        setErrorMsg('Could not open Razorpay checkout. Please try again.');
      }
    } 
    // Flow 2: Cash on Delivery
    else {
      try {
        await createOrderRecord({
          method: 'Cash on Delivery (COD)',
          status: 'PAYMENT_DUE_ON_DELIVERY',
          paymentId: null,
          orderId: null
        });
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to place COD order.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-8 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-nikhila-amber-500 text-stone-950 shadow-md shadow-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-serif">
                  Checkout & Payment
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Fresh doorstep delivery with verified payments
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Banner */}
        {user ? (
          <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Delivering to <strong>{user.name}</strong> (+91 {user.phone})</span>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Profile Auto-Filled
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Have an account? Login with phone number to auto-fill address</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[11px] rounded-lg shadow-xs transition-all"
            >
              Login
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              <User className="w-4 h-4 text-amber-600" />
              <span>1. Recipient Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Mobile Number (for SMS & OTP) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Delivery Address</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">House/Flat No, Apartment, Street *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 402, Green Meadows, Jubilee Hills"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">City / Region *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 500033"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Delivery Instructions / Gate Landmark (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Handle mangoes gently, ring bell twice"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Slot */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>3. Preferred Delivery Slot</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Express 45-60 Mins', label: 'Express Delivery', desc: '45 - 60 Minutes', badge: 'Fastest' },
                { id: 'Evening Slot (5PM-8PM)', label: 'Evening Fresh', desc: '5:00 PM - 8:00 PM', badge: 'Popular' },
                { id: 'Morning Slot (8AM-11AM)', label: 'Morning Slot', desc: 'Tomorrow 8 AM - 11 AM' }
              ].map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setDeliverySlot(slot.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    deliverySlot === slot.id
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{slot.label}</span>
                    {slot.badge && (
                      <span className="bg-amber-100 text-amber-900 font-bold text-[9px] px-1.5 py-0.5 rounded">
                        {slot.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">{slot.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Payment Method (Razorpay & COD) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>4. Select Payment Method</span>
              </div>
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Safe & Secure
              </span>
            </div>

            <div className="space-y-3">
              {/* Option 1: Razorpay Gateway */}
              <div
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'bg-gradient-to-r from-amber-50/90 to-emerald-50/60 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      💳
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-stone-900">
                          Razorpay Secure Online Payment
                        </span>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking (50+ Banks), Wallets & Cred.
                      </p>

                      {/* Payment Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold text-stone-700">
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">GPay</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">PhonePe</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">Paytm</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">Visa/Mastercard</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">RuPay</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-stone-200">NetBanking</span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 flex-shrink-0 ${paymentMethod === 'Razorpay' ? 'border-amber-600 bg-amber-600' : 'border-stone-300'}`}>
                    {paymentMethod === 'Razorpay' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      💵
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">
                        Cash on Delivery (Pay at Doorstep)
                      </div>
                      <div className="text-xs text-stone-500">
                        Inspect food packages before handing cash to the delivery partner.
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'}`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary & Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500">Total Payable Amount:</div>
              <div className="text-2xl font-black text-stone-950">₹{grandTotal}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                ✓ Includes all items, taxes & doorstep delivery
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 active:scale-95 disabled:opacity-50 text-stone-950 font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all ${
                paymentMethod === 'Razorpay'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : paymentMethod === 'Razorpay' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{grandTotal} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span>Confirm Cash on Delivery Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

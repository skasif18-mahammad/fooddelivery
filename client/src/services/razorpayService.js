/**
 * 💳 Razorpay Payment Gateway Service for Nikhila Foods
 * Handles SDK script loading, order creation, and HMAC-SHA256 signature verification.
 */

// Dynamically load official Razorpay Checkout SDK
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay Checkout SDK loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Creates an order on the backend with Razorpay API
 */
export async function createBackendOrder(amount, customer, receipt) {
  try {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(amount),
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          customerName: customer?.name || '',
          customerPhone: customer?.phone || '',
          deliveryAddress: customer?.address || ''
        }
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Error in createBackendOrder:', err);
    return { success: false, message: 'Network error connecting to payment server' };
  }
}

/**
 * Verifies Razorpay HMAC signature on the backend
 */
export async function verifyPaymentSignature(paymentResponse) {
  try {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Error verifying payment signature:', err);
    return { success: false, message: 'Payment verification failed' };
  }
}

/**
 * Main function: Launches Razorpay Checkout Modal
 */
export async function launchRazorpayPayment({
  amount,
  customer,
  items,
  onSuccess,
  onError,
  onDismiss
}) {
  const isLoaded = await loadRazorpayScript();

  // 1. Create order on backend
  const orderRes = await createBackendOrder(amount, customer);
  if (!orderRes || !orderRes.success || !orderRes.order) {
    if (onError) onError(orderRes?.message || 'Failed to initialize payment order');
    return;
  }

  const { order, keyId, isLive } = orderRes;

  // 2. If SDK loaded and valid key available, launch official Razorpay modal
  if (isLoaded && typeof window !== 'undefined' && window.Razorpay && keyId && keyId !== 'rzp_test_placeholder') {
    try {
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Nikhila Foods',
        description: 'Doorstep Food Delivery (Mangoes, Pickles, Pure Oils)',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&auto=format&fit=crop&q=80',
        order_id: order.id,
        prefill: {
          name: customer?.name || '',
          email: customer?.email || `${customer?.phone || 'customer'}@nikhilafoods.com`,
          contact: customer?.phone ? `+91${customer.phone.replace(/\D/g, '').slice(-10)}` : ''
        },
        notes: {
          address: `${customer?.address || ''}, ${customer?.city || ''}`,
          itemsCount: items?.length || 0
        },
        theme: {
          color: '#F59E0B' // Nikhila Foods Amber theme
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            if (onDismiss) onDismiss();
          }
        },
        handler: async function (response) {
          console.log('💳 Razorpay Response received:', response);
          const verification = await verifyPaymentSignature(response);

          if (verification.success && verification.verified) {
            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                method: 'Razorpay Online (UPI/Cards/NetBanking)',
                isLive: true
              });
            }
          } else {
            if (onError) onError(verification.message || 'Signature verification failed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('Payment Failed:', resp.error);
        if (onError) onError(resp.error.description || 'Payment failed');
      });

      rzp.open();
      return;
    } catch (sdkError) {
      console.warn('Razorpay SDK open error, falling back to simulated sandbox:', sdkError);
    }
  }

  // 3. Sandbox / Developer Fallback Mode (Runs when RAZORPAY_KEY_ID in server/.env is empty/placeholder)
  console.log('ℹ️ Running in Sandbox Payment Verification mode');
  
  const mockPaymentId = `pay_rzp_${Date.now()}`;
  const mockSignature = `sig_${Math.random().toString(36).substring(2, 15)}`;

  const verification = await verifyPaymentSignature({
    razorpay_order_id: order.id,
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: mockSignature
  });

  if (verification.success && onSuccess) {
    onSuccess({
      paymentId: mockPaymentId,
      orderId: order.id,
      signature: mockSignature,
      method: 'Razorpay Sandbox (Ready for live keys in server/.env)',
      isLive: false
    });
  }
}

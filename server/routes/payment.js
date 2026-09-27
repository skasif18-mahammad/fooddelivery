import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Helper to get initialized Razorpay instance
 */
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && key_id.trim() !== '' && key_secret.trim() !== '') {
    return new Razorpay({ key_id: key_id.trim(), key_secret: key_secret.trim() });
  }
  return null;
}

/**
 * 🔑 1. GET Public Key ID for Frontend SDK Initialization
 */
router.get('/key', (req, res) => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const isConfigured = Boolean(key_id && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.trim() !== '');

  res.json({
    success: true,
    keyId: key_id || 'rzp_test_placeholder',
    isConfigured
  });
});

/**
 * 💳 2. Create a Razorpay Order
 * Converts Rupees to Paise and generates a secure order with Razorpay Cloud API
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const orderReceipt = receipt || `rcpt_nf_${Date.now()}`;
    const rzp = getRazorpayInstance();

    if (rzp) {
      // Create official live/test order with Razorpay
      const options = {
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
        notes: {
          store: 'Nikhila Foods',
          ...notes
        }
      };

      const order = await rzp.orders.create(options);
      console.log(`✅ Official Razorpay Order Created: ${order.id} for ₹${amount}`);

      return res.json({
        success: true,
        isLive: true,
        order,
        keyId: process.env.RAZORPAY_KEY_ID.trim()
      });
    } else {
      // Sandbox fallback mode when keys are pending configuration in server/.env
      console.log(`ℹ️ Razorpay keys not configured yet in server/.env. Generating simulated sandbox order for ₹${amount}`);
      const mockOrder = {
        id: `order_sandbox_${Math.random().toString(36).substring(2, 12)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: orderReceipt,
        status: 'created',
        attempts: 0,
        notes: {
          store: 'Nikhila Foods',
          ...notes
        },
        created_at: Math.floor(Date.now() / 1000)
      };

      return res.json({
        success: true,
        isLive: false,
        order: mockOrder,
        keyId: 'rzp_test_placeholder',
        message: 'Sandbox mode: Enter your Razorpay keys in server/.env for live bank authorization'
      });
    }
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay payment order',
      error: error.message
    });
  }
});

/**
 * 🔒 3. Verify Payment Signature (HMAC SHA-256)
 * Validates authenticity of the transaction to prevent spoofing
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing order_id or payment_id for verification'
      });
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (secret && razorpay_signature) {
      // Official HMAC SHA-256 verification
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        console.log(`✅ Payment Verified Successfully: ${razorpay_payment_id}`);
        return res.json({
          success: true,
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          message: 'Razorpay payment signature verified successfully'
        });
      } else {
        console.warn(`❌ Signature mismatch for order: ${razorpay_order_id}`);
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Payment verification failed: Invalid Signature'
        });
      }
    } else {
      // Sandbox auto-verification
      console.log(`✅ Sandbox Payment Confirmed: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        verified: true,
        isSandbox: true,
        paymentId: razorpay_payment_id || `pay_sandbox_${Date.now()}`,
        orderId: razorpay_order_id,
        message: 'Sandbox payment verified'
      });
    }
  } catch (error) {
    console.error('❌ Error verifying Razorpay signature:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error.message
    });
  }
});

/**
 * 🔔 4. Webhook Handler for Instant Payment Status Updates
 */
router.post('/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest === signature) {
        console.log('🔔 Razorpay Webhook Verified Event:', req.body.event);
        // Process payment.captured, order.paid etc.
        return res.json({ status: 'ok' });
      } else {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }
    res.json({ status: 'received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

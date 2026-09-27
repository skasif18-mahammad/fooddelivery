import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Ensure data directory and orders.json exists
if (!fs.existsSync(ordersFilePath)) {
  fs.writeFileSync(ordersFilePath, JSON.stringify([]), 'utf-8');
}

function getOrders() {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
}

const DELIVERY_PARTNERS = [
  { name: 'Ramesh Kumar', phone: '+91 98480 22338', vehicle: 'Eco Delivery Van (AP 29 BK 4092)', rating: 4.9 },
  { name: 'Suresh Reddy', phone: '+91 97001 54321', vehicle: 'Express Two-Wheeler (TS 08 EF 7712)', rating: 4.8 },
  { name: 'Praveen Varma', phone: '+91 99882 11223', vehicle: 'Fresh Van Cooler (AP 16 ZX 8901)', rating: 4.95 }
];

// Helper to determine stage based on creation time or manual step
function enrichOrderStatus(order) {
  const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
  
  // If explicitly advanced or set to a custom stage
  if (order.manualStage) {
    order.currentStage = order.manualStage;
  } else {
    // Automatic progressive timeline
    if (elapsedMinutes < 2) {
      order.currentStage = 'confirmed';
    } else if (elapsedMinutes < 5) {
      order.currentStage = 'packing';
    } else if (elapsedMinutes < 12) {
      order.currentStage = 'assigned';
    } else if (elapsedMinutes < 25) {
      order.currentStage = 'out_for_delivery';
    } else {
      order.currentStage = 'delivered';
    }
  }

  const stageList = [
    {
      key: 'confirmed',
      title: 'Order Confirmed',
      desc: 'Order received and payment verified. Sent to Nikhila Foods Hub.',
      icon: 'CheckCircle2',
      isCompleted: ['confirmed', 'packing', 'assigned', 'out_for_delivery', 'delivered'].includes(order.currentStage),
      isCurrent: order.currentStage === 'confirmed'
    },
    {
      key: 'packing',
      title: 'Packed & Freshness Sealed',
      desc: 'Mangoes sanitized & cushioned in eco-boxes; oils & pickles hermetically sealed.',
      icon: 'PackageCheck',
      isCompleted: ['packing', 'assigned', 'out_for_delivery', 'delivered'].includes(order.currentStage),
      isCurrent: order.currentStage === 'packing'
    },
    {
      key: 'assigned',
      title: 'Delivery Partner Assigned',
      desc: `${order.deliveryPartner.name} has picked up your package.`,
      icon: 'UserCheck',
      isCompleted: ['assigned', 'out_for_delivery', 'delivered'].includes(order.currentStage),
      isCurrent: order.currentStage === 'assigned'
    },
    {
      key: 'out_for_delivery',
      title: 'Out for Doorstep Delivery',
      desc: `On the way to ${order.customer.address}, ${order.customer.city}.`,
      icon: 'Truck',
      isCompleted: ['out_for_delivery', 'delivered'].includes(order.currentStage),
      isCurrent: order.currentStage === 'out_for_delivery'
    },
    {
      key: 'delivered',
      title: 'Delivered at Doorstep',
      desc: 'Package handed over fresh and intact. Enjoy your food!',
      icon: 'Home',
      isCompleted: order.currentStage === 'delivered',
      isCurrent: order.currentStage === 'delivered'
    }
  ];

  order.timeline = stageList;
  return order;
}

// POST: Create a new order
router.post('/', (req, res) => {
  try {
    const { customer, items, paymentMethod, deliverySlot, couponCode } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Please provide complete delivery details' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const orders = getOrders();
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    const orderId = `NF-${orderNumber}`;

    // Compute pricing
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'NIKHILA10') {
      discount = Math.round(subtotal * 0.10);
    } else if (couponCode && couponCode.toUpperCase() === 'FRESH50' && subtotal >= 500) {
      discount = 50;
    }

    const taxes = Math.round(subtotal * 0.05); // 5% GST on packaged food products
    const totalAmount = subtotal + deliveryFee + taxes - discount;

    const assignedPartner = DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      deliverySlot: deliverySlot || 'Standard Delivery (Under 90 Mins)',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        couponCode: couponCode || null,
        taxes,
        totalAmount
      },
      deliveryPartner: assignedPartner,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      manualStage: 'confirmed'
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    const enriched = enrichOrderStatus(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Preparing fresh delivery.',
      order: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
});

// GET: Single order by ID with live tracking status
router.get('/:id', (req, res) => {
  try {
    const orders = getOrders();
    const order = orders.find(o => o.orderId.toUpperCase() === req.params.id.toUpperCase());

    if (!order) {
      return res.status(404).json({ success: false, message: `No order found with ID ${req.params.id}` });
    }

    const enriched = enrichOrderStatus(order);
    res.json({ success: true, order: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking order', error: error.message });
  }
});

// POST: Simulate or advance order stage for live demonstration
router.post('/:id/advance', (req, res) => {
  try {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.orderId.toUpperCase() === req.params.id.toUpperCase());

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stages = ['confirmed', 'packing', 'assigned', 'out_for_delivery', 'delivered'];
    const current = orders[orderIndex].manualStage || 'confirmed';
    const nextIndex = Math.min(stages.indexOf(current) + 1, stages.length - 1);
    orders[orderIndex].manualStage = stages[nextIndex];

    saveOrders(orders);

    const enriched = enrichOrderStatus(orders[orderIndex]);
    res.json({ success: true, message: `Advanced to stage: ${stages[nextIndex]}`, order: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to advance stage', error: error.message });
  }
});

// GET: All recent orders
router.get('/', (req, res) => {
  try {
    const orders = getOrders();
    const enrichedOrders = orders.slice(0, 10).map(enrichOrderStatus);
    res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

export default router;

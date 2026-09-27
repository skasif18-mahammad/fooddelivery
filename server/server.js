import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import paymentRouter from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure seed order exists for initial tracking demonstration
const ordersFile = path.join(__dirname, 'data/orders.json');
if (!fs.existsSync(ordersFile) || fs.readFileSync(ordersFile, 'utf-8').trim() === '' || JSON.parse(fs.readFileSync(ordersFile, 'utf-8')).length === 0) {
  const seedOrder = [
    {
      orderId: "NF-88210",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      customer: {
        name: "Ananya Sharma",
        phone: "+91 98765 12345",
        email: "ananya@example.com",
        address: "Flat 402, Green Meadows, Jubilee Hills",
        city: "Hyderabad",
        pincode: "500033",
        notes: "Ring doorbell twice, leave with security if not reachable"
      },
      items: [
        {
          id: "mango-01",
          name: "Banganapalli Sweet Mangoes",
          size: "5 kg Family Crate",
          price: 799,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80"
        },
        {
          id: "pickle-01",
          name: "Grandma's Andhra Avakaya Mango Pickle",
          size: "500g Ceramic Jar",
          price: 299,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80"
        },
        {
          id: "oil-01",
          name: "Wood-Pressed (Chekku) Groundnut Oil",
          size: "1 Litre Bottle",
          price: 319,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80"
        }
      ],
      deliverySlot: "Express Delivery (Under 45 Mins)",
      paymentMethod: "UPI (Google Pay)",
      pricing: {
        subtotal: 1736,
        deliveryFee: 0,
        discount: 174,
        couponCode: "NIKHILA10",
        taxes: 87,
        totalAmount: 1649
      },
      deliveryPartner: {
        name: "Ramesh Kumar",
        phone: "+91 98480 22338",
        vehicle: "Eco Delivery Van (AP 29 BK 4092)",
        rating: 4.9
      },
      estimatedDeliveryTime: "In 15 Mins",
      manualStage: "out_for_delivery"
    }
  ];
  fs.writeFileSync(ordersFile, JSON.stringify(seedOrder, null, 2), 'utf-8');
}

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Nikhila Foods Backend API',
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Nikhila Foods API Server running on port ${PORT}`);
  console.log(`📡 Products API: http://localhost:${PORT}/api/products`);
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
});

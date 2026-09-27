import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const usersFilePath = path.join(__dirname, '../data/users.json');
const ordersFilePath = path.join(__dirname, '../data/orders.json');

// In-memory OTP storage: phone -> { otp, expiresAt }
const otpStore = new Map();

function getUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

function getOrders() {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

// 1. Send OTP
router.post('/send-otp', (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Generate 4-digit OTP (e.g. fixed easy test OTP or random)
    // For demo/testing, 1234 is also universally supported
    const generatedOtp = cleanPhone === '9848022338' ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();

    otpStore.set(cleanPhone, {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    });

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      phone: cleanPhone,
      otp: generatedOtp // returned for transparent instant developer/user testing without SMS costs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

// 2. Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    const cleanOtp = (otp || '').toString().trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number' });
    }

    const record = otpStore.get(cleanPhone);
    const isValid = (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) || cleanOtp === '1234';

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please use the test OTP shown or 1234.'
      });
    }

    // OTP verified: remove from temporary store
    otpStore.delete(cleanPhone);

    const users = getUsers();
    const existingUser = users.find(u => u.phone === cleanPhone);

    if (existingUser) {
      return res.json({
        success: true,
        isNewUser: false,
        message: `Welcome back, ${existingUser.name}!`,
        user: existingUser,
        token: `session_${cleanPhone}_${Date.now()}`
      });
    } else {
      // New phone number - needs quick profile completion
      return res.json({
        success: true,
        isNewUser: true,
        message: 'Phone verified! Please complete your delivery profile.',
        phone: cleanPhone,
        token: `session_${cleanPhone}_${Date.now()}`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
});

// 3. Complete Profile (for new users)
router.post('/complete-profile', (req, res) => {
  try {
    const { phone, name, email, address, city, pincode } = req.body;
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const users = getUsers();
    let userIndex = users.findIndex(u => u.phone === cleanPhone);

    const userObj = {
      id: userIndex >= 0 ? users[userIndex].id : `usr-${Date.now()}`,
      phone: cleanPhone,
      name: name.trim(),
      email: email ? email.trim() : `${cleanPhone}@nikhilafoods.com`,
      address: address ? address.trim() : 'Jubilee Hills Road',
      city: city ? city.trim() : 'Hyderabad',
      pincode: pincode ? pincode.trim() : '500033',
      createdAt: userIndex >= 0 ? users[userIndex].createdAt : new Date().toISOString()
    };

    if (userIndex >= 0) {
      users[userIndex] = userObj;
    } else {
      users.push(userObj);
    }

    saveUsers(users);

    res.json({
      success: true,
      message: 'Profile created successfully!',
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save profile', error: error.message });
  }
});

// 4. Get User Orders
router.get('/orders/:phone', (req, res) => {
  try {
    const cleanPhone = req.params.phone.toString().replace(/\D/g, '').slice(-10);
    const orders = getOrders();
    const userOrders = orders.filter(o => 
      o.customer && o.customer.phone && o.customer.phone.toString().replace(/\D/g, '').slice(-10) === cleanPhone
    );

    res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user orders' });
  }
});

export default router;

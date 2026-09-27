import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveUserToFirestore, fetchUserOrdersFromFirestore, getUserFromFirestore } from '../services/firestoreService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nikhila_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Sync to localStorage and Cloud Firestore
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('nikhila_user', JSON.stringify(user));
        // Sync profile to Cloud Firestore
        saveUserToFirestore(user).catch(err => console.warn('Firestore user sync:', err));
      } else {
        localStorage.removeItem('nikhila_user');
      }
    } catch (e) {
      console.error('Error persisting user:', e);
    }
  }, [user]);

  // Fetch orders when user changes
  useEffect(() => {
    if (user && user.phone) {
      fetchUserOrders(user.phone);
    } else {
      setUserOrders([]);
    }
  }, [user]);

  const sendOtp = async (phone) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Network error sending OTP' };
    }
  };

  const verifyOtp = async (phone, otp) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveUserToFirestore(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, message: 'Network error verifying OTP' };
    }
  };

  const completeProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveUserToFirestore(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const demoLogin = async () => {
    const result = await verifyOtp('9848022338', '1234');
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserOrders([]);
    localStorage.removeItem('nikhila_user');
  };

  const fetchUserOrders = async (phone) => {
    const cleanPhone = phone || (user && user.phone);
    if (!cleanPhone) return;

    let combined = [];

    // 1. Fetch from Local Backend API
    try {
      const res = await fetch(`/api/auth/orders/${cleanPhone}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        combined = [...data.orders];
      }
    } catch (err) {
      console.warn('API orders fetch fallback:', err);
    }

    // 2. Fetch from Cloud Firestore
    try {
      const firestoreOrders = await fetchUserOrdersFromFirestore(cleanPhone);
      if (Array.isArray(firestoreOrders) && firestoreOrders.length > 0) {
        // Merge without duplicate orderIds
        const existingIds = new Set(combined.map(o => o.orderId));
        for (const fo of firestoreOrders) {
          if (!existingIds.has(fo.orderId)) {
            combined.unshift(fo);
          }
        }
      }
    } catch (err) {
      console.warn('Firestore orders fetch fallback:', err);
    }

    setUserOrders(combined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthOpen,
        setIsAuthOpen,
        sendOtp,
        verifyOtp,
        completeProfile,
        demoLogin,
        logout,
        userOrders,
        fetchUserOrders,
        isOrdersModalOpen,
        setIsOrdersModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

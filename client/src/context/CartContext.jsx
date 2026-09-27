import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('nikhila_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('nikhila_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedOption, qty = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.size === selectedOption.size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          size: selectedOption.size,
          price: selectedOption.price,
          originalPrice: selectedOption.originalPrice,
          image: product.image,
          quantity: qty
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponSuccess('');
    setCouponError('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeDeliveryThreshold = 499;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'NIKHILA10') {
      const discount = Math.round(subtotal * 0.10);
      setCouponCode('NIKHILA10');
      setCouponDiscount(discount);
      setCouponSuccess('Coupon NIKHILA10 applied: 10% OFF!');
      setCouponError('');
      return true;
    } else if (cleanCode === 'FRESH50') {
      if (subtotal < 500) {
        setCouponError('Minimum order of ₹500 required for FRESH50');
        setCouponSuccess('');
        return false;
      }
      setCouponCode('FRESH50');
      setCouponDiscount(50);
      setCouponSuccess('Coupon FRESH50 applied: ₹50 Flat OFF!');
      setCouponError('');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try NIKHILA10');
      setCouponSuccess('');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponSuccess('');
    setCouponError('');
  };

  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - couponDiscount);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackerOpen,
        setIsTrackerOpen,
        activeOrder,
        setActiveOrder,
        subtotal,
        freeDeliveryThreshold,
        deliveryFee,
        tax,
        couponCode,
        couponDiscount,
        couponSuccess,
        couponError,
        applyCoupon,
        removeCoupon,
        grandTotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

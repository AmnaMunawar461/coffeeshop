import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 } });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 } });
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (productId, quantity, customizations) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      setLoading(true);
      await cartAPI.add({
        product_id: productId,
        quantity,
        customizations
      });
      
      await fetchCart(); // Refresh cart
      toast.success('Item added to cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      await cartAPI.update(itemId, { quantity });
      await fetchCart(); // Refresh cart
      toast.success('Cart updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await cartAPI.remove(itemId);
      await fetchCart(); // Refresh cart
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to remove item';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clear();
      setCart({ items: [], summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 } });
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to clear cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cart.summary.itemCount || 0;
  };

  const getCartTotal = () => {
    return cart.summary.total || 0;
  };

  const isItemInCart = (productId, customizations) => {
    return cart.items.some(item => {
      if (item.product_id !== productId) return false;
      
      // Compare customizations
      const itemCustomizations = item.customizations ? JSON.parse(item.customizations) : null;
      
      if (!customizations && !itemCustomizations) return true;
      if (!customizations || !itemCustomizations) return false;
      
      return JSON.stringify(customizations) === JSON.stringify(itemCustomizations);
    });
  };

  const getItemQuantity = (productId, customizations) => {
    const item = cart.items.find(item => {
      if (item.product_id !== productId) return false;
      
      const itemCustomizations = item.customizations ? JSON.parse(item.customizations) : null;
      
      if (!customizations && !itemCustomizations) return true;
      if (!customizations || !itemCustomizations) return false;
      
      return JSON.stringify(customizations) === JSON.stringify(itemCustomizations);
    });
    
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    isItemInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

import { useState, useCallback, useEffect } from 'react';
import { CartItem, MenuItem } from '../types';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('biteful-cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('biteful-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((menuItem: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems(current => {
      const existing = current.find(i => i.id === menuItem.id && i.restaurantId === restaurantId);
      if (existing) {
        return current.map(i => 
          i.id === menuItem.id && i.restaurantId === restaurantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...current, { ...menuItem, quantity: 1, restaurantId, restaurantName }];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: string, restaurantId: string) => {
    setItems(current => current.filter(i => !(i.id === menuItemId && i.restaurantId === restaurantId)));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, restaurantId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(menuItemId, restaurantId);
      return;
    }
    setItems(current => 
      current.map(i => 
        i.id === menuItemId && i.restaurantId === restaurantId
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items, isOpen, setIsOpen, addToCart, removeFromCart,
    updateQuantity, clearCart, total, itemCount
  };
};

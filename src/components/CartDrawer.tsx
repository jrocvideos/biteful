import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (menuItemId: string, restaurantId: string, quantity: number) => void;
  onRemove: (menuItemId: string, restaurantId: string) => void;
  total: number;
}

export const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, total }: CartDrawerProps) => {
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const restaurantGroups = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
    acc[item.restaurantId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <button
                    onClick={() => { onClose(); navigate('/restaurants'); }}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                  >
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(restaurantGroups).map(([restaurantId, groupItems]) => (
                    <div key={restaurantId} className="bg-card rounded-xl border border-border p-4">
                      <h3 className="font-semibold mb-3">{groupItems[0].restaurantName}</h3>
                      <div className="space-y-3">
                        {groupItems.map((item) => (
                          <div key={`${item.id}-${item.restaurantId}`} className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity - 1)}
                                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity + 1)}
                                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right min-w-[60px]">
                              <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                              <button onClick={() => onRemove(item.id, item.restaurantId)} className="text-red-500 hover:text-red-600 mt-1">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery & Fees</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full py-2 text-red-500 text-sm font-medium hover:text-red-600"
                >
                  Clear Cart
                </button>
              </div>
            )}

            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border"
                  >
                    <h3 className="font-bold text-lg mb-2">Clear your cart?</h3>
                    <p className="text-muted-foreground text-sm mb-4">This will remove all items from your cart.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-2.5 border border-border rounded-xl font-medium hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { items.forEach(i => onRemove(i.id, i.restaurantId)); setShowClearConfirm(false); }}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                      >
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, restaurantId: string, quantity: number) => void;
  onRemove: (itemId: string, restaurantId: string) => void;
  total: number;
}

export const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, total }: CartDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Your Order</h2>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{items.length} items</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-primary font-medium hover:underline">Browse Restaurants</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div layout key={`${item.restaurantId}-${item.id}`} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.restaurantName}</p>
                      <p className="text-primary font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => onRemove(item.id, item.restaurantId)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                        <button onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity - 1)} className="p-1 rounded-full hover:bg-background transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity + 1)} className="p-1 rounded-full hover:bg-background transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t bg-card space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Delivery Fee</span><span>$2.99</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${(total * 0.08).toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t"><span>Total</span><span>${(total + 2.99 + (total * 0.08)).toFixed(2)}</span></div>
                </div>
                <button className="w-full py-4 rounded-full gradient-hero text-white font-bold text-lg shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all">Checkout</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

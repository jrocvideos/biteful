import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Clock, ChevronRight, Minus, Plus, Trash2, Tag, Bike, Shield, Star, TrendingDown, Info } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutPageProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (menuItemId: string, restaurantId: string, quantity: number) => void;
  onRemove: (menuItemId: string, restaurantId: string) => void;
  onClearCart: () => void;
}

const getAsapFee = (): number => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  if (totalMinutes >= 16 * 60 + 45 && totalMinutes <= 18 * 60 + 55) return 6.14;
  if ((totalMinutes >= 7 * 60 && totalMinutes <= 9 * 60 + 30) || (totalMinutes >= 11 * 60 + 30 && totalMinutes <= 13 * 60 + 30)) return 5.69;
  return 5.49;
};

const getAsapLabel = (fee: number): string => {
  if (fee === 6.14) return 'Peak rush pricing';
  if (fee === 5.69) return 'Rush hour pricing';
  return '';
};

export const CheckoutPage = ({ items, total, onUpdateQuantity, onRemove, onClearCart }: CheckoutPageProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'delivery' | 'payment'>('cart');
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'schedule'>('asap');
  const [scheduledTime, setScheduledTime] = useState('');
  const [tip, setTip] = useState(0.15);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');
  const [loading, setLoading] = useState(false);
  const [showSavingsBreakdown, setShowSavingsBreakdown] = useState(false);

  const subtotal = total;
  const adminFee = 2.09;
  const asapFee = getAsapFee();
  const deliveryFee = 8.29;
  const totalDelivery = deliveryTime === 'asap' ? deliveryFee + asapFee : deliveryFee;
  const serviceFee = subtotal * 0.05;
  const tax = subtotal * 0.12;
  const tipAmount = subtotal * tip;
  const discount = promoApplied ? subtotal * 0.10 : 0;
  const finalTotal = subtotal + adminFee + totalDelivery + serviceFee + tax + tipAmount - discount;

  const uberDeliveryFee = 11.99;
  const uberServiceFee = subtotal * 0.15;
  const uberTotal = subtotal + uberDeliveryFee + uberServiceFee + tax + tipAmount - discount;
  const totalSavings = uberTotal - finalTotal;

  const restaurantGroups = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
    acc[item.restaurantId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handlePlaceOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    onClearCart();
    navigate(`/order/${orderId}`);
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-background flex items-center justify-center">
        <div className="text-center">
          <Bike className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items to get started</p>
          <button onClick={() => navigate('/restaurants')} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium">Browse Restaurants</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          {['Cart', 'Delivery', 'Payment'].map((s, i) => {
            const steps = ['cart', 'delivery', 'payment'];
            const isActive = steps[i] === step;
            const isDone = steps.indexOf(step) > i;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>{isDone ? '✓' : i + 1}</div>
                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {step === 'cart' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
                {Object.entries(restaurantGroups).map(([restaurantId, groupItems]) => (
                  <div key={restaurantId} className="bg-card rounded-2xl border border-border p-6 mb-4">
                    <h3 className="font-bold text-lg mb-4">{groupItems[0].restaurantName}</h3>
                    <div className="space-y-4">
                      {groupItems.map((item) => (
                        <div key={`${item.id}-${item.restaurantId}`} className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity - 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.restaurantId, item.quantity + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Plus className="w-4 h-4" /></button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => onRemove(item.id, item.restaurantId)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {totalSavings > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800">You're saving ${totalSavings.toFixed(2)} vs UberEats</p>
                          <p className="text-xs text-green-600">Lower fees, same great delivery</p>
                        </div>
                      </div>
                      <button onClick={() => setShowSavingsBreakdown(!showSavingsBreakdown)} className="text-green-600 hover:text-green-800"><Info className="w-5 h-5" /></button>
                    </div>
                    {showSavingsBreakdown && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-green-200">
                        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-green-700 mb-2">
                          <span>Fee</span><span className="text-center text-red-500">UberEats</span><span className="text-right text-green-600">Boufet</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-green-100">
                          <span className="text-green-800">Delivery</span>
                          <span className="text-center text-red-500 line-through">${uberDeliveryFee.toFixed(2)}</span>
                          <span className="text-right font-bold text-green-600">${totalDelivery.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-green-100">
                          <span className="text-green-800">Service Fee</span>
                          <span className="text-center text-red-500 line-through">${uberServiceFee.toFixed(2)}</span>
                          <span className="text-right font-bold text-green-600">${serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm pt-2 font-bold">
                          <span className="text-green-800">Total Saved</span><span></span>
                          <span className="text-right text-green-600">${totalSavings.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                <button onClick={() => setStep('delivery')} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors">Proceed to Delivery →</button>
              </motion.div>
            )}

            {step === 'delivery' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Delivery Details</h1>
                <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your street address" className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <input type="text" value={apt} onChange={(e) => setApt(e.target.value)} placeholder="Apt, suite, floor (optional)" className="w-full mt-3 px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3">Delivery Time</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setDeliveryTime('asap')} className={`p-4 rounded-xl border-2 text-center transition-colors ${deliveryTime === 'asap' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                        <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">ASAP</p>
                        <p className="text-xs text-muted-foreground">~25–35 min</p>
                        <p className="text-xs font-semibold text-primary mt-1">+${asapFee.toFixed(2)}</p>
                        {getAsapLabel(asapFee) && <p className="text-[10px] text-orange-500 mt-0.5">{getAsapLabel(asapFee)}</p>}
                      </button>
                      <button onClick={() => setDeliveryTime('schedule')} className={`p-4 rounded-xl border-2 text-center transition-colors ${deliveryTime === 'schedule' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                        <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">Schedule</p>
                        <p className="text-xs text-muted-foreground">Pick a time</p>
                      </button>
                    </div>
                    {deliveryTime === 'schedule' && <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full mt-3 px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Driver Tip</label>
                    <p className="text-xs text-muted-foreground mb-3">100% goes directly to your driver</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.10, 0.15, 0.20, 0.25].map((t) => (
                        <button key={t} onClick={() => setTip(t)} className={`py-2 rounded-xl text-sm font-medium border transition-colors ${tip === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}>
                          {Math.round(t * 100)}%
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Tip: ${tipAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('cart')} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted">← Back</button>
                  <button onClick={() => setStep('payment')} disabled={!address} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Continue to Payment →</button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-2xl font-bold mb-6">Payment</h1>
                <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[{ id: 'card', icon: CreditCard, label: 'Card' }, { id: 'apple', icon: CreditCard, label: 'Apple Pay' }, { id: 'google', icon: CreditCard, label: 'Google Pay' }].map((m) => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`p-4 rounded-xl border-2 text-center transition-colors ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                        <m.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold text-sm">{m.label}</p>
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">CVC</label>
                          <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl">
                    <Shield className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-green-700">Your payment is secured with 256-bit encryption</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('delivery')} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-70">
                    {loading ? 'Placing Order...' : `Place Order • $${finalTotal.toFixed(2)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-28 bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo code" className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <button onClick={() => setPromoApplied(promoCode.length > 0)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Apply</button>
                </div>
                {promoApplied && <p className="text-xs text-green-600 mt-1">✓ 10% discount applied</p>}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin Fee</span>
                  <span className="font-medium">${adminFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <div className="text-right">
                    <span className="text-xs text-red-400 line-through mr-1">${uberDeliveryFee.toFixed(2)}</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
                {deliveryTime === 'asap' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ASAP Fee{getAsapLabel(asapFee) && <span className="ml-1 text-[10px] text-orange-500">({getAsapLabel(asapFee)})</span>}
                    </span>
                    <span className="font-medium">${asapFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin Fee (5%)</span>
                  <div className="text-right">
                    <span className="text-xs text-red-400 line-through mr-1">${uberServiceFee.toFixed(2)}</span>
                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (12% GST/PST)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Tip</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium bg-green-50 rounded-lg px-2 py-1">
                    <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Saved vs UberEats</span>
                    <span>-${totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-xl flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>Earn {(finalTotal * 0.05).toFixed(0)} Boufet points with this order</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

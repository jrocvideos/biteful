import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Bike, CheckCircle, ChefHat, Package, Home, Star, Receipt, Copy, Check, Zap, Clock, Navigation, RotateCcw } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';

type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'en_route' | 'arriving' | 'delivered';

const statusSteps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, description: 'Restaurant received your order' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Kitchen is cooking your food' },
  { id: 'ready', label: 'Ready for Pickup', icon: Package, description: 'Food is packed and waiting' },
  { id: 'picked_up', label: 'Driver Picked Up', icon: Bike, description: 'Driver has your order' },
  { id: 'en_route', label: 'On the Way', icon: Navigation, description: 'Heading to your address' },
  { id: 'arriving', label: 'Arriving Soon', icon: MapPin, description: 'Driver is near your location' },
  { id: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your meal!' },
] as const;

export const OrderTracking = () => {
  const { id } = useParams();
  const [status, setStatus] = useState<OrderStatus>('confirmed');
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [savedToHistory, setSavedToHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`biteful-order-${id}`);
    if (saved) setOrderData(JSON.parse(saved));
  }, [id]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus('preparing'), 3000),
      setTimeout(() => setStatus('ready'), 6000),
      setTimeout(() => setStatus('picked_up'), 9000),
      setTimeout(() => setStatus('en_route'), 12000),
      setTimeout(() => setStatus('arriving'), 18000),
      setTimeout(() => { setStatus('delivered'); setShowRating(true); }, 24000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (status === 'delivered' && !savedToHistory && orderData) {
      const history = JSON.parse(localStorage.getItem('biteful-order-history') || '[]');
      const newOrder = {
        id: id || 'UNKNOWN',
        restaurantId: orderData.restaurantId || '1',
        restaurantName: orderData.restaurantName || 'Restaurant',
        restaurantImage: orderData.restaurantImage || '',
        items: orderData.items || [],
        total: orderData.total || 37.21,
        status: 'delivered',
        date: new Date().toISOString(),
        address: orderData.address || 'Vancouver, BC',
        express: orderData.express || false,
        expressFee: orderData.expressFee || 0,
      };
      localStorage.setItem('biteful-order-history', JSON.stringify([newOrder, ...history]));
      setSavedToHistory(true);
    }
  }, [status, savedToHistory, orderData, id]);

  const currentIndex = statusSteps.findIndex(s => s.id === status);

  const copyOrderId = () => {
    navigator.clipboard.writeText(id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRating = () => {
    const history = JSON.parse(localStorage.getItem('biteful-order-history') || '[]');
    const updated = history.map((o: any) => o.id === id ? { ...o, rating } : o);
    localStorage.setItem('biteful-order-history', JSON.stringify(updated));
    setShowRating(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Order Tracking</h1>
            <button onClick={copyOrderId} className="flex items-center gap-1 px-3 py-1 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-muted/80">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{id}
            </button>
            {orderData?.express && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> Express</span>}
          </div>
          <p className="text-muted-foreground">{status === 'delivered' ? 'Delivered at ' + new Date().toLocaleTimeString() : `Estimated arrival: ${status === 'arriving' ? 'Any moment now' : status === 'en_route' ? '1:10 PM (8 min)' : status === 'picked_up' ? '1:10 PM (12 min)' : '1:10 PM (25 min)'}`}</p>
        </div>

        <LiveMap status={status} express={orderData?.express || false} />

        <div className="bg-card rounded-2xl border border-border p-6 mt-6 mb-6">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              if (!isActive && index > currentIndex + 1) return null;
              return (
                <div key={step.id} className={`flex items-start gap-4 mb-4 last:mb-0 ${!isActive ? 'opacity-40' : ''}`}>
                  <div className="relative flex flex-col items-center">
                    <motion.div initial={false} animate={{ scale: isCurrent ? 1.2 : 1 }} className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? (isCurrent ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white') : 'bg-muted text-muted-foreground'}`}>
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    {index < statusSteps.length - 1 && <div className={`w-0.5 h-8 mt-1 ${index < currentIndex ? 'bg-green-500' : 'bg-muted'}`} />}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold ${isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {isCurrent && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          {orderData?.express && status === 'en_route' ? 'Express: Direct route, no stops' : status === 'en_route' ? 'Turning onto W Georgia St → Homer St' : status === 'arriving' ? 'Approaching your address' : 'In Progress'}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {currentIndex >= 3 && currentIndex < 6 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-white font-bold text-lg">JD</div>
                <div className="flex-1"><h3 className="font-bold">John Doe</h3><p className="text-sm text-muted-foreground">Your Driver • 4.9 ★ • {orderData?.express ? 'Express Delivery' : 'Standard'}</p></div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><Phone className="w-5 h-5" /></button>
                  <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><MessageCircle className="w-5 h-5" /></button>
                </div>
              </div>
              {orderData?.express && (
                <div className="mt-3 p-3 bg-yellow-500/10 rounded-xl flex items-center gap-2 text-xs text-yellow-700">
                  <Zap className="w-4 h-4" />
                  <span>Express order: This driver is dedicated to your delivery only. No other stops.</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">How was your delivery?</h3>
              <div className="flex gap-2 justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="p-2 transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <textarea placeholder="Any feedback for your driver or restaurant?" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm mb-4" rows={3} />
              <button onClick={handleRating} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">Submit Review</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4"><Receipt className="w-5 h-5 text-primary" /><h3 className="font-bold">Receipt</h3></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>$24.97</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{orderData?.express ? 'FREE' : '$2.99'}</span></div>
            {orderData?.express && <div className="flex justify-between text-yellow-600"><span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Priority Fee</span><span>${orderData.expressFee?.toFixed(2) || '3.00'}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Service Fee</span><span>$2.50</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>$3.00</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tip</span><span>$3.75</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${(37.21 + (orderData?.expressFee || 0)).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/restaurants" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">Order Again</Link>
          <Link to="/orders" className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Order History</Link>
        </div>
      </div>
    </div>
  );
};

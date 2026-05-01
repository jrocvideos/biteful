import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, RotateCcw, ChevronRight, Package, Zap, Bike, Receipt, Calendar, Search, LayoutDashboard } from 'lucide-react';
import { restaurants } from '../data/restaurants';
import { CartItem } from '../types';

interface OrderRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: CartItem[];
  total: number;
  status: 'delivered' | 'cancelled';
  date: string;
  address: string;
  express: boolean;
  expressFee: number;
  rating?: number;
}

export const OrderHistory = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
   const saved = localStorage.getItem('biteful-order-history');
   if (saved) {
     setOrders(JSON.parse(saved));
   } else {
     const demoOrders: OrderRecord[] = [
       {
         id: 'ORD-ABC123XYZ',
         restaurantId: '1',
         restaurantName: 'Burger Joint',
         restaurantImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
         items: [{ id: '1', name: 'Classic Burger', price: 12.99, quantity: 2, image: '', description: 'Beef patty with cheese', restaurantId: '1', restaurantName: 'Burger Joint' }],
         total: 37.21,
         status: 'delivered',
         date: '2026-04-28T18:30:00',
         address: '123 Main St, Vancouver, BC',
         express: false,
         expressFee: 0,
         rating: 5,
       },
       {
         id: 'ORD-DEF456UVW',
          restaurantId: '2',
          restaurantName: 'Sushi Palace',
          restaurantImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&q=80',
          items: [{ id: '2', name: 'Salmon Roll', price: 8.99, quantity: 3, image: '', description: 'Fresh salmon sushi', restaurantId: '2', restaurantName: 'Sushi Palace' }],
          total: 42.50,
          status: 'delivered',
          date: '2026-04-25T12:15:00',
          address: '456 Oak Ave, Vancouver, BC',
          express: true,
          expressFee: 3,
          rating: 4,
        },
      ];
      setOrders(demoOrders);
      localStorage.setItem('biteful-order-history', JSON.stringify(demoOrders));
    }
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return o.restaurantName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleReorder = (order: OrderRecord) => {
    const currentCart = JSON.parse(localStorage.getItem('biteful-cart') || '[]');
    const newItems = order.items.map(item => ({
      ...item,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
    }));
    localStorage.setItem('biteful-cart', JSON.stringify([...currentCart, ...newItems]));
    navigate('/checkout');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const recentRestaurantIds = new Set(orders.slice(0, 3).map(o => o.restaurantId));
  const suggestedRestaurants = restaurants.filter(r => !recentRestaurantIds.has(r.id)).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Order History</h1>
            <Link to="/restaurant-dashboard" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        <p className="text-muted-foreground mb-8">View past orders and reorder your favorites</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by restaurant or order ID..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-2">
            {(['all', 'delivered', 'cancelled'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors capitalize ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">{searchQuery ? 'Try a different search term' : 'Your order history will appear here'}</p>
              <Link to="/restaurants" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium">Browse Restaurants</Link>
            </div>
          )}
          {filteredOrders.map((order, index) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{order.restaurantName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(order.date)} at {formatTime(order.date)}</span>
                        <span className="text-border">•</span>
                        <span className="font-mono text-xs">{order.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.express && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs font-bold rounded-full flex items-center gap-1"><Zap className="w-3 h-3" /> Express</span>}
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{order.status === 'delivered' ? 'Delivered' : 'Cancelled'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{order.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, i) => <span key={i} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">{item.quantity}x {item.name}</span>)}
                    {order.items.length > 3 && <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                      {order.rating && <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="text-sm font-medium">{order.rating}</span></div>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleReorder(order)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"><RotateCcw className="w-4 h-4" /> Reorder</button>
                      <Link to={`/order/${order.id}`} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"><Receipt className="w-4 h-4" /> Details</Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Suggested For You</h2>
            <Link to="/restaurants" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedRestaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2"><span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-md">{restaurant.cuisine}</span></div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm mb-1">{restaurant.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {restaurant.deliveryTime || '30-45'} min</span>
                    <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> ${restaurant.deliveryFee ?? 2.99}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

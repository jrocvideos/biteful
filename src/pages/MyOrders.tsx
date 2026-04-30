import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, MapPin, Bike, ChevronRight, Star } from 'lucide-react';

interface Order {
  id: string;
  restaurant: string;
  items: string[];
  total: number;
  status: 'delivered' | 'preparing' | 'on-the-way';
  date: string;
  rating?: number;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-7829',
    restaurant: 'Burger Vault',
    items: ['Classic Cheeseburger', 'Spicy Chicken Sandwich'],
    total: 26.98,
    status: 'on-the-way',
    date: 'Today, 12:45 PM',
  },
  {
    id: 'ORD-7830',
    restaurant: 'Sakura Sushi',
    items: ['Dragon Roll', 'Spicy Tuna Roll (2x)'],
    total: 34.97,
    status: 'preparing',
    date: 'Today, 11:20 AM',
  },
  {
    id: 'ORD-7712',
    restaurant: 'Mama\'s Pizza',
    items: ['Margherita', 'Truffle Mushroom'],
    total: 33.98,
    status: 'delivered',
    date: 'Yesterday, 7:30 PM',
    rating: 5,
  },
  {
    id: 'ORD-7654',
    restaurant: 'Green Bowl',
    items: ['Buddha Bowl'],
    total: 13.99,
    status: 'delivered',
    date: 'Apr 28, 1:15 PM',
    rating: 4,
  },
];

export const MyOrders = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeOrders = mockOrders.filter(o => o.status !== 'delivered');
  const pastOrders = mockOrders.filter(o => o.status === 'delivered');

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

        <div className="flex gap-4 mb-8 border-b">
          <button onClick={() => setActiveTab('active')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'active' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Active Orders
            {activeTab === 'active' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button onClick={() => setActiveTab('past')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'past' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Order History
            {activeTab === 'past' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'active' ? activeOrders : pastOrders).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {(activeTab === 'active' ? activeOrders : pastOrders).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No {activeTab === 'active' ? 'active' : 'past'} orders found.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const statusConfig = {
    'preparing': { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Preparing' },
    'on-the-way': { color: 'bg-blue-100 text-blue-700', icon: Bike, label: 'On the way' },
    'delivered': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-xs text-muted-foreground">{order.id}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{order.restaurant}</h3>
          <p className="text-sm text-muted-foreground">{order.date}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, i) => (
          <p key={i} className="text-sm text-muted-foreground">• {item}</p>
        ))}
      </div>

      {order.status !== 'delivered' ? (
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl gradient-hero text-white font-semibold text-sm hover:shadow-glow transition-all">
            Track Order
          </button>
          <button className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all">
            Contact Driver
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className={`w-5 h-5 ${order.rating && star <= order.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            ))}
          </div>
          <button className="flex items-center gap-1 text-primary font-medium text-sm hover:underline">
            Reorder <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

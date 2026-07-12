import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_URL = 'https://boufet-relay-production.up.railway.app';

const RESTAURANT_NAMES: Record<string, string> = {
  'burger-vault': 'Burger Vault',
  'papa-johns': 'Papa Johns',
  'smoke2snack': 'Smoke2Snack',
  'blue-water-cafe': 'Blue Water Cafe',
  'sakura-sushi': 'Sakura Sushi',
  'cuba-street-food': 'Cuba Street Food',
};

const RESTAURANT_IDS: Record<string, string> = {
  'burger-vault': 'cb8b55eb-118b-4895-9277-93847a329533',
  'papa-johns': '5a3ac06e-7a5d-4e5c-ba4c-4dac89a2e79d',
  'smoke2snack': 'a93bbf8f-4895-4908-8a71-87d390989300',
  'blue-water-cafe': 'ec544790-3d6b-4fb8-97ab-bc4725271e75',
  'sakura-sushi': '8eaf9ff4-2f47-4ac5-a2b2-f76860b4f6c6',
  'cuba-street-food': 'bd67f62d-cdd9-4541-b6cd-d140be14fe1a',
};

type OrderStatus = 'incoming' | 'preparing' | 'ready' | 'driver_assigned' | 'picked_up' | 'out_for_delivery' | 'processed' | 'cancelled' | 'advanced';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  special_instructions?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  tip: number;
  createdAt: Date;
  address: string;
  orderType: 'delivery' | 'pickup' | 'advanced';
  isExpress?: boolean;
  eventType?: string;
  guestCount?: number;
  eventDate?: Date;
  specialInstructions?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1', orderNumber: 'ORD-2054', customerName: 'Alex M.', status: 'incoming',
    items: [{ id: 'i1', name: 'Double Smash Burger', quantity: 2 }, { id: 'i2', name: 'Truffle Fries', quantity: 1 }, { id: 'i3', name: 'Chocolate Shake', quantity: 2 }],
    total: 62.50, tip: 8.00, createdAt: new Date(Date.now() - 2 * 60000),
    address: '888 Cambie St, Suite 400', orderType: 'delivery', isExpress: true,
  },
  {
    id: '2', orderNumber: 'ORD-2055', customerName: 'Priya S.', status: 'incoming',
    items: [{ id: 'i4', name: 'Classic Burger', quantity: 1 }, { id: 'i5', name: 'Onion Rings', quantity: 1 }],
    total: 34.75, tip: 5.00, createdAt: new Date(Date.now() - 1 * 60000),
    address: '1028 Alberni St, Penthouse', orderType: 'delivery',
  },
  {
    id: '3', orderNumber: 'ORD-2049', customerName: 'Sarah K.', status: 'preparing',
    items: [{ id: 'i6', name: 'BBQ Bacon Burger', quantity: 2 }, { id: 'i7', name: 'Sweet Potato Fries', quantity: 2 }, { id: 'i8', name: 'Lemonade', quantity: 2 }],
    total: 78.50, tip: 10.00, createdAt: new Date(Date.now() - 8 * 60000),
    address: '555 W Hastings St, Floor 12', orderType: 'delivery',
  },
  {
    id: '4', orderNumber: 'ORD-2050', customerName: 'James L.', status: 'preparing',
    items: [{ id: 'i9', name: 'Veggie Burger', quantity: 1 }, { id: 'i10', name: 'Side Salad', quantity: 1 }],
    total: 28.65, tip: 3.00, createdAt: new Date(Date.now() - 12 * 60000),
    address: '1234 Robson St, Apt 805', orderType: 'pickup',
  },
  {
    id: '5', orderNumber: 'ORD-2051', customerName: 'Maria G.', status: 'ready',
    items: [{ id: 'i11', name: 'Double Smash Burger', quantity: 3 }, { id: 'i12', name: 'Truffle Fries', quantity: 3 }, { id: 'i13', name: 'Vanilla Shake', quantity: 2 }],
    total: 112.40, tip: 15.00, createdAt: new Date(Date.now() - 20 * 60000),
    address: '999 W Pender St, Apt 302', orderType: 'delivery',
  },
  {
    id: '6', orderNumber: 'ORD-2052', customerName: 'David W.', status: 'ready',
    items: [{ id: 'i14', name: 'Classic Burger', quantity: 2 }, { id: 'i15', name: 'Fries', quantity: 2 }],
    total: 45.20, tip: 6.00, createdAt: new Date(Date.now() - 18 * 60000),
    address: '777 Seymour St, Apt 1503', orderType: 'delivery',
  },
  {
    id: '7', orderNumber: 'ADV-1001', customerName: 'Rebecca & Tom', status: 'advanced',
    items: [{ id: 'i16', name: 'Wedding Burger Package', quantity: 80 }, { id: 'i17', name: 'Premium Sides', quantity: 80 }],
    total: 4355.06, tip: 500.00, createdAt: new Date(Date.now() - 3 * 86400000),
    address: 'Vancouver Yacht Club, 450 Stanley Park Dr', orderType: 'advanced',
    eventType: 'wedding', guestCount: 80, eventDate: new Date('2026-06-15'),
  },
];

const STATUS_CONFIG = {
  incoming: { label: 'Incoming', color: '#EF4444', bg: 'border-red-500 bg-red-500/5' },
  preparing: { label: 'Preparing', color: '#F59E0B', bg: 'border-yellow-500 bg-yellow-500/5' },
  ready: { label: 'Ready', color: '#10B981', bg: 'border-emerald-500 bg-emerald-500/5' },
  picked_up: { label: 'Picked Up', color: '#3B82F6', bg: 'border-blue-500 bg-blue-500/5' },
  out_for_delivery: { label: 'Out for Delivery', color: '#3B82F6', bg: 'border-blue-500 bg-blue-500/5' },
  processed: { label: 'Processed', color: '#3B82F6', bg: 'border-blue-500 bg-blue-500/5' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: 'border-gray-500 bg-gray-500/5' },
  driver_assigned: { label: 'Driver Assigned', color: '#3B82F6', bg: 'border-blue-500 bg-blue-500/5' },
  advanced: { label: 'Advanced', color: '#8B5CF6', bg: 'border-purple-500 bg-purple-500/5' },
};

const getElapsed = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const KDSCard = ({ order, onAction }: { order: Order; onAction: (id: string, status: OrderStatus) => void }) => {
  const cfg = STATUS_CONFIG[order.status];
  const isIncoming = order.status === 'incoming';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';

  return (
    <div className={`rounded-xl border-2 p-4 ${cfg.bg} transition-all hover:scale-[1.02]`}>
      {isIncoming && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
            {cfg.label}
          </span>
          {order.isExpress && <span className="text-xs">⚡ EXPRESS</span>}
          {order.orderType === 'pickup' && <span className="text-xs">🏃 Pickup</span>}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">${order.total.toFixed(2)}</div>
      <div className="text-sm text-gray-400 mb-2">{order.customerName}</div>
      <div className="text-xs text-gray-500 mb-3">{getElapsed(order.createdAt)}</div>
      {order.eventType && (
        <div className="mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="text-xs font-medium text-purple-400">{order.eventType} • {order.guestCount} guests • {order.eventDate?.toLocaleDateString()}</div>
        </div>
      )}
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 5).map(item => (
          <div key={item.id} className="text-sm flex items-center gap-2">
            <span className="font-medium">{item.quantity}x</span>
            <span>{item.name}</span>
          </div>
        ))}
        {order.items.length > 5 && <div className="text-xs text-gray-500">+{order.items.length - 5} more items</div>}
      </div>
      {order.specialInstructions && (
        <div className="mb-3 p-2 bg-yellow-500/10 rounded text-xs text-yellow-400">📝 {order.specialInstructions}</div>
      )}
      <div className="text-xs text-gray-500 mb-3">📍 {order.address}</div>
      <div className="flex gap-2">
        {isIncoming && (
          <button onClick={() => onAction(order.id, 'preparing')} className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-sm font-bold text-white">Accept</button>
        )}
        {isPreparing && (
          <button onClick={() => onAction(order.id, 'ready')} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm font-bold text-white">Mark Ready</button>
        )}
        {isReady && (
          <div className="flex-1 py-2 bg-blue-500/20 rounded-lg text-sm font-medium text-blue-400 text-center">⏳ Waiting for driver...</div>
        )}
        {order.status === 'processed' && (
          <div className="flex-1 py-2 bg-gray-500/20 rounded-lg text-sm font-medium text-gray-400 text-center">✓ Completed</div>
        )}
        {order.status === 'advanced' && (
          <button onClick={() => onAction(order.id, 'incoming')} className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg text-sm font-bold text-white">Start Order</button>
        )}
      </div>
    </div>
  );
};

export const RestaurantKDS = () => {
  const { slug } = useParams<{ slug: string }>();
  const restaurantName = RESTAURANT_NAMES[slug || ''] || slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Restaurant';

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [connected, setConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'kitchen'|'earnings'|'advanced'>('kitchen');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.filter(o => {
        if (o.status !== 'processed') return true;
        const age = Date.now() - o.createdAt.getTime();
        return age < 2 * 60 * 60 * 1000;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = io(API_URL, { transports: ['polling', 'websocket'], reconnection: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      const restaurantId = RESTAURANT_IDS[slug || ''] || slug || 'restaurant_1';
      socket.emit('join_restaurant', restaurantId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('new_order', (data: any) => {
      setLastUpdate(new Date());
      fetch(`${API_URL}/api/orders/${data.order_id}`)
        .then(r => r.json())
        .then(order => {
          const newOrder: Order = {
            id: order.id,
            orderNumber: `ORD-${order.id.slice(0, 6).toUpperCase()}`,
            customerName: order.customer_name || 'Customer',
            status: 'incoming',
            items: (order.items || []).map((i: any) => ({ id: i.id, name: i.name, quantity: i.quantity })),
            total: order.total || 0,
            tip: order.tip || 0,
            createdAt: new Date(order.created_at || Date.now()),
            address: order.customer_address || '',
            orderType: 'delivery',
            isExpress: order.delivery_type === 'asap',
          };
          setOrders(prev => [newOrder, ...prev]);
          if (soundEnabled) new Audio('/sounds/bell.mp3').play().catch(() => {});
        })
        .catch(() => {});
    });

    socket.on('order_update', (data: any) => {
      if (data.order_id && data.status) {
        setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: data.status } : o));
        setLastUpdate(new Date());
      }
    });

    return () => { socket.disconnect(); };
  }, [slug]);

  const handleAction = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {});
    setLastUpdate(new Date());

    // Broadcast to CGO and other KDS instances
    socketRef.current?.emit('order_status_change', { order_id: id, status: newStatus, restaurantSlug: slug });
  };

  const addTestOrder = () => {
    const names = ['Chris P.', 'Amanda L.', 'Kevin S.', 'Jessica T.', 'Ryan M.'];
    const items = [['Double Smash Burger', 'Truffle Fries'], ['Classic Burger', 'Onion Rings', 'Coke'], ['BBQ Bacon Burger', 'Sweet Potato Fries']];
    const pick = items[Math.floor(Math.random() * items.length)];
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
      customerName: names[Math.floor(Math.random() * names.length)],
      status: 'incoming',
      items: pick.map((name, i) => ({ id: `${i}`, name, quantity: Math.ceil(Math.random() * 2) })),
      total: Math.floor(Math.random() * 60 + 20),
      tip: Math.floor(Math.random() * 12 + 3),
      createdAt: new Date(),
      address: `${Math.floor(Math.random() * 9000 + 1000)} Robson St, Vancouver`,
      orderType: Math.random() > 0.7 ? 'pickup' : 'delivery',
      isExpress: Math.random() > 0.7,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const incoming = orders.filter(o => o.status === 'incoming');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');
  const withDriver = orders.filter(o => ['driver_assigned','picked_up','out_for_delivery'].includes(o.status));
  const advanced = orders.filter(o => o.status === 'advanced');
  const processed = orders.filter(o => o.status === 'processed');

  const todayRevenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'processed');
  const restaurantEarnings = todayRevenue * 0.80;
  const boufetCommission = todayRevenue * 0.20;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-sm">B</div>
          <div>
            <h1 className="font-bold text-lg">{restaurantName}</h1>
            <p className="text-xs text-slate-400">Kitchen Display System · boufet.com/r/{slug}/orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">${todayRevenue.toFixed(0)}</div>
            <div className="text-xs text-slate-400">Revenue</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{orders.filter(o => o.status !== 'cancelled').length}</div>
            <div className="text-xs text-slate-400">Orders</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">{preparing.length}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Live' : 'Demo'}
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-2 bg-slate-800 border-b border-slate-700">
        {(['kitchen', 'earnings', 'advanced'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'kitchen' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-red-400">Incoming</h2>
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">{incoming.length}</span>
            </div>
            <div className="space-y-3">
              {incoming.map(order => <KDSCard key={order.id} order={order} onAction={handleAction} />)}
              {incoming.length === 0 && advanced.length === 0 && <div className="text-center text-slate-500 py-8">No incoming orders</div>}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-yellow-400">Preparing</h2>
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold">{preparing.length}</span>
            </div>
            <div className="space-y-3">
              {preparing.map(order => <KDSCard key={order.id} order={order} onAction={handleAction} />)}
              {preparing.length === 0 && <div className="text-center text-slate-500 py-8">Kitchen is clear</div>}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-blue-400">With Driver</h2>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">{withDriver.length}</span>
            </div>
            <div className="space-y-3">
              {withDriver.map(order => <KDSCard key={order.id} order={order} onAction={handleAction} />)}
              {withDriver.length === 0 && <div className="text-center text-slate-500 py-8">🚗 No orders with driver</div>}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Ready</h2>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">{ready.length}</span>
            </div>
            <div className="space-y-3">
              {ready.map(order => <KDSCard key={order.id} order={order} onAction={handleAction} />)}
              {processed.slice(0, 3).map(order => <KDSCard key={order.id} order={order} onAction={handleAction} />)}
              {ready.length === 0 && <div className="text-center text-slate-500 py-8">No orders ready</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="p-4 max-w-4xl mx-auto">
          {advanced.length === 0 && <div className="text-center text-slate-500 py-12">🎉 No advanced orders scheduled</div>}
          {advanced.map(order => (
            <div key={order.id} className="bg-slate-800 rounded-xl p-4 border border-purple-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold">{order.orderNumber}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">{order.eventType}</span>
              </div>
              <div className="text-sm text-purple-400 mb-2">{order.guestCount && `${order.guestCount} guests`} {order.eventDate && `📅 ${new Date(order.eventDate).toLocaleDateString()}`}</div>
              <div className="text-2xl font-bold mb-2">${order.total.toFixed(2)}</div>
              <div className="text-xs text-slate-400 mb-2">${order.tip.toFixed(2)} tip</div>
              <div className="text-sm mb-2">{order.customerName}</div>
              <div className="space-y-1 mb-3">
                {order.items.map(item => <div key={item.id} className="text-sm">{item.quantity}x {item.name}</div>)}
              </div>
              <div className="text-xs text-slate-500">📍 {order.address}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          {[
            { label: 'Today Revenue', value: `$${todayRevenue.toFixed(2)}`, color: 'text-teal-400' },
            { label: 'Your Earnings (80%)', value: `$${restaurantEarnings.toFixed(2)}`, color: 'text-emerald-400' },
            { label: 'Boufet Fee (20%)', value: `$${boufetCommission.toFixed(2)}`, color: 'text-gray-400' },
            { label: 'Orders Completed', value: `${completedOrders.length}`, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 text-sm">{label}</span>
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
            </div>
          ))}
          <h3 className="font-bold text-lg mt-6 mb-3">Completed Orders Today</h3>
          {completedOrders.length === 0 && <div className="text-slate-500">No completed orders yet</div>}
          {completedOrders.map(o => (
            <div key={o.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-mono text-sm">{o.orderNumber}</div>
                <div className="text-xs text-slate-400">{o.customerName} · {o.items.length} items</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${o.total.toFixed(2)}</div>
                <div className="text-xs text-emerald-400">${(o.total * 0.80).toFixed(2)} yours</div>
              </div>
            </div>
          ))}
          {completedOrders.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-sm text-emerald-400">Total Your Earnings</div>
              <div className="text-3xl font-bold text-emerald-400">${restaurantEarnings.toFixed(2)}</div>
            </div>
          )}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">vs DoorDash (30% fee)</div>
            <div className="text-xs text-slate-500">With DoorDash you would keep ${(todayRevenue * 0.70).toFixed(2)}</div>
            <div className="text-xs text-emerald-400">With Boufet you keep ${restaurantEarnings.toFixed(2)}</div>
            <div className="text-xs text-emerald-400 mt-1">You saved ${(todayRevenue * 0.10).toFixed(2)} today by using Boufet 🎉</div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        <span>boufet.com/r/{slug}/orders · Kitchen Display System</span>
        <span>{new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  );
};

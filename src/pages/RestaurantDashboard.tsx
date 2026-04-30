import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, CheckCircle, Clock, ChefHat, Package, 
  Phone, MapPin, DollarSign, UtensilsCrossed, 
  AlertCircle, Volume2, VolumeX, X, Printer, Timer
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  tip: number;
  total: number;
  status: string;
  special_instructions?: string;
  time_elapsed: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-2048",
    customer_name: "Alex M.",
    customer_phone: "(555) 123-4567",
    customer_address: "245 E 45th St, Apt 12B",
    items: [
      { name: "Classic Cheeseburger", quantity: 1, unit_price: 12.99 },
      { name: "Truffle Fries", quantity: 1, unit_price: 6.99 },
      { name: "Vanilla Shake", quantity: 1, unit_price: 5.99 },
    ],
    subtotal: 25.97,
    tax: 2.08,
    delivery_fee: 2.99,
    tip: 4.00,
    total: 35.04,
    status: "pending",
    special_instructions: "No pickles on burger. Extra sauce on side.",
    time_elapsed: "2 min ago",
  },
  {
    id: "ORD-2049",
    customer_name: "Sarah K.",
    customer_phone: "(555) 987-6543",
    customer_address: "450 Lexington Ave, Floor 8",
    items: [
      { name: "Dragon Roll", quantity: 1, unit_price: 16.99 },
      { name: "Spicy Tuna Roll", quantity: 2, unit_price: 8.99 },
    ],
    subtotal: 34.97,
    tax: 2.80,
    delivery_fee: 2.99,
    tip: 6.50,
    total: 47.26,
    status: "preparing",
    time_elapsed: "9 min ago",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "NEW ORDER", color: "text-red-600", icon: Bell, bg: "bg-red-50 border-red-200" },
  confirmed: { label: "CONFIRMED", color: "text-amber-600", icon: CheckCircle, bg: "bg-amber-50 border-amber-200" },
  preparing: { label: "PREPARING", color: "text-orange-600", icon: ChefHat, bg: "bg-orange-50 border-orange-200" },
  ready_for_pickup: { label: "READY", color: "text-green-600", icon: Package, bg: "bg-green-50 border-green-200" },
};

export const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "ready" | "history">("incoming");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const incomingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => ["confirmed", "preparing"].includes(o.status));
  const readyOrders = orders.filter(o => o.status === "ready_for_pickup");
  const historyOrders = orders.filter(o => o.status === "delivered");

  const getTabOrders = () => {
    switch (activeTab) {
      case "incoming": return incomingOrders;
      case "active": return activeOrders;
      case "ready": return readyOrders;
      case "history": return historyOrders;
      default: return [];
    }
  };

  const tabConfig = [
    { id: "incoming", label: "Incoming", count: incomingOrders.length, color: "bg-red-500" },
    { id: "active", label: "Active", count: activeOrders.length, color: "bg-orange-500" },
    { id: "ready", label: "Ready", count: readyOrders.length, color: "bg-green-500" },
    { id: "history", label: "History", count: historyOrders.length, color: "bg-slate-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pt-20 pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-40 px-4 py-4 shadow-soft">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Burger Vault</h1>
              <p className="text-sm text-muted-foreground">Restaurant Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">$847</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">4.9★</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-full transition-colors ${soundEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-card text-foreground shadow-elevated border-2 border-primary" : "bg-card/50 text-muted-foreground hover:bg-card border border-transparent"}`}
            >
              <span className={`w-2 h-2 rounded-full ${tab.color}`} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {getTabOrders().map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onSelect={() => setSelectedOrder(order)}
                onUpdateStatus={updateStatus}
              />
            ))}
          </AnimatePresence>
        </div>

        {getTabOrders().length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No {activeTab} orders</h3>
            <p className="text-muted-foreground">New orders will appear here automatically</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between bg-muted/50 rounded-t-3xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-muted-foreground">{selectedOrder.id}</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <h2 className="text-xl font-bold">{selectedOrder.customer_name}</h2>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{selectedOrder.customer_address}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-muted">
                        <div>
                          <p className="font-medium text-foreground">{item.quantity}x {item.name}</p>
                          {item.special_instructions && (
                            <p className="text-xs text-amber-600 mt-1">Note: {item.special_instructions}</p>
                          )}
                        </div>
                        <p className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.special_instructions && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Special Instructions</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{selectedOrder.special_instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Delivery Fee</span><span>${selectedOrder.delivery_fee.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Tip</span><span className="text-green-600">${selectedOrder.tip.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selectedOrder.status === "pending" && (
                    <>
                      <button onClick={() => { updateStatus(selectedOrder.id, "confirmed"); setSelectedOrder(null); }}
                        className="py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Accept Order
                      </button>
                      <button onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }}
                        className="py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all">
                        Decline
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "confirmed" && (
                    <button onClick={() => { updateStatus(selectedOrder.id, "preparing"); setSelectedOrder(null); }}
                      className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                      <ChefHat className="w-5 h-5" /> Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <button onClick={() => { updateStatus(selectedOrder.id, "ready_for_pickup"); setSelectedOrder(null); }}
                      className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                      <Package className="w-5 h-5" /> Mark Ready for Pickup
                    </button>
                  )}
                  {selectedOrder.status === "ready_for_pickup" && (
                    <button disabled
                      className="col-span-2 py-4 rounded-xl bg-green-100 text-green-700 font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Waiting for Driver
                    </button>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                    <Timer className="w-4 h-4" /> +5 Min
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrderCard = ({ order, onSelect, onUpdateStatus }: { order: Order; onSelect: () => void; onUpdateStatus: (id: string, status: string) => void }) => {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-card rounded-2xl border-2 p-5 cursor-pointer hover:shadow-elevated transition-all ${config.bg}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.color} bg-white/80`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {config.label}
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> {order.time_elapsed}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">${order.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {order.items.slice(0, 3).map((item, i) => (
          <p key={i} className="text-sm text-muted-foreground">{item.quantity}x {item.name}</p>
        ))}
        {order.items.length > 3 && <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>}
      </div>

      {order.status === "pending" && (
        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onUpdateStatus(order.id, "confirmed")}
            className="py-3 rounded-xl gradient-hero text-white font-bold text-sm hover:shadow-glow transition-all">
            Accept
          </button>
          <button onClick={() => onUpdateStatus(order.id, "cancelled")}
            className="py-3 rounded-xl bg-white/80 text-foreground font-bold text-sm hover:bg-white transition-all border border-border">
            Decline
          </button>
        </div>
      )}

      {order.status === "confirmed" && (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, "preparing"); }}
          className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm hover:bg-orange-200 transition-all flex items-center justify-center gap-2">
          <ChefHat className="w-4 h-4" /> Start Cooking
        </button>
      )}

      {order.status === "preparing" && (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, "ready_for_pickup"); }}
          className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-bold text-sm hover:bg-green-200 transition-all flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> Ready for Pickup
        </button>
      )}

      {order.status === "ready_for_pickup" && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm">
          <CheckCircle className="w-4 h-4" /> Waiting for driver...
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.customer_address.slice(0, 20)}...</span>
        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Tip: ${order.tip.toFixed(2)}</span>
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${config.color} ${config.bg}`}>
      <StatusIcon className="w-3 h-3" /> {config.label}
    </span>
  );
};

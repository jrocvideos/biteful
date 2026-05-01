import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, CheckCircle, Clock, ChefHat, Package, 
  Phone, MapPin, DollarSign, UtensilsCrossed, 
  AlertCircle, Volume2, VolumeX, X, Printer, Timer,
  TrendingUp, BarChart3, Receipt,
  Star, Calendar, ArrowUpRight,
  Ban, RotateCcw, ClipboardCheck, Sparkles, PartyPopper,
  Users, Cake, Church
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";

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
  event_type?: string;
  event_date?: string;
  guest_count?: number;
  deposit_paid?: number;
  deposit_total?: number;
  cancellation_reason?: string;
  cancelled_at?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-2048",
    customer_name: "Alex M.",
    customer_phone: "(555) 123-4567",
    customer_address: "888 Burrard St, Apt 12B",
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
    customer_address: "555 W Hastings St, Floor 8",
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
  {
    id: "ORD-2051",
    customer_name: "James L.",
    customer_phone: "(555) 111-2222",
    customer_address: "1234 Robson St, Apt 501",
    items: [
      { name: "Margherita Pizza", quantity: 1, unit_price: 14.99 },
      { name: "Garlic Knots", quantity: 1, unit_price: 5.99 },
    ],
    subtotal: 20.98,
    tax: 1.68,
    delivery_fee: 2.99,
    tip: 3.00,
    total: 28.65,
    status: "ready_for_pickup",
    time_elapsed: "15 min ago",
  },
  {
    id: "ORD-2052",
    customer_name: "Maria G.",
    customer_phone: "(555) 333-4444",
    customer_address: "999 W Pender St, Apt 302",
    items: [
      { name: "Butter Chicken", quantity: 1, unit_price: 16.99 },
      { name: "Naan Bread", quantity: 2, unit_price: 3.99 },
      { name: "Vegetable Biryani", quantity: 1, unit_price: 14.99 },
    ],
    subtotal: 39.96,
    tax: 3.20,
    delivery_fee: 2.99,
    tip: 5.00,
    total: 51.15,
    status: "processed",
    time_elapsed: "Delivered 30 min ago",
  },
  {
    id: "ORD-2053",
    customer_name: "David W.",
    customer_phone: "(555) 555-6666",
    customer_address: "777 Seymour St, Apt 1201",
    items: [
      { name: "Buddha Bowl", quantity: 1, unit_price: 13.99 },
      { name: "Green Juice", quantity: 1, unit_price: 6.99 },
    ],
    subtotal: 20.98,
    tax: 1.68,
    delivery_fee: 2.99,
    tip: 2.50,
    total: 28.15,
    status: "cancelled",
    cancellation_reason: "Customer changed mind",
    cancelled_at: "5 min ago",
    time_elapsed: "Cancelled 5 min ago",
  },
  {
    id: "ORD-2054",
    customer_name: "Jennifer P.",
    customer_phone: "(555) 777-8888",
    customer_address: "650 W Georgia St, Penthouse",
    items: [
      { name: "Carne Asada Tacos", quantity: 3, unit_price: 10.99 },
      { name: "Fish Tacos", quantity: 2, unit_price: 11.99 },
      { name: "Chips & Guac", quantity: 2, unit_price: 5.99 },
    ],
    subtotal: 65.93,
    tax: 5.27,
    delivery_fee: 2.99,
    tip: 8.00,
    total: 82.19,
    status: "pending",
    special_instructions: "Extra hot sauce on the side. Corporate lunch for 5 people.",
    time_elapsed: "Just now",
  },
  {
    id: "ADV-1001",
    customer_name: "Rebecca & Tom",
    customer_phone: "(555) 999-0000",
    customer_address: "Vancouver Yacht Club, 450 Stanley Park Dr",
    items: [
      { name: "Wedding Catering Package A", quantity: 1, unit_price: 2500.00 },
      { name: "Premium Appetizer Platter", quantity: 50, unit_price: 12.99 },
      { name: "Champagne Toast Package", quantity: 80, unit_price: 8.99 },
    ],
    subtotal: 3569.50,
    tax: 285.56,
    delivery_fee: 0,
    tip: 500.00,
    total: 4355.06,
    status: "advanced",
    event_type: "Wedding",
    event_date: "June 15, 2026",
    guest_count: 80,
    deposit_paid: 2177.53,
    deposit_total: 4355.06,
    special_instructions: "Outdoor tent setup. White linens required. Gluten-free options for 10 guests. Setup at 2PM, service at 5PM.",
    time_elapsed: "Booked 3 days ago",
  },
  {
    id: "ADV-1002",
    customer_name: "Michael Chen",
    customer_phone: "(555) 222-3333",
    customer_address: "Yaletown Roundhouse Community Centre, 181 Roundhouse Mews",
    items: [
      { name: "Funeral Reception Package", quantity: 1, unit_price: 800.00 },
      { name: "Assorted Sandwich Platter", quantity: 40, unit_price: 8.99 },
      { name: "Coffee & Tea Service", quantity: 40, unit_price: 3.99 },
    ],
    subtotal: 1279.60,
    tax: 102.37,
    delivery_fee: 0,
    tip: 200.00,
    total: 1581.97,
    status: "advanced",
    event_type: "Funeral",
    event_date: "May 25, 2026",
    guest_count: 40,
    deposit_paid: 790.99,
    deposit_total: 1581.97,
    special_instructions: "Respectful presentation. All black servingware. Arrive 1 hour before service. Family will handle setup.",
    time_elapsed: "Booked yesterday",
  },
  {
    id: "ADV-1003",
    customer_name: "Jessica & Friends",
    customer_phone: "(555) 444-5555",
    customer_address: "David Lam Park, 1300 Pacific Blvd",
    items: [
      { name: "Birthday Party Bundle", quantity: 1, unit_price: 450.00 },
      { name: "Slider Assortment", quantity: 30, unit_price: 6.99 },
      { name: "Loaded Fries Station", quantity: 1, unit_price: 150.00 },
      { name: "Custom Cake", quantity: 1, unit_price: 85.00 },
    ],
    subtotal: 894.70,
    tax: 71.58,
    delivery_fee: 0,
    tip: 100.00,
    total: 1066.28,
    status: "advanced",
    event_type: "Birthday Party",
    event_date: "May 28, 2026",
    guest_count: 30,
    deposit_paid: 533.14,
    deposit_total: 1066.28,
    special_instructions: "30th birthday theme - gold & black. Cake to say Happy Birthday Jessica. Outdoor park setup with heaters.",
    time_elapsed: "Booked 2 days ago",
  },
  {
    id: "ADV-1004",
    customer_name: "Corporate Events Inc.",
    customer_phone: "(555) 666-7777",
    customer_address: "Vancouver Convention Centre, 1055 Canada Pl",
    items: [
      { name: "Corporate Lunch Package", quantity: 1, unit_price: 1200.00 },
      { name: "Executive Box Lunch", quantity: 100, unit_price: 18.99 },
      { name: "Beverage Station", quantity: 1, unit_price: 250.00 },
    ],
    subtotal: 3149.00,
    tax: 251.92,
    delivery_fee: 0,
    tip: 400.00,
    total: 3800.92,
    status: "advanced",
    event_type: "Corporate Event",
    event_date: "June 5, 2026",
    guest_count: 100,
    deposit_paid: 1900.46,
    deposit_total: 3800.92,
    special_instructions: "Tech conference lunch. Dietary restrictions: 15 vegan, 10 gluten-free, 5 halal. Labels required. Setup by 11:30AM sharp.",
    time_elapsed: "Booked 1 week ago",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "NEW ORDER", color: "text-red-600", icon: Bell, bg: "bg-red-50 border-red-200" },
  confirmed: { label: "CONFIRMED", color: "text-amber-600", icon: CheckCircle, bg: "bg-amber-50 border-amber-200" },
  preparing: { label: "PREPARING", color: "text-orange-600", icon: ChefHat, bg: "bg-orange-50 border-orange-200" },
  ready_for_pickup: { label: "READY", color: "text-green-600", icon: Package, bg: "bg-green-50 border-green-200" },
  processed: { label: "PROCESSED", color: "text-blue-600", icon: ClipboardCheck, bg: "bg-blue-50 border-blue-200" },
  cancelled: { label: "CANCELLED", color: "text-slate-500", icon: Ban, bg: "bg-slate-50 border-slate-200" },
  advanced: { label: "ADVANCED", color: "text-purple-600", icon: Sparkles, bg: "bg-purple-50 border-purple-200" },
};

const EVENT_ICONS: Record<string, any> = {
  "Wedding": Cake,
  "Funeral": Church,
  "Birthday Party": PartyPopper,
  "Corporate Event": Users,
};

const weeklyRevenue = [
  { day: "Mon", revenue: 420, orders: 18, commission: 84 },
  { day: "Tue", revenue: 680, orders: 28, commission: 136 },
  { day: "Wed", revenue: 550, orders: 22, commission: 110 },
  { day: "Thu", revenue: 890, orders: 35, commission: 178 },
  { day: "Fri", revenue: 1200, orders: 48, commission: 240 },
  { day: "Sat", revenue: 1450, orders: 58, commission: 290 },
  { day: "Sun", revenue: 980, orders: 39, commission: 196 },
];

const hourlySales = [
  { hour: "11am", sales: 120 },
  { hour: "12pm", sales: 340 },
  { hour: "1pm", sales: 280 },
  { hour: "2pm", sales: 150 },
  { hour: "5pm", sales: 200 },
  { hour: "6pm", sales: 420 },
  { hour: "7pm", sales: 380 },
  { hour: "8pm", sales: 290 },
];

const topItems = [
  { name: "Classic Cheeseburger", sales: 142, revenue: 1843.58 },
  { name: "Truffle Fries", sales: 98, revenue: 685.02 },
  { name: "Vanilla Shake", sales: 87, revenue: 521.13 },
  { name: "Spicy Chicken", sales: 76, revenue: 1062.24 },
  { name: "Buddha Bowl", sales: 54, revenue: 755.46 },
];

const commissionBreakdown = [
  { name: "You Keep (80%)", value: 80, color: "#10b981" },
  { name: "Biteful (20%)", value: 20, color: "#f97316" },
];

export const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "ready" | "processed" | "cancelled" | "pending" | "advanced" | "earnings">("incoming");
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
  const processedOrders = orders.filter(o => o.status === "processed");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");
  const advancedOrders = orders.filter(o => o.status === "advanced");

  const getTabOrders = () => {
    switch (activeTab) {
      case "incoming": return incomingOrders;
      case "active": return activeOrders;
      case "ready": return readyOrders;
      case "processed": return processedOrders;
      case "cancelled": return cancelledOrders;
      case "pending": return incomingOrders;
      case "advanced": return advancedOrders;
      default: return [];
    }
  };

  const tabConfig = [
    { id: "incoming", label: "Incoming", count: incomingOrders.length, color: "bg-red-500" },
    { id: "active", label: "Active", count: activeOrders.length, color: "bg-orange-500" },
    { id: "ready", label: "Ready", count: readyOrders.length, color: "bg-green-500" },
    { id: "processed", label: "Processed", count: processedOrders.length, color: "bg-blue-500" },
    { id: "cancelled", label: "Cancelled", count: cancelledOrders.length, color: "bg-slate-500" },
    { id: "advanced", label: "Advanced", count: advancedOrders.length, color: "bg-purple-500" },
    { id: "earnings", label: "Earnings", count: 0, color: "bg-primary" },
  ];

  const totalRevenue = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = weeklyRevenue.reduce((sum, d) => sum + d.orders, 0);
  const totalCommission = weeklyRevenue.reduce((sum, d) => sum + d.commission, 0);
  const youKeep = totalRevenue - totalCommission;
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="min-h-screen bg-muted/30 pt-20 pb-8">
      <div className="bg-card border-b sticky top-0 z-40 px-4 py-4 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-card text-foreground shadow-elevated border-2 border-primary" : "bg-card/50 text-muted-foreground hover:bg-card border border-transparent"}`}
            >
              <span className={`w-2 h-2 rounded-full ${tab.color}`} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "earnings" && (
            <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                  <p className="text-sm text-muted-foreground mb-1">Weekly Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +18% vs last week</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-1">${avgOrderValue.toFixed(2)} avg order</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                  <p className="text-sm text-muted-foreground mb-1">You Keep</p>
                  <p className="text-2xl font-bold text-green-600">${youKeep.toLocaleString()}</p>
                  <p className="text-xs text-green-500 mt-1">After 20% commission</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                  <p className="text-sm text-muted-foreground mb-1">Biteful Fee</p>
                  <p className="text-2xl font-bold text-orange-500">${totalCommission.toLocaleString()}</p>
                  <p className="text-xs text-orange-500 mt-1">20% commission</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Weekly Revenue</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={weeklyRevenue}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(16 85% 55%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(16 85% 55%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(16 85% 55%)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Revenue Split</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={commissionBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {commissionBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm">You Keep (80%)</span></div>
                      <span className="font-bold text-emerald-600">${youKeep.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-sm">Biteful Fee (20%)</span></div>
                      <span className="font-bold text-orange-500">${totalCommission.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Peak Hours</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={hourlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Bar dataKey="sales" fill="hsl(16 85% 55%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Top Selling Items</h3>
                  <div className="space-y-4">
                    {topItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.sales} sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">${item.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-green-800 dark:text-green-200 mb-1">You are saving with Biteful</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      With DoorDash (30% commission), you would have paid <span className="font-bold">${(totalRevenue * 0.30).toFixed(0)}</span> in fees this week.
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      With Biteful (20% commission), you paid only <span className="font-bold">${totalCommission.toFixed(0)}</span>. 
                      <span className="font-bold text-green-800 dark:text-green-200"> You saved ${((totalRevenue * 0.30) - totalCommission).toFixed(0)} this week!</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== "earnings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {getTabOrders().map((order) => (
                <OrderCard key={order.id} order={order} onSelect={() => setSelectedOrder(order)} onUpdateStatus={updateStatus} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {activeTab !== "earnings" && getTabOrders().length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No {activeTab} orders</h3>
            <p className="text-muted-foreground">New orders will appear here automatically</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
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
                {selectedOrder.status === "advanced" && selectedOrder.event_type && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        {(() => {
                          const IconComponent = EVENT_ICONS[selectedOrder.event_type || ""] || PartyPopper;
                          return <IconComponent className="w-5 h-5 text-purple-600" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-purple-800 dark:text-purple-200">{selectedOrder.event_type}</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{selectedOrder.event_date} • {selectedOrder.guest_count} guests</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deposit Paid</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">${selectedOrder.deposit_paid?.toFixed(2)} / ${selectedOrder.deposit_total?.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((selectedOrder.deposit_paid || 0) / (selectedOrder.deposit_total || 1)) * 100}%` }} />
                    </div>
                  </div>
                )}

                {selectedOrder.status === "cancelled" && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <Ban className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Order Cancelled</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedOrder.cancellation_reason || "No reason provided"}</p>
                        {selectedOrder.cancelled_at && <p className="text-xs text-muted-foreground mt-1">{selectedOrder.cancelled_at}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /><span>{selectedOrder.customer_phone}</span></div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span className="truncate">{selectedOrder.customer_address}</span></div>
                </div>

                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-muted">
                        <div>
                          <p className="font-medium text-foreground">{item.quantity}x {item.name}</p>
                          {item.special_instructions && <p className="text-xs text-amber-600 mt-1">Note: {item.special_instructions}</p>}
                        </div>
                        <p className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.special_instructions && selectedOrder.status !== "advanced" && (
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

                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
                  {selectedOrder.delivery_fee > 0 && <div className="flex justify-between text-muted-foreground"><span>Delivery Fee</span><span>${selectedOrder.delivery_fee.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>Tip</span><span className="text-green-600">${selectedOrder.tip.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selectedOrder.status === "pending" && (
                    <>
                      <button onClick={() => { updateStatus(selectedOrder.id, "confirmed"); setSelectedOrder(null); }}
                        className="py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Accept Order
                      </button>
                      <button onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }}
                        className="py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all">Decline</button>
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
                    <button disabled className="col-span-2 py-4 rounded-xl bg-green-100 text-green-700 font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Waiting for Driver
                    </button>
                  )}
                  {selectedOrder.status === "processed" && (
                    <button disabled className="col-span-2 py-4 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <ClipboardCheck className="w-5 h-5" /> Order Complete
                    </button>
                  )}
                  {selectedOrder.status === "cancelled" && (
                    <button onClick={() => { updateStatus(selectedOrder.id, "pending"); setSelectedOrder(null); }}
                      className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" /> Re-Activate Order
                    </button>
                  )}
                  {selectedOrder.status === "advanced" && (
                    <button className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold text-lg hover:shadow-glow transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" /> View Event Calendar
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
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-card rounded-2xl border-2 p-5 cursor-pointer hover:shadow-elevated transition-all ${config.bg}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.color} bg-white/80`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />{config.label}
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {order.time_elapsed}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">${order.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
        </div>
      </div>

      {order.status === "advanced" && order.event_type && (
        <div className="mb-3 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
            {(() => { const IconComponent = EVENT_ICONS[order.event_type || ""] || PartyPopper; return <IconComponent className="w-3 h-3" />; })()}
            <span className="font-semibold">{order.event_type}</span><span>• {order.event_date}</span><span>• {order.guest_count} guests</span>
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mb-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1"><Ban className="w-3 h-3 inline mr-1" /> {order.cancellation_reason || "Cancelled"}</p>
        </div>
      )}

      <div className="space-y-1 mb-4">
        {order.items.slice(0, 3).map((item, i) => (<p key={i} className="text-sm text-muted-foreground">{item.quantity}x {item.name}</p>))}
        {order.items.length > 3 && <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>}
      </div>

      {order.status === "pending" && (
        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onUpdateStatus(order.id, "confirmed")} className="py-3 rounded-xl gradient-hero text-white font-bold text-sm hover:shadow-glow transition-all">Accept</button>
          <button onClick={() => onUpdateStatus(order.id, "cancelled")} className="py-3 rounded-xl bg-white/80 text-foreground font-bold text-sm hover:bg-white transition-all border border-border">Decline</button>
        </div>
      )}

      {order.status === "confirmed" && (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, "preparing"); }} className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm hover:bg-orange-200 transition-all flex items-center justify-center gap-2">
          <ChefHat className="w-4 h-4" /> Start Cooking
        </button>
      )}

      {order.status === "preparing" && (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, "ready_for_pickup"); }} className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-bold text-sm hover:bg-green-200 transition-all flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> Ready for Pickup
        </button>
      )}

      {order.status === "ready_for_pickup" && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm"><CheckCircle className="w-4 h-4" /> Waiting for driver...</div>
      )}

      {order.status === "processed" && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm"><ClipboardCheck className="w-4 h-4" /> Completed</div>
      )}

      {order.status === "cancelled" && (
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, "pending"); }} className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Re-Activate
        </button>
      )}

      {order.status === "advanced" && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm"><Calendar className="w-4 h-4" /> {order.event_date}</div>
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

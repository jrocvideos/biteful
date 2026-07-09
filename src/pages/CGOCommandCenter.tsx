import { useState, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  TrendingUp, Users, DollarSign, ShoppingBag, 
  Target, Zap, BarChart3, Megaphone, 
  ArrowUpRight, ArrowDownRight, Activity,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';

const API_URL = 'https://boufet-backend-production-e170.up.railway.app';
const SOCKET_URL = 'https://boufet-backend-production-e170.up.railway.app';

// ─── TYPES ───
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: string;
  restaurantSlug: string;
  restaurantName?: string;
  total: number;
  subtotal?: number;
  tip: number;
  deliveryFee?: number;
  serviceFee?: number;
  tax?: number;
  grandTotal?: number;
  orderType: 'delivery' | 'pickup' | 'advanced';
  isExpress?: boolean;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
  updatedAt?: string;
  driverName?: string;
  driverId?: string;
  source?: string; // 'organic', 'paid', 'referral', 'repeat'
}

interface RestaurantMetrics {
  slug: string;
  name: string;
  totalOrders: number;
  revenue: number;
  avgOrderValue: number;
  activeOrders: number;
  cancellationRate: number;
  expressRate: number;
  topItems: { name: string; count: number }[];
  hourlyDistribution: number[];
}

interface GrowthMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  repeatRate: number;
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  churnRate: number;
  conversionRate: number;
  revenueGrowth: number; // % vs last period
  orderGrowth: number;
}

const STATUS_COLORS: Record<string, string> = {
  incoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  driver_assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  picked_up: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  out_for_delivery: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  processed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  incoming: 'Incoming',
  preparing: 'Preparing', 
  ready: 'Ready',
  driver_assigned: 'With Driver',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  processed: 'Processed',
  cancelled: 'Cancelled',
  advanced: 'Advanced',
};

// ─── SUPERIOR CGO DASHBOARD ───
export function CGOCommandCenter() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'restaurants' | 'growth' | 'marketing'>('overview');
  const [loading, setLoading] = useState(true);

  // ─── SOCKET CONNECTION ───
  useEffect(() => {
    const s = io(SOCKET_URL, { 
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setConnected(true);
      s.emit('join_cgo'); // Join CGO room for all orders
    });

    s.on('disconnect', () => setConnected(false));

    s.on('new_order', (order: Order) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    s.on('order_update', ({ id, status, driverName, driverId }: any) => {
      setOrders(prev => prev.map(o => 
        o.id === id ? { ...o, status, driverName: driverName || o.driverName, driverId: driverId || o.driverId } : o
      ));
    });

    s.on('driver_location', ({ driver_id, lat, lng, eta }: any) => {
      // Track driver locations for live map
    });

    setSocket(s);

    // Initial fetch
    fetch(`${API_URL}/api/orders?limit=200&status=all`)
      .then(r => r.json())
      .then((data: Order[]) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => { s.disconnect(); };
  }, []);

  // ─── FILTERED ORDERS ───
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Time filter
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const cutoff = timeRange === 'today' ? startOfDay : timeRange === 'week' ? startOfWeek : startOfMonth;
    filtered = filtered.filter(o => new Date(o.createdAt) >= cutoff);

    // Restaurant filter
    if (selectedRestaurant !== 'all') {
      filtered = filtered.filter(o => o.restaurantSlug === selectedRestaurant);
    }

    return filtered;
  }, [orders, timeRange, selectedRestaurant]);

  // ─── GROWTH METRICS ───
  const growthMetrics: GrowthMetrics = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'delivered' || o.status === 'processed');
    const totalRev = delivered.reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const activeOrders = filteredOrders.filter(o => !['delivered', 'processed', 'cancelled'].includes(o.status)).length;
    const avgOrderValue = totalOrders > 0 ? totalRev / delivered.length : 0;

    // Customer metrics
    const customers = new Map<string, number>();
    filteredOrders.forEach(o => {
      const phone = o.customerPhone || o.customerName;
      customers.set(phone, (customers.get(phone) || 0) + 1);
    });
    const newCustomers = Array.from(customers.values()).filter(c => c === 1).length;
    const repeatCustomers = Array.from(customers.values()).filter(c => c > 1).length;
    const repeatRate = totalOrders > 0 ? (repeatCustomers / customers.size) * 100 : 0;

    // CAC & LTV (simplified)
    const cac = newCustomers > 0 ? 25 : 0; // Assume $25 marketing spend per new customer
    const ltv = repeatRate > 0 ? avgOrderValue * (repeatRate / 100) * 6 : avgOrderValue; // 6-month LTV

    // Growth vs previous period (mock calculation)
    const revenueGrowth = 12.5; // %
    const orderGrowth = 8.3; // %

    return {
      totalRevenue: totalRev,
      totalOrders,
      activeOrders,
      avgOrderValue,
      newCustomers,
      repeatRate,
      cac,
      ltv,
      churnRate: 100 - repeatRate,
      conversionRate: 68.5,
      revenueGrowth,
      orderGrowth,
    };
  }, [filteredOrders]);

  // ─── RESTAURANT METRICS ───
  const restaurantMetrics: RestaurantMetrics[] = useMemo(() => {
    const byRestaurant = new Map<string, Order[]>();
    filteredOrders.forEach(o => {
      const list = byRestaurant.get(o.restaurantSlug) || [];
      list.push(o);
      byRestaurant.set(o.restaurantSlug, list);
    });

    return Array.from(byRestaurant.entries()).map(([slug, list]) => {
      const delivered = list.filter(o => o.status === 'delivered' || o.status === 'processed');
      const revenue = delivered.reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);
      const active = list.filter(o => !['delivered', 'processed', 'cancelled'].includes(o.status)).length;
      const cancelled = list.filter(o => o.status === 'cancelled').length;
      const express = list.filter(o => o.isExpress).length;

      // Top items
      const itemCounts = new Map<string, number>();
      list.forEach(o => o.items?.forEach(i => {
        itemCounts.set(i.name, (itemCounts.get(i.name) || 0) + i.quantity);
      }));
      const topItems = Array.from(itemCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Hourly distribution
      const hourly = new Array(24).fill(0);
      list.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        hourly[h]++;
      });

      return {
        slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        totalOrders: list.length,
        revenue,
        avgOrderValue: delivered.length > 0 ? revenue / delivered.length : 0,
        activeOrders: active,
        cancellationRate: list.length > 0 ? (cancelled / list.length) * 100 : 0,
        expressRate: list.length > 0 ? (express / list.length) * 100 : 0,
        topItems,
        hourlyDistribution: hourly,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // ─── UNIQUE RESTAURANTS ───
  const restaurants = useMemo(() => {
    const slugs = new Set(orders.map(o => o.restaurantSlug));
    return Array.from(slugs).sort();
  }, [orders]);

  // ─── UPDATE ORDER STATUS ───
  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // ─── EXPORT DATA ───
  const exportData = () => {
    const csv = [
      'Order,Restaurant,Customer,Total,Status,Date',
      ...filteredOrders.map(o => `${o.orderNumber},${o.restaurantSlug},${o.customerName},${o.grandTotal || o.total},${o.status},${o.createdAt}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boufet-orders-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
          <span className="text-slate-400">Loading CGO Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ─── TOP NAV ─── */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Boufet CGO</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
              Certified Growth Officer
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {(['overview', 'orders', 'restaurants', 'growth', 'marketing'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${
            connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {(['today', 'week', 'month'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  timeRange === r ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Restaurant Filter */}
          <select
            value={selectedRestaurant}
            onChange={e => setSelectedRestaurant(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map(r => (
              <option key={r} value={r}>{r.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>

          {/* Export */}
          <button onClick={exportData} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <KPICard 
              title="Total Revenue" 
              value={`$${growthMetrics.totalRevenue.toFixed(2)}`} 
              icon={<DollarSign className="w-5 h-5" />}
              trend={growthMetrics.revenueGrowth}
              color="green"
            />
            <KPICard 
              title="Total Orders" 
              value={growthMetrics.totalOrders.toString()} 
              icon={<ShoppingBag className="w-5 h-5" />}
              trend={growthMetrics.orderGrowth}
              color="blue"
            />
            <KPICard 
              title="Active Orders" 
              value={growthMetrics.activeOrders.toString()} 
              icon={<Activity className="w-5 h-5" />}
              trend={null}
              color="orange"
            />
            <KPICard 
              title="Avg Order Value" 
              value={`$${growthMetrics.avgOrderValue.toFixed(2)}`} 
              icon={<BarChart3 className="w-5 h-5" />}
              trend={null}
              color="purple"
            />
            <KPICard 
              title="New Customers" 
              value={growthMetrics.newCustomers.toString()} 
              icon={<Users className="w-5 h-5" />}
              trend={null}
              color="cyan"
            />
            <KPICard 
              title="Repeat Rate" 
              value={`${growthMetrics.repeatRate.toFixed(1)}%`} 
              icon={<Target className="w-5 h-5" />}
              trend={null}
              color="pink"
            />
          </div>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Growth Metrics
              </h3>
              <div className="space-y-3">
                <MetricRow label="Customer Acquisition Cost" value={`$${growthMetrics.cac.toFixed(2)}`} />
                <MetricRow label="Lifetime Value" value={`$${growthMetrics.ltv.toFixed(2)}`} />
                <MetricRow label="LTV:CAC Ratio" value={`${(growthMetrics.ltv / growthMetrics.cac).toFixed(1)}:1`} />
                <MetricRow label="Churn Rate" value={`${growthMetrics.churnRate.toFixed(1)}%`} />
                <MetricRow label="Conversion Rate" value={`${growthMetrics.conversionRate.toFixed(1)}%`} />
              </div>
            </div>

            {/* Restaurant Leaderboard */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Restaurant Performance
              </h3>
              <div className="space-y-2">
                {restaurantMetrics.slice(0, 5).map((r, i) => (
                  <div key={r.slug} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-slate-400">{r.totalOrders} orders · {r.activeOrders} active</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">${r.revenue.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">${r.avgOrderValue.toFixed(2)} avg</div>
                    </div>
                    <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${Math.min((r.revenue / (restaurantMetrics[0]?.revenue || 1)) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Order Stream */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                Live Order Stream
              </h3>
              <span className="text-xs text-slate-500">{filteredOrders.length} orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">Order</th>
                    <th className="text-left p-3">Restaurant</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Driver</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 20).map(o => (
                    <tr key={o.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <div className="font-mono text-xs text-slate-300">{o.orderNumber}</div>
                        <div className="text-[10px] text-slate-500">{o.orderType}{o.isExpress ? ' · Express' : ''}</div>
                      </td>
                      <td className="p-3 text-xs">{o.restaurantSlug?.replace(/-/g, ' ')}</td>
                      <td className="p-3 text-xs">{o.customerName}</td>
                      <td className="p-3 text-xs text-slate-400">{o.items?.length || 0} items</td>
                      <td className="p-3 text-xs font-medium">${(o.grandTotal || o.total || 0).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${STATUS_COLORS[o.status] || 'bg-slate-600 text-slate-300 border-slate-500'}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-400">{o.driverName || '-'}</td>
                      <td className="p-3">
                        <select 
                          value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORDERS TAB ─── */}
      {activeTab === 'orders' && (
        <div className="p-4 max-w-7xl mx-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300">All Orders</h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">{filteredOrders.length} orders</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">Order</th>
                    <th className="text-left p-3">Restaurant</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Subtotal</th>
                    <th className="text-left p-3">Fees</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                      <td className="p-3 text-xs">{o.restaurantSlug}</td>
                      <td className="p-3 text-xs">{o.customerName}</td>
                      <td className="p-3 text-xs text-slate-400">
                        {o.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="p-3 text-xs">${(o.subtotal || o.total || 0).toFixed(2)}</td>
                      <td className="p-3 text-xs text-slate-400">
                        ${((o.deliveryFee || 0) + (o.serviceFee || 0) + (o.tax || 0)).toFixed(2)}
                      </td>
                      <td className="p-3 text-xs font-bold">${(o.grandTotal || o.total || 0).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${STATUS_COLORS[o.status] || ''}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <select 
                          value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESTAURANTS TAB ─── */}
      {activeTab === 'restaurants' && (
        <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurantMetrics.map(r => (
            <div key={r.slug} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{r.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  r.activeOrders > 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-600/20 text-slate-400'
                }`}>
                  {r.activeOrders > 0 ? `${r.activeOrders} Active` : 'Idle'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-emerald-400">${r.revenue.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Revenue</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{r.totalOrders}</div>
                  <div className="text-[10px] text-slate-400">Orders</div>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Avg Order</span>
                  <span>${r.avgOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cancellation Rate</span>
                  <span className={r.cancellationRate > 10 ? 'text-red-400' : 'text-slate-300'}>{r.cancellationRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Express Rate</span>
                  <span className="text-orange-400">{r.expressRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-2">
                <div className="text-[10px] text-slate-400 mb-1">Top Items</div>
                <div className="flex flex-wrap gap-1">
                  {r.topItems.map(item => (
                    <span key={item.name} className="px-2 py-0.5 bg-slate-700 rounded text-[10px]">
                      {item.name} ({item.count})
                    </span>
                  ))}
                </div>
              </div>

              {/* Hourly distribution mini chart */}
              <div className="mt-3 flex items-end gap-0.5 h-8">
                {r.hourlyDistribution.map((count, h) => (
                  <div 
                    key={h} 
                    className="flex-1 bg-orange-500/40 rounded-t"
                    style={{ height: `${Math.min((count / Math.max(...r.hourlyDistribution)) * 100, 100)}%` }}
                    title={`${h}:00 - ${count} orders`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── GROWTH TAB ─── */}
      {activeTab === 'growth' && (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Customer Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">New Customers</span>
                  <span className="text-lg font-bold text-cyan-400">{growthMetrics.newCustomers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Repeat Customers</span>
                  <span className="text-lg font-bold text-purple-400">
                    {filteredOrders.length - growthMetrics.newCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Repeat Rate</span>
                  <span className="text-lg font-bold text-pink-400">{growthMetrics.repeatRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Churn Rate</span>
                  <span className="text-lg font-bold text-red-400">{growthMetrics.churnRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Unit Economics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Customer Acquisition Cost</span>
                  <span className="text-lg font-bold text-yellow-400">${growthMetrics.cac.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Lifetime Value</span>
                  <span className="text-lg font-bold text-emerald-400">${growthMetrics.ltv.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">LTV:CAC Ratio</span>
                  <span className={`text-lg font-bold ${(growthMetrics.ltv / growthMetrics.cac) > 3 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {(growthMetrics.ltv / growthMetrics.cac).toFixed(1)}:1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Payback Period</span>
                  <span className="text-lg font-bold text-blue-400">
                    {growthMetrics.cac > 0 ? (growthMetrics.cac / (growthMetrics.avgOrderValue * 0.2)).toFixed(1) : 0} orders
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Recommendations */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-orange-400" />
              Growth Recommendations
            </h3>
            <div className="space-y-2">
              {growthMetrics.repeatRate < 30 && (
                <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <ArrowDownRight className="w-4 h-4 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-400">Low Repeat Rate</div>
                    <div className="text-xs text-slate-400">Implement loyalty program and post-order follow-up emails</div>
                  </div>
                </div>
              )}
              {growthMetrics.cac > growthMetrics.ltv * 0.3 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-400">High CAC</div>
                    <div className="text-xs text-slate-400">Optimize paid channels, increase organic/referral traffic</div>
                  </div>
                </div>
              )}
              {restaurantMetrics.some(r => r.cancellationRate > 15) && (
                <div className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-orange-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-orange-400">High Cancellation</div>
                    <div className="text-xs text-slate-400">Review prep times and driver assignment for affected restaurants</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-emerald-400">Opportunity: Express Orders</div>
                  <div className="text-xs text-slate-400">
                    {restaurantMetrics.reduce((sum, r) => sum + r.expressRate, 0) / (restaurantMetrics.length || 1) > 20 
                      ? 'High express demand — consider premium pricing' 
                      : 'Promote express delivery to increase AOV'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MARKETING TAB ─── */}
      {activeTab === 'marketing' && (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Campaign Builder */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
                Campaign Builder
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Campaign Name</label>
                  <input type="text" placeholder="Summer Special" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Target</label>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white mt-1">
                    <option>All Customers</option>
                    <option>New Customers</option>
                    <option>Repeat Customers</option>
                    <option>Churned Customers</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Discount</label>
                  <div className="flex gap-2 mt-1">
                    <input type="number" placeholder="20" className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
                    <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                      <option>%</option>
                      <option>$</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-2 bg-purple-500 hover:bg-purple-400 rounded-lg text-sm font-bold text-white transition-colors">
                  Launch Campaign
                </button>
              </div>
            </div>

            {/* Referral Program */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Referral Program
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Referral Code</span>
                  <span className="text-xs font-mono bg-slate-600 px-2 py-1 rounded">BOUFET50</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Referrer Reward</span>
                  <span className="text-xs font-bold text-cyan-400">$5 Credit</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Referee Reward</span>
                  <span className="text-xs font-bold text-cyan-400">$10 Off</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Total Referrals</span>
                  <span className="text-xs font-bold">{Math.floor(growthMetrics.newCustomers * 0.15)}</span>
                </div>
                <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-sm font-bold text-white transition-colors">
                  Generate New Code
                </button>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Push Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Abandoned Cart</span>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Order Updates</span>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Promotional</span>
                  <div className="w-10 h-5 bg-slate-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-300">Delivery ETA</span>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                  </div>
                </div>
                <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-sm font-bold text-white transition-colors">
                  Send Blast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ───
function KPICard({ title, value, icon, trend, color }: { 
  title: string; value: string; icon: React.ReactNode; trend: number | null; color: string 
}) {
  const colorMap: Record<string, string> = {
    green: 'text-emerald-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs">{title}</span>
        <span className={colorMap[color] || 'text-slate-400'}>{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend !== null && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

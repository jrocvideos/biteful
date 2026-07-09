import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const CGO_API_URL = 'https://boufet.com/cgo/api';

interface Order {
  id: string; orderNumber: string; customerName: string; status: string;
  restaurantSlug: string; total: number; tip: number; orderType: string;
  isExpress?: boolean; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  incoming: 'bg-yellow-600', preparing: 'bg-orange-600', ready: 'bg-green-600',
  with_driver: 'bg-blue-600', delivered: 'bg-slate-600', cancelled: 'bg-red-800',
};

export function CGOCommandCenter() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, active: 0 });

  useEffect(() => {
    const s = io('wss://boufet.com/cgo/ws');
    s.on('new_order', (order: Order) => { setOrders(prev => { const u = [order, ...prev]; updateStats(u); return u; }); });
    s.on('order_status_change', ({ id, status }: { id: string; status: string }) => {
      setOrders(prev => { const u = prev.map(o => o.id === id ? { ...o, status } : o); updateStats(u); return u; });
    });
    fetch(`${CGO_API_URL}/orders`).then(r => r.json()).then((data: Order[]) => { setOrders(data); updateStats(data); });
    return () => { s.disconnect(); };
  }, []);

  const updateStats = (all: Order[]) => {
    const active = all.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const revenue = all.filter(o => o.status === 'delivered').reduce((a, o) => a + o.total, 0);
    setStats({ total: all.length, revenue, active });
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${CGO_API_URL}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, updatedAt: new Date().toISOString() }) });
    setOrders(prev => { const u = prev.map(o => o.id === id ? { ...o, status } : o); updateStats(u); return u; });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Boufet CGO</span>
          <span className="text-slate-500">|</span>
          <a href="https://boufet.com/kds" className="hover:text-orange-400">KDS</a>
          <a href="https://boufet.com/driver" className="hover:text-green-400">Driver</a>
          <a href="https://boufet.com" className="hover:text-purple-400">Main</a>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-4 text-center"><div className="text-3xl font-bold">{stats.total}</div><div className="text-slate-400 text-sm">Total Orders</div></div>
        <div className="bg-slate-800 rounded-lg p-4 text-center"><div className="text-3xl font-bold text-green-400">${stats.revenue.toFixed(2)}</div><div className="text-slate-400 text-sm">Revenue</div></div>
        <div className="bg-slate-800 rounded-lg p-4 text-center"><div className="text-3xl font-bold text-orange-400">{stats.active}</div><div className="text-slate-400 text-sm">Active</div></div>
      </div>
      <div className="p-4 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-3">Live Order Stream</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Restaurant</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="p-3 font-mono">{o.orderNumber}</td>
                  <td className="p-3">{o.restaurantSlug}</td>
                  <td className="p-3">{o.customerName}</td>
                  <td className="p-3">${o.total.toFixed(2)}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[o.status] || 'bg-slate-600'}`}>{o.status}</span></td>
                  <td className="p-3">
                    <select onChange={(e) => updateStatus(o.id, e.target.value)} className="bg-slate-700 rounded px-2 py-1 text-xs" value={o.status}>
                      <option value="incoming">Incoming</option><option value="preparing">Preparing</option><option value="ready">Ready</option>
                      <option value="with_driver">With Driver</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const CGO_API_URL = 'https://boufet.com/cgo/api';

interface OrderItem { id: string; name: string; quantity: number; }
interface Order {
  id: string; orderNumber: string; customerName: string; status: string;
  restaurantSlug: string; items: OrderItem[]; total: number; tip: number;
  address: string; orderType: 'delivery' | 'pickup' | 'advanced'; isExpress?: boolean;
}

export function DriverDashboard() {
  const [activeJobs, setActiveJobs] = useState<Order[]>([]);

  useEffect(() => {
    const s = io('wss://boufet.com/cgo/ws');
    s.on('new_order', (order: Order) => { if (order.orderType === 'delivery') setActiveJobs(prev => [order, ...prev]); });
    s.on('order_status_change', ({ id, status }: { id: string; status: string }) => {
      if (status === 'delivered') setActiveJobs(prev => prev.filter(o => o.id !== id));
    });
    return () => { s.disconnect(); };
  }, []);

  const acceptJob = async (orderId: string) => {
    await fetch(`${CGO_API_URL}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'with_driver', updatedAt: new Date().toISOString() }) });
    setActiveJobs(prev => prev.map(o => o.id === orderId ? { ...o, status: 'with_driver' } : o));
  };
  const markDelivered = async (orderId: string) => {
    await fetch(`${CGO_API_URL}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'delivered', updatedAt: new Date().toISOString() }) });
    setActiveJobs(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Boufet Driver</span>
          <span className="text-slate-500">|</span>
          <a href="https://boufet.com/cgo" className="hover:text-blue-400">CGO</a>
          <a href="https://boufet.com/kds" className="hover:text-orange-400">KDS</a>
          <a href="https://boufet.com" className="hover:text-purple-400">Main</a>
        </div>
        <div className="text-green-400 text-xs">Online</div>
      </div>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Active Deliveries</h1>
        {activeJobs.length === 0 && <div className="text-slate-500 text-center py-20">No active delivery jobs. Waiting for orders...</div>}
        <div className="space-y-3">
          {activeJobs.map(job => (
            <div key={job.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-lg">{job.orderNumber}</div>
                  <div className="text-slate-400 text-sm">{job.customerName}</div>
                  <div className="text-orange-400 text-sm mt-1">{job.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${job.total.toFixed(2)}</div>
                  <div className="text-green-400 text-sm">Tip: ${job.tip.toFixed(2)}</div>
                  {job.isExpress && <span className="text-xs bg-red-600 px-2 py-1 rounded mt-1 inline-block">EXPRESS</span>}
                </div>
              </div>
              <div className="text-sm text-slate-300 mb-3">{job.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
              <div className="flex gap-2">
                {job.status === 'incoming' && <button onClick={() => acceptJob(job.id)} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded font-semibold">Accept Delivery</button>}
                {job.status === 'with_driver' && <button onClick={() => markDelivered(job.id)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold">Mark Delivered</button>}
                <button className="px-4 bg-slate-700 hover:bg-slate-600 rounded">Call</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

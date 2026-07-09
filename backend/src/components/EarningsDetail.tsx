import React, { useState, useEffect } from 'react';
import { X, DollarSign, Truck, Gift, ChevronRight } from 'lucide-react';

interface EarningsOrder {
  orderId: string;
  restaurant: string;
  deliveryFee: number;
  deliveryEarned: number;
  tip: number;
  tipEarned: number;
  totalEarned: number;
  commissionTaken: number;
  deliveredAt: string;
}

interface EarningsDetailProps {
  token: string;
  period: 'today' | 'week' | 'month';
  onClose: () => void;
}

const EarningsDetail: React.FC<EarningsDetailProps> = ({ token, period, onClose }) => {
  const [orders, setOrders] = useState<EarningsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`https://boufet-backend-production-e170.up.railway.app/api/drivers/earnings/detail?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load'); setLoading(false); });
  }, [period, token]);

  const totalDelivery = orders.reduce((s, o) => s + o.deliveryEarned, 0);
  const totalTip = orders.reduce((s, o) => s + o.tipEarned, 0);
  const totalEarned = orders.reduce((s, o) => s + o.totalEarned, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-gray-900 w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg capitalize">{period} Earnings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <Truck className="w-5 h-5 text-teal-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Delivery</p>
            <p className="text-white font-bold">${totalDelivery.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <Gift className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Tips</p>
            <p className="text-white font-bold">${totalTip.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-white font-bold">${totalEarned.toFixed(2)}</p>
          </div>
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading && <p className="text-gray-400 text-center py-4">Loading...</p>}
          {error && <p className="text-red-400 text-center py-4">{error}</p>}
          {!loading && orders.length === 0 && (
            <p className="text-gray-400 text-center py-4">No completed deliveries yet</p>
          )}
          {orders.map(order => (
            <div key={order.orderId} className="bg-gray-800 rounded-xl p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{order.restaurant}</span>
                <span className="text-teal-400 font-bold">${order.totalEarned.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Delivery fee ({order.deliveryFee.toFixed(2)} × 56.5%)</span>
                  <span className="text-gray-300">${order.deliveryEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Tip ({order.tip.toFixed(2)} × 40%)</span>
                  <span className="text-yellow-300">${order.tipEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Commission taken</span>
                  <span className="text-red-400">-${order.commissionTaken.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs mt-2">{new Date(order.deliveredAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsDetail;

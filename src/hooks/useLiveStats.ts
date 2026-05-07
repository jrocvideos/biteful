import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'https://api.boufet.com';

export interface LiveStats {
  totalOrders: number;
  todayRevenue: number;
  activeDrivers: number;
  restaurantsSigned: number;
  ordersActive: number;
  ordersReady: number;
  recentOrders: LiveOrder[];
  connected: boolean;
  lastUpdate: Date;
}

export interface LiveOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
}

const MOCK_STATS: LiveStats = {
  totalOrders: 42, todayRevenue: 1847.50, activeDrivers: 3,
  restaurantsSigned: 3, ordersActive: 2, ordersReady: 1,
  connected: false, lastUpdate: new Date(),
  recentOrders: [
    { id: '1', orderNumber: 'ORD-2054', restaurantName: 'Burger Vault', customerName: 'Alex M.', total: 62.50, status: 'preparing', createdAt: new Date(Date.now() - 5 * 60000) },
    { id: '2', orderNumber: 'ORD-2055', restaurantName: 'Burger Vault', customerName: 'Priya S.', total: 54.75, status: 'incoming', createdAt: new Date(Date.now() - 2 * 60000) },
    { id: '3', orderNumber: 'ORD-2051', restaurantName: 'Papa Johns', customerName: 'James L.', total: 28.65, status: 'ready', createdAt: new Date(Date.now() - 15 * 60000) },
    { id: '4', orderNumber: 'ORD-2049', restaurantName: 'Blue Water Cafe', customerName: 'Sarah K.', total: 47.26, status: 'processed', createdAt: new Date(Date.now() - 45 * 60000) },
  ],
};

export const useLiveStats = () => {
  const [stats, setStats] = useState<LiveStats>(MOCK_STATS);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, totalOrders: data.total_orders ?? prev.totalOrders, todayRevenue: data.today_revenue ?? prev.todayRevenue, activeDrivers: data.active_drivers ?? prev.activeDrivers, restaurantsSigned: data.restaurants_signed ?? prev.restaurantsSigned, ordersActive: data.orders_active ?? prev.ordersActive, ordersReady: data.orders_ready ?? prev.ordersReady, lastUpdate: new Date() })))
      .catch(() => {});

    const socket = io(API_URL, { transports: ['polling', 'websocket'], reconnection: true });
    socketRef.current = socket;

    socket.on('connect', () => { setStats(prev => ({ ...prev, connected: true })); socket.emit('join_admin'); });
    socket.on('disconnect', () => setStats(prev => ({ ...prev, connected: false })));

    socket.on('new_order', (data: any) => {
      setStats(prev => ({ ...prev, totalOrders: prev.totalOrders + 1, ordersActive: prev.ordersActive + 1, lastUpdate: new Date(),
        recentOrders: [{ id: data.order_id, orderNumber: `ORD-${data.order_id?.slice(0,6)?.toUpperCase()||'NEW'}`, restaurantName: data.restaurant_name||'Restaurant', customerName: data.customer_name||'Customer', total: data.total||0, status: 'incoming', createdAt: new Date() }, ...prev.recentOrders].slice(0, 10) }));
    });

    socket.on('order_update', (data: any) => {
      setStats(prev => {
        const u = { ...prev, lastUpdate: new Date() };
        if (data.status === 'ready') { u.ordersActive = Math.max(0, prev.ordersActive - 1); u.ordersReady = prev.ordersReady + 1; }
        if (data.status === 'processed') { u.ordersReady = Math.max(0, prev.ordersReady - 1); u.todayRevenue = prev.todayRevenue + (data.total || 0); }
        u.recentOrders = prev.recentOrders.map(o => o.id === data.order_id ? { ...o, status: data.status } : o);
        return u;
      });
    });

    socket.on('driver_location', () => setStats(prev => ({ ...prev, lastUpdate: new Date() })));

    const interval = setInterval(() => {
      fetch(`${API_URL}/api/stats`).then(r => r.json()).then(data => setStats(prev => ({ ...prev, totalOrders: data.total_orders ?? prev.totalOrders, todayRevenue: data.today_revenue ?? prev.todayRevenue, activeDrivers: data.active_drivers ?? prev.activeDrivers, lastUpdate: new Date() }))).catch(() => {});
    }, 30000);

    return () => { socket.disconnect(); clearInterval(interval); };
  }, []);

  return stats;
};

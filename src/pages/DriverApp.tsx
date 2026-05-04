import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bike, MapPin, Phone, Navigation, CheckCircle, X, 
  DollarSign, Clock, Star, TrendingUp, Package, 
  ChevronRight, Power, Camera, MessageSquare, 
  AlertCircle, ArrowUpRight, ArrowDownRight, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

/* ===================== TYPES ===================== */
interface DeliveryJob {
  id: string;
  restaurant: string;
  restaurantAddress: string;
  customer: string;
  customerAddress: string;
  distance: string;
  earnings: number;
  tip: number;
  items: string[];
  status: 'available' | 'accepted' | 'arrived-restaurant' | 'picked-up' | 'arrived-customer' | 'delivered' | 'cancelled';
  timeLeft: string;
  orderTime: string;
  instructions?: string;
  phone?: string;
}

/* ===================== MOCK DATA ===================== */
const weeklyEarnings = [
  { day: 'Mon', earnings: 68, trips: 4 },
  { day: 'Tue', earnings: 92, trips: 6 },
  { day: 'Wed', earnings: 45, trips: 3 },
  { day: 'Thu', earnings: 110, trips: 7 },
  { day: 'Fri', earnings: 135, trips: 9 },
  { day: 'Sat', earnings: 156, trips: 11 },
  { day: 'Sun', earnings: 87, trips: 5 },
];

const todayBreakdown = [
  { hour: '8am', earnings: 12 },
  { hour: '10am', earnings: 28 },
  { hour: '12pm', earnings: 45 },
  { hour: '2pm', earnings: 32 },
  { hour: '4pm', earnings: 18 },
  { hour: '6pm', earnings: 56 },
];

const initialJobs: DeliveryJob[] = [
  {
    id: 'JOB-2048',
    restaurant: 'Burger Vault',
    restaurantAddress: '1234 Robson St, Vancouver, BC',
    customer: 'Alex M.',
    customerAddress: '888 Burrard St, Apt 12B, Vancouver, BC',
    distance: '0.4 mi',
    earnings: 8.50,
    tip: 4.00,
    items: ['Classic Cheeseburger', 'Truffle Fries', 'Vanilla Shake'],
    status: 'available',
    timeLeft: '2 min',
    orderTime: '12:45 PM',
    instructions: 'Leave at door. Ring bell.',
    phone: '(555) 123-4567',
  },
  {
    id: 'JOB-2049',
    restaurant: 'Sakura Sushi',
    restaurantAddress: '456 Granville St, Vancouver, BC',
    customer: 'Sarah K.',
    customerAddress: '450 Lexington Ave, Floor 8, Vancouver, BC',
    distance: '1.2 mi',
    earnings: 12.75,
    tip: 6.50,
    items: ['Dragon Roll', 'Spicy Tuna Roll', 'Miso Soup'],
    status: 'available',
    timeLeft: '5 min',
    orderTime: '12:38 PM',
    instructions: 'Hand to customer. Office building.',
    phone: '(555) 987-6543',
  },
  {
    id: 'JOB-2050',
    restaurant: 'Mama\'s Pizza',
    restaurantAddress: '56 Mulberry St, Vancouver, BC',
    customer: 'Mike R.',
    customerAddress: '999 W Pender St, Apt 3C, Vancouver, BC',
    distance: '0.8 mi',
    earnings: 9.25,
    tip: 3.00,
    items: ['Margherita Pizza', 'Garlic Knots'],
    status: 'available',
    timeLeft: '8 min',
    orderTime: '12:30 PM',
    instructions: 'Call upon arrival.',
    phone: '(555) 456-7890',
  },
];

const completedJobs: DeliveryJob[] = [
  {
    id: 'JOB-2045',
    restaurant: 'Green Bowl',
    restaurantAddress: '200 Park Ave, Vancouver, BC',
    customer: 'Jessica L.',
    customerAddress: '350 5th Ave, Vancouver, BC',
    distance: '0.6 mi',
    earnings: 7.00,
    tip: 5.00,
    items: ['Buddha Bowl', 'Green Juice'],
    status: 'delivered',
    timeLeft: '0 min',
    orderTime: '11:15 AM',
  },
  {
    id: 'JOB-2046',
    restaurant: 'Taco Loco',
    restaurantAddress: '89 Canal St, Vancouver, BC',
    customer: 'David W.',
    customerAddress: '77 Bowery, Apt 5A, Vancouver, BC',
    distance: '1.1 mi',
    earnings: 10.50,
    tip: 2.50,
    items: ['Carne Asada Tacos', 'Chips & Guac'],
    status: 'delivered',
    timeLeft: '0 min',
    orderTime: '10:45 AM',
  },
];

/* ===================== COMPONENT ===================== */
export const DriverApp = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'earnings' | 'history'>('jobs');
  const [jobs, setJobs] = useState<DeliveryJob[]>(initialJobs);
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [earnings, setEarnings] = useState({ today: 87.50, week: 693, trips: 45, rating: 4.92 });

  // Broadcast real GPS to backend every 5 seconds when online
  useEffect(() => {
    if (!isOnline) return;
    const socket = io('https://api.boufet.com', { transports: ['websocket'] });
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit('driver_location', { lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetch('https://api.boufet.com/api/drivers/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, is_online: true }),
        }).catch(() => {});
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    return () => { navigator.geolocation.clearWatch(watchId); socket.disconnect(); };
  }, [isOnline]);

  const acceptJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setActiveJob({ ...job, status: 'accepted' });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'accepted' as const } : j));
    }
  };

  const declineJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  const updateJobStatus = (status: DeliveryJob['status']) => {
    if (!activeJob) return;
    const updated = { ...activeJob, status };
    setActiveJob(updated);
    setJobs(jobs.map(j => j.id === activeJob.id ? updated : j));
    
    if (status === 'delivered') {
      setEarnings({
        ...earnings,
        today: earnings.today + activeJob.earnings + activeJob.tip,
        trips: earnings.trips + 1,
      });
      setActiveJob(null);
    }
  };

  const availableJobs = jobs.filter(j => j.status === 'available');
  const completedToday = jobs.filter(j => j.status === 'delivered');

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Driver Status Header */}
      <div className={`sticky top-0 z-40 transition-all duration-500 ${isOnline ? 'bg-green-500' : 'bg-slate-500'} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            <span className="font-semibold">{isOnline ? 'Online - Receiving Orders' : 'Offline'}</span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${isOnline ? 'bg-white/20 hover:bg-white/30' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <Power className="w-4 h-4" />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
            <p className="text-xs text-muted-foreground mb-1">Today's Earnings</p>
            <p className="text-2xl font-bold text-foreground">${earnings.today.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs yesterday</span>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
            <p className="text-xs text-muted-foreground mb-1">Active Time</p>
            <p className="text-2xl font-bold text-foreground">4h 12m</p>
            <p className="text-xs text-muted-foreground mt-1">Since 8:30 AM</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-foreground">{completedToday.length + completedJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Deliveries today</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-soft">
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-foreground">{earnings.rating}</p>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Top 10% in area</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-card p-1 rounded-xl border border-border">
          {[
            { id: 'jobs', label: 'Delivery Jobs', icon: Package },
            { id: 'earnings', label: 'Earnings', icon: DollarSign },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id ? 'gradient-hero text-white shadow-glow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ACTIVE DELIVERY - Full Screen Card */}
        <AnimatePresence>
          {activeJob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-card rounded-3xl border-2 border-primary shadow-elevated overflow-hidden"
            >
              {/* Progress Steps */}
              <div className="bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-primary">Active Delivery</span>
                  <span className="text-xs text-muted-foreground">{activeJob.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'arrived-restaurant', label: 'At Restaurant' },
                    { key: 'picked-up', label: 'Picked Up' },
                    { key: 'arrived-customer', label: 'At Customer' },
                    { key: 'delivered', label: 'Delivered' },
                  ].map((step, i, arr) => {
                    const stepIndex = arr.findIndex(s => s.key === activeJob.status);
                    const isActive = i === stepIndex;
                    const isComplete = i < stepIndex;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isComplete ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded-full ${isComplete ? 'bg-green-500' : 'bg-muted'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {/* Route Visualization */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    <div className="w-0.5 h-12 bg-border my-1" />
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">PICKUP</p>
                      <p className="font-bold text-foreground">{activeJob.restaurant}</p>
                      <p className="text-sm text-muted-foreground">{activeJob.restaurantAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">DROPOFF</p>
                      <p className="font-bold text-foreground">{activeJob.customer}</p>
                      <p className="text-sm text-muted-foreground">{activeJob.customerAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${(activeJob.earnings + activeJob.tip).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">${activeJob.earnings} + ${activeJob.tip} tip</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-muted rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium mb-2">Order Items:</p>
                  {activeJob.items.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {item}</p>
                  ))}
                  {activeJob.instructions && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{activeJob.instructions}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {activeJob.status === 'accepted' && (
                    <>
                      <button onClick={() => updateJobStatus('arrived-restaurant')}
                        className="py-4 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all">
                        Arrived at Restaurant
                      </button>
                      <a href={`tel:${activeJob.phone}`} className="py-4 rounded-xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all">
                        <Phone className="w-5 h-5" /> Call
                      </a>
                    </>
                  )}
                  {activeJob.status === 'arrived-restaurant' && (
                    <button onClick={() => updateJobStatus('picked-up')}
                      className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all">
                      Confirm Pickup
                    </button>
                  )}
                  {activeJob.status === 'picked-up' && (
                    <>
                      <button onClick={() => updateJobStatus('arrived-customer')}
                        className="py-4 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all">
                        Arrived at Customer
                      </button>
                      <a href={`tel:${activeJob.phone}`} className="py-4 rounded-xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all">
                        <Phone className="w-5 h-5" /> Call Customer
                      </a>
                    </>
                  )}
                  {activeJob.status === 'arrived-customer' && (
                    <button onClick={() => setShowPhotoModal(true)}
                      className="col-span-2 py-4 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5" /> Complete Delivery
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!isOnline ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border">
                  <Power className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2">You're Offline</h3>
                  <p className="text-muted-foreground mb-6">Go online to see available delivery jobs</p>
                  <button onClick={() => setIsOnline(true)}
                    className="px-8 py-3 rounded-full gradient-hero text-white font-semibold shadow-glow">
                    Go Online
                  </button>
                </div>
              ) : availableJobs.length === 0 && !activeJob ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-border">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2">No Jobs Available</h3>
                  <p className="text-muted-foreground">Hang tight! New orders will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableJobs.map((job) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border border-border p-5 shadow-soft">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{job.restaurant}</h3>
                            <p className="text-sm text-muted-foreground">{job.restaurantAddress}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {job.distance}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.timeLeft}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${(job.earnings + job.tip).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">${job.earnings} + ${job.tip} tip</p>
                        </div>
                      </div>

                      <div className="bg-muted rounded-lg p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">DELIVER TO</p>
                        <p className="text-sm font-medium text-foreground">{job.customer}</p>
                        <p className="text-xs text-muted-foreground">{job.customerAddress}</p>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => acceptJob(job.id)}
                          className="flex-1 py-3 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all">
                          Accept
                        </button>
                        <button onClick={() => declineJob(job.id)}
                          className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-all">
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'earnings' && (
            <motion.div key="earnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4">Today's Earnings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={todayBreakdown}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(16 85% 55%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(16 85% 55%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="earnings" stroke="hsl(16 85% 55%)" fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4">Weekly Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    />
                    <Bar dataKey="earnings" fill="hsl(16 85% 55%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Base Pay</p>
                  <p className="text-xl font-bold">$62.50</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Tips</p>
                  <p className="text-xl font-bold text-green-500">$25.00</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Peak Pay</p>
                  <p className="text-xl font-bold text-primary">$12.00</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Promotions</p>
                  <p className="text-xl font-bold">$0.00</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {[...completedJobs, ...jobs.filter(j => j.status === 'delivered')].map((job) => (
                <div key={job.id} className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{job.restaurant}</h4>
                      <p className="text-sm text-muted-foreground">{job.customer} • {job.distance}</p>
                      <p className="text-xs text-muted-foreground mt-1">{job.orderTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${(job.earnings + job.tip).toFixed(2)}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">5.0</span>
                    </div>
                  </div>
                </div>
              ))}
              {completedJobs.length === 0 && jobs.filter(j => j.status === 'delivered').length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No completed deliveries yet today.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Proof Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Confirm Delivery</h3>
              <p className="text-muted-foreground mb-6">Take a photo or confirm handoff to customer</p>
              
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-border">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">Photo proof (optional)</p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => { setShowPhotoModal(false); updateJobStatus('delivered'); }}
                  className="w-full py-4 rounded-xl gradient-hero text-white font-bold hover:shadow-glow transition-all">
                  <CheckCircle className="w-5 h-5 inline mr-2" /> Delivery Complete
                </button>
                <button onClick={() => setShowPhotoModal(false)}
                  className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

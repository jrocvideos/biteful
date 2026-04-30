import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, MapPin, Clock, DollarSign, Phone, Navigation, CheckCircle, X, ChevronRight, Package } from 'lucide-react';

interface DeliveryJob {
  id: string;
  restaurant: string;
  customer: string;
  address: string;
  distance: string;
  earnings: number;
  items: string[];
  status: 'available' | 'accepted' | 'picked-up' | 'delivered';
  timeLeft: string;
}

const mockJobs: DeliveryJob[] = [
  {
    id: 'JOB-1023',
    restaurant: 'Burger Vault',
    customer: 'Alex M.',
    address: '245 E 45th St, New York, NY',
    distance: '0.4 mi',
    earnings: 8.50,
    items: ['Classic Cheeseburger', 'Fries', 'Coke'],
    status: 'available',
    timeLeft: '2 min',
  },
  {
    id: 'JOB-1024',
    restaurant: 'Sakura Sushi',
    customer: 'Sarah K.',
    address: '890 3rd Ave, New York, NY',
    distance: '1.2 mi',
    earnings: 12.75,
    items: ['Dragon Roll', 'Salmon Sashimi'],
    status: 'available',
    timeLeft: '5 min',
  },
  {
    id: 'JOB-1019',
    restaurant: 'Mama\'s Pizza',
    customer: 'Mike R.',
    address: '156 W 28th St, New York, NY',
    distance: '0.8 mi',
    earnings: 9.25,
    items: ['Margherita Pizza'],
    status: 'picked-up',
    timeLeft: '15 min',
  },
];

export const DriverApp = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null);
  const [earnings, setEarnings] = useState({ today: 87.50, week: 423.75, trips: 12 });

  const acceptJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'accepted' as const } : j));
  };

  const pickupJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'picked-up' as const } : j));
  };

  const deliverJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setEarnings({ ...earnings, today: earnings.today + job.earnings, trips: earnings.trips + 1 });
    }
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'delivered' as const } : j));
    setActiveJob(null);
  };

  const availableJobs = jobs.filter(j => j.status === 'available');
  const myJobs = jobs.filter(j => j.status === 'accepted' || j.status === 'picked-up');

  return (
    <main className="pt-24 pb-20 min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage deliveries and track earnings</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </div>
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-5 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Today's Earnings</p>
            <p className="text-2xl font-bold text-foreground">${earnings.today.toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border">
            <p className="text-sm text-muted-foreground mb-1">This Week</p>
            <p className="text-2xl font-bold text-foreground">${earnings.week.toFixed(2)}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Trips</p>
            <p className="text-2xl font-bold text-foreground">{earnings.trips}</p>
          </div>
        </div>

        {/* Active Delivery */}
        {myJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Active Delivery</h2>
            {myJobs.map((job) => (
              <motion.div key={job.id} layout className="bg-card rounded-2xl border border-border p-6 mb-4 shadow-elevated">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {job.status === 'accepted' ? 'Head to restaurant' : 'Delivering to customer'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{job.restaurant}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {job.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-primary">${job.earnings.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Navigation className="w-3 h-3" /> {job.distance}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{job.items.join(', ')}</p>
                </div>

                <div className="flex gap-3">
                  {job.status === 'accepted' && (
                    <button onClick={() => pickupJob(job.id)}
                      className="flex-1 py-3 rounded-xl gradient-hero text-white font-semibold hover:shadow-glow transition-all">
                      Mark as Picked Up
                    </button>
                  )}
                  {job.status === 'picked-up' && (
                    <button onClick={() => deliverJob(job.id)}
                      className="flex-1 py-3 rounded-xl gradient-hero text-white font-semibold hover:shadow-glow transition-all">
                      Complete Delivery
                    </button>
                  )}
                  <button className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Available Jobs */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Jobs ({availableJobs.length})</h2>
          <div className="space-y-4">
            {availableJobs.map((job) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-soft transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{job.restaurant}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {job.distance} • {job.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">${job.earnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {job.timeLeft}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{job.items.join(', ')}</p>
                <button onClick={() => acceptJob(job.id)}
                  className="w-full py-3 rounded-xl gradient-hero text-white font-semibold hover:shadow-glow transition-all">
                  Accept Delivery
                </button>
              </motion.div>
            ))}
            {availableJobs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
                <Bike className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No available jobs right now. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

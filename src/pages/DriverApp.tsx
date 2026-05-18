import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  Phone, CheckCircle, DollarSign, Clock, Star, Package, Power, Camera,
  Menu, Home, Calendar, User, Settings, ChevronRight, Shield, Moon, Sun,
  Bell, HelpCircle, LogOut, Award, BarChart2, Truck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliveryJob {
  id: string; restaurant: string; restaurantAddress: string;
  customer: string; customerAddress: string; distance: string;
  earnings: number; tip: number; items: string[];
  status: "available"|"accepted"|"arrived-restaurant"|"picked-up"|"arrived-customer"|"delivered"|"cancelled";
  timeLeft: string; orderTime: string; instructions?: string; phone?: string;
}

const weeklyEarnings = [
  { day: "Mon", earnings: 68 }, { day: "Tue", earnings: 92 },
  { day: "Wed", earnings: 45 }, { day: "Thu", earnings: 110 },
  { day: "Fri", earnings: 135 }, { day: "Sat", earnings: 156 }, { day: "Sun", earnings: 87 },
];

const todayBreakdown = [
  { hour: "8am", earnings: 12 }, { hour: "10am", earnings: 28 },
  { hour: "12pm", earnings: 45 }, { hour: "2pm", earnings: 32 },
  { hour: "4pm", earnings: 18 }, { hour: "6pm", earnings: 56 },
];

const initialJobs: DeliveryJob[] = [];

const completedJobs: DeliveryJob[] = [
  { id: "JOB-2045", restaurant: "Green Bowl", restaurantAddress: "200 Park Ave",
    customer: "Jessica L.", customerAddress: "350 5th Ave", distance: "0.6 mi",
    earnings: 7.00, tip: 5.00, items: ["Buddha Bowl"], status: "delivered",
    timeLeft: "0 min", orderTime: "11:15 AM" },
];

const ZoneMap = ({ isOnline, darkMode }: { isOnline: boolean; darkMode: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false })
      .setView([49.2650, -123.1800], 12);
    L.tileLayer(
      darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, subdomains: "abcd" }
    ).addTo(map);

    const zone: [number, number][] = [
      [49.2827, -123.1207], [49.2827, -123.0800], [49.2600, -123.0800],
      [49.2400, -123.1000], [49.2350, -123.1400], [49.2500, -123.2200],
      [49.2600, -123.2500], [49.2750, -123.2500], [49.2900, -123.2000],
      [49.2950, -123.1600], [49.2900, -123.1400], [49.2827, -123.1207],
    ];
    L.polygon(zone, { color: "#0d9488", weight: 3, fillColor: "#0d9488", fillOpacity: isOnline ? 0.18 : 0.08 }).addTo(map);

    L.marker([49.265, -123.19], {
      icon: L.divIcon({ className: "", html: `<div style="background:rgba(13,148,136,0.9);color:white;font-weight:bold;font-size:12px;padding:4px 10px;border-radius:20px;white-space:nowrap;">BC: Vancouver West</div>`, iconAnchor: [70, 10] })
    }).addTo(map);

    [[49.2827, -123.1207, "Downtown"], [49.2700, -123.1550, "Kitsilano"], [49.2680, -123.2460, "UBC"]].forEach(([lat, lng, name]: any) => {
      L.marker([lat, lng], { icon: L.divIcon({ className: "", html: `<div style="background:#f97316;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(249,115,22,0.6);border:2px solid white;">🔥</div>`, iconSize: [36, 36], iconAnchor: [18, 18] }) }).addTo(map).bindPopup(`<b>${name}</b><br>Busy hotspot`);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export const DriverApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"home"|"schedule"|"account"|"earnings"|"ratings"|"preferences">("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobs, setJobs] = useState<DeliveryJob[]>(initialJobs);
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const waitIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [earnings, setEarnings] = useState({ today: 87.50, week: 693, trips: 45, rating: 4.92 });
  const [preferences, setPreferences] = useState({ vapeDelivery: false, cashOnDelivery: false });

  useEffect(() => {
    if (!isOnline) return;
    const socket = io("https://api.boufet.com", { transports: ["polling", "websocket"] });
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("driver_location", { lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetch("https://api.boufet.com/api/drivers/location", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, is_online: true }),
        }).catch(() => {});
      },
      (err) => console.warn("GPS:", err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    return () => { navigator.geolocation.clearWatch(watchId); socket.disconnect(); };
  }, [isOnline]);

  // Listen for real job offers from backend
  useEffect(() => {
    if (!isOnline) return;
    const socket = io("https://api.boufet.com", { transports: ["polling", "websocket"] });
    console.log("Driver going online, connecting socket...");
    socket.on("connect", () => console.log("Driver socket connected:", socket.id));
    socket.on("connect_error", (e) => console.log("Driver socket error:", e.message));
    socket.emit("driver_online", {
      driver_id: localStorage.getItem("driver_id") || "drv_anon",
      vehicle_type: "car"
    });
    socket.on("new_job", (job: DeliveryJob) => {
      console.log("NEW JOB RECEIVED:", job);
      setJobs(prev => [...prev, { ...job, status: "available" as const }]);
    });
    socket.on("job_reassigned", (job: DeliveryJob) => {
      setJobs(prev => [...prev, { ...job, status: "available" as const, reassigned: true }]);
    });
    socket.on("job_taken", (jobId: string) => {
      setJobs(prev => prev.filter(j => j.id !== jobId));
    });
    return () => { socket.disconnect(); };
  }, [isOnline]);

  const acceptJob = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    try {
      const res = await fetch(`https://api.boufet.com/api/orders/${id}/driver-accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: localStorage.getItem("driver_id") || "drv_anon",
          accepted_at: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error("Failed to accept job");
      setActiveJob({ ...job, status: "accepted" });
      setJobs(jobs.map(j => j.id === id ? { ...j, status: "accepted" as const } : j));
      // Start wait timer
      setWaitSeconds(0);
      if (waitIntervalRef.current) clearInterval(waitIntervalRef.current);
      waitIntervalRef.current = setInterval(() => {
        setWaitSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      alert("Could not accept job — another driver may have taken it.");
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };
  const declineJob = async (id: string) => {
    try {
      await fetch(`https://api.boufet.com/api/orders/${id}/driver-decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: localStorage.getItem("driver_id") || "drv_anon",
          declined_at: new Date().toISOString()
        })
      });
    } catch (e) {}
    setJobs(jobs.filter(j => j.id !== id));
  };
  const updateJobStatus = async (status: DeliveryJob["status"]) => {
    if (!activeJob) return;
    const updated = { ...activeJob, status };
    setActiveJob(updated); setJobs(jobs.map(j => j.id === activeJob.id ? updated : j));

    if (status === "picked-up") {
      // Stop wait timer, calculate wait fee
      if (waitIntervalRef.current) clearInterval(waitIntervalRef.current);
      const waitMinutes = Math.ceil(waitSeconds / 60);
      const waitFee = waitMinutes > 5 ? (waitMinutes - 5) * 0.50 : 0;
      await fetch(`https://api.boufet.com/api/orders/${activeJob.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "out_for_delivery",
          picked_up_at: new Date().toISOString(),
          wait_minutes: waitMinutes,
          wait_fee: waitFee
        })
      });
    }

    if (status === "delivered") {
      await fetch(`https://api.boufet.com/api/orders/${activeJob.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "delivered",
          delivered_at: new Date().toISOString()
        })
      });
      setEarnings(e => ({ ...e, today: e.today + activeJob.earnings + activeJob.tip, trips: e.trips + 1 }));
      setActiveJob(null);
    }
  };

  const availableJobs = jobs.filter(j => j.status === "available");
  const bg = darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const cardBg = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const muted = darkMode ? "text-gray-400" : "text-gray-500";

  const NavBtn = ({ icon: Icon, label, screen }: any) => (
    <button onClick={() => setActiveScreen(screen)} className={`flex-1 flex flex-col items-center py-3 gap-1 ${activeScreen === screen ? "text-teal-400" : muted}`}>
      <Icon className="w-5 h-5" /><span className="text-xs">{label}</span>
    </button>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? "bg-teal-600" : darkMode ? "bg-gray-700" : "bg-gray-300"} relative`}>
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className={`min-h-screen ${bg} flex flex-col relative overflow-hidden`}>

      {/* Slide-out menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25 }}
              className={`fixed left-0 top-0 bottom-0 w-72 z-50 ${darkMode ? "bg-gray-900" : "bg-white"} shadow-2xl flex flex-col`}>
              <div className="p-6 pt-12 bg-gradient-to-br from-teal-700 to-teal-500">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl mb-3">JY</div>
                <h2 className="text-white font-bold text-xl">Jose Y.</h2>
                <div className="flex items-center gap-2 mt-1"><Award className="w-4 h-4 text-yellow-300" /><span className="text-teal-100 text-sm">Platinum Driver</span></div>
              </div>
              <div className="flex-1 py-4">
                {([["home","Home",Home],["schedule","Schedule",Calendar],["account","Account",User],["ratings","Ratings",Star],["earnings","Earnings",DollarSign],["preferences","Preferences",Settings]] as any[]).map(([screen,label,Icon]) => (
                  <button key={screen} onClick={() => { setActiveScreen(screen); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-6 py-4 ${activeScreen === screen ? "bg-teal-600/20 text-teal-400" : darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`}>
                    <Icon className="w-5 h-5" /><span className="font-medium">{label}</span>
                    {activeScreen === screen && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
              <div className={`p-4 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
                  <Toggle value={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </button>
                <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400`}><LogOut className="w-5 h-5" /><span>Log out</span></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 ${cardBg} border-b z-30`}>
        <button onClick={() => setMenuOpen(true)} className={`p-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}><Menu className="w-5 h-5" /></button>
        <div className="text-center"><p className={`text-xs ${muted}`}>This week</p><p className="font-bold text-lg text-teal-400">${earnings.week.toFixed(2)}</p></div>
        <div className="flex gap-2">
          <button className={`p-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"} relative`}><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
          <button className={`p-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}><HelpCircle className="w-5 h-5" /></button>
        </div>
      </div>

      {/* HOME */}
      {activeScreen === "home" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="relative" style={{ height: "55vh" }}>
            <ZoneMap isOnline={isOnline} darkMode={darkMode} />
            <div className="absolute top-3 left-0 right-0 flex justify-center z-[400]">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${isOnline ? "bg-teal-600" : darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-gray-400"}`} />
                <span className={`text-sm font-bold ${isOnline ? "text-white" : muted}`}>{isOnline ? "Looking for offers" : "You're offline"}</span>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 z-[400]">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-sm`}>
                <Clock className="w-4 h-4 text-teal-400" /><span className="text-sm font-bold">est. 2–10 min</span>
              </div>
            </div>
          </div>
          <div className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-white"} rounded-t-3xl -mt-4 z-10 shadow-2xl px-4 pt-5 pb-4 overflow-y-auto`}>
            <button onClick={() => setIsOnline(!isOnline)}
              className={`w-full py-4 rounded-2xl font-bold text-lg mb-4 ${isOnline ? "bg-gray-700 text-white" : "bg-teal-600 text-white shadow-lg shadow-teal-500/30"}`}>
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[["Today", `$${earnings.today.toFixed(2)}`, "text-teal-400"], ["Trips", `${earnings.trips}`, ""], ["Rating", `${earnings.rating}★`, "text-yellow-400"]].map(([label, val, color]) => (
                <div key={label} className={`${darkMode ? "bg-gray-800" : "bg-gray-50"} rounded-2xl p-3 text-center`}>
                  <p className={`text-xs ${muted} mb-1`}>{label}</p><p className={`font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>
            {activeJob && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`${darkMode ? "bg-gray-800 border-teal-500" : "bg-teal-50 border-teal-400"} border-2 rounded-2xl p-4 mb-4`}>
                <div className="flex justify-between mb-2"><span className="text-teal-400 font-bold text-sm">Active Delivery</span><span className={`text-xs ${muted}`}>{activeJob.id}</span></div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-teal-500" /><div className="w-0.5 h-8 bg-gray-600 my-1" /><div className="w-3 h-3 rounded-full bg-orange-500" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{activeJob.restaurant}</p><p className={`text-xs ${muted} mb-2`}>{activeJob.restaurantAddress}</p>
                    <p className="font-bold text-sm">{activeJob.customer}</p><p className={`text-xs ${muted}`}>{activeJob.customerAddress}</p>
                  </div>
                  <div className="text-right"><p className="font-bold text-teal-400">${(Number(activeJob.earnings || 0) + Number(activeJob.tip || 0)).toFixed(2)}</p><p className={`text-xs ${muted}`}>{activeJob.distance}</p></div>
                </div>
                <div className="mb-3">
                  {activeJob.status === "accepted" && (
                    <div className="p-2 bg-yellow-900/30 border border-yellow-600 rounded-lg mb-2">
                      <p className="text-yellow-400 text-sm font-bold">
                        Wait time: {Math.floor(waitSeconds / 60)}m {waitSeconds % 60}s
                      </p>
                      {waitSeconds > 300 && (
                        <p className="text-green-400 text-xs">
                          +${((Math.ceil(waitSeconds / 60) - 5) * 0.50).toFixed(2)} wait fee earning
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {activeJob.status === "accepted" && <><button onClick={() => updateJobStatus("arrived-restaurant")} className="py-3 rounded-xl bg-teal-600 text-white font-bold text-sm">Arrived at Restaurant</button><a href={`tel:${activeJob.phone}`} className="py-3 rounded-xl bg-gray-700 text-white font-bold text-sm flex items-center justify-center gap-1"><Phone className="w-4 h-4" />Call</a></>}
                  {activeJob.status === "arrived-restaurant" && <button onClick={() => updateJobStatus("picked-up")} className="col-span-2 py-3 rounded-xl bg-teal-600 text-white font-bold">Confirm Pickup</button>}
                  {activeJob.status === "picked-up" && <><button onClick={() => updateJobStatus("arrived-customer")} className="py-3 rounded-xl bg-teal-600 text-white font-bold text-sm">Arrived at Customer</button><a href={`tel:${activeJob.phone}`} className="py-3 rounded-xl bg-gray-700 text-white font-bold text-sm flex items-center justify-center gap-1"><Phone className="w-4 h-4" />Call</a></>}
                  {activeJob.status === "arrived-customer" && <button onClick={() => setShowPhotoModal(true)} className="col-span-2 py-3 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center gap-2"><Camera className="w-4 h-4" />Complete Delivery</button>}
                </div>
              </motion.div>
            )}
            {isOnline && !activeJob && availableJobs.map(job => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} border rounded-2xl p-4 mb-3`}>
                <div className="flex justify-between mb-2">
                  <div><p className="font-bold">{job.restaurant}</p><p className={`text-xs ${muted}`}>{job.distance} · {job.timeLeft} to accept</p></div>
                  <div className="text-right"><p className="font-bold text-teal-400 text-lg">${(Number(job.earnings || 0) + Number(job.tip || 0)).toFixed(2)}</p><p className={`text-xs ${muted}`}>${Number(job.earnings || 0).toFixed(2)} + ${Number(job.tip || 0).toFixed(2)} tip</p></div>
                </div>
                <p className={`text-xs ${muted} mb-3`}>{job.customer} · {job.customerAddress}</p>
                <div className="flex gap-2">
                  <button onClick={() => acceptJob(job.id)} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold">Accept</button>
                  <button onClick={() => declineJob(job.id)} className={`flex-1 py-3 rounded-xl ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"} font-bold`}>Decline</button>
                </div>
              </motion.div>
            ))}
            {!isOnline && <div className={`text-center py-8 ${muted}`}><Power className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Go online to receive orders</p></div>}
          </div>
        </div>
      )}

      {/* SCHEDULE */}
      {activeScreen === "schedule" && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Schedule</h1>
          <div className={`${cardBg} border rounded-2xl p-4 mb-5`}>
            <div className="grid grid-cols-7 text-center mb-2">{["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <p key={d} className={`text-xs ${muted}`}>{d}</p>)}</div>
            <div className="grid grid-cols-7 text-center">{[4,5,6,7,8,9,10].map((d,i) => <button key={d} className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${i===0?"bg-teal-600 text-white":darkMode?"text-gray-300 hover:bg-gray-800":"text-gray-700 hover:bg-gray-100"}`}>{d}</button>)}</div>
          </div>
          <div className={`flex ${darkMode?"bg-gray-800":"bg-gray-100"} rounded-xl p-1 mb-5`}>
            <button className="flex-1 py-2 rounded-lg bg-teal-600 text-white font-bold text-sm">Available</button>
            <button className={`flex-1 py-2 rounded-lg font-bold text-sm ${muted}`}>Scheduled</button>
          </div>
          {["BC: Vancouver West","BC: Vancouver Downtown","BC: Vancouver East","BC: Vancouver North"].map((zone,i) => (
            <div key={zone} className={`${cardBg} border rounded-2xl p-4 mb-3`}>
              <p className={`text-xs ${muted} mb-1`}>{zone}</p>
              <p className="font-bold mb-3">May {4+i}, 9:00 PM – May {5+i}, 4:00 AM</p>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm">Reserve Shift</button>
            </div>
          ))}
        </div>
      )}

      {/* EARNINGS */}
      {activeScreen === "earnings" && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Earnings</h1>
          <div className={`${cardBg} border rounded-2xl p-5 mb-4`}>
            <p className={`text-xs ${muted}`}>Today</p><p className="text-3xl font-bold text-teal-400 mb-3">${earnings.today.toFixed(2)}</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={todayBreakdown}>
                <defs><linearGradient id="teal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#374151":"#e5e7eb"} />
                <XAxis dataKey="hour" stroke={darkMode?"#6b7280":"#9ca3af"} fontSize={11} /><YAxis stroke={darkMode?"#6b7280":"#9ca3af"} fontSize={11} />
                <Tooltip contentStyle={{ background: darkMode?"#111827":"#fff", border:"1px solid #374151", borderRadius:12 }} />
                <Area type="monotone" dataKey="earnings" stroke="#0d9488" fillOpacity={1} fill="url(#teal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={`${cardBg} border rounded-2xl p-5 mb-4`}>
            <p className={`text-xs ${muted} mb-3`}>This Week — $${earnings.week}</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#374151":"#e5e7eb"} />
                <XAxis dataKey="day" stroke={darkMode?"#6b7280":"#9ca3af"} fontSize={11} /><YAxis stroke={darkMode?"#6b7280":"#9ca3af"} fontSize={11} />
                <Tooltip contentStyle={{ background: darkMode?"#111827":"#fff", border:"1px solid #374151", borderRadius:12 }} />
                <Bar dataKey="earnings" fill="#0d9488" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Base Pay","$62.50",""],["Tips","$25.00","text-teal-400"],["Peak Pay","$12.00","text-orange-400"],["Total",`$${earnings.today.toFixed(2)}`,"text-teal-400"]].map(([l,v,c])=>(
              <div key={l} className={`${cardBg} border rounded-2xl p-4`}><p className={`text-xs ${muted} mb-1`}>{l}</p><p className={`text-xl font-bold ${c}`}>{v}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* RATINGS */}
      {activeScreen === "ratings" && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Ratings & Rewards</h1>
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-5 mb-5 flex items-center justify-between">
            <div><p className="text-teal-100 text-xs mb-1">Driver Rewards</p><p className="text-white font-bold text-2xl">Platinum Status</p></div>
            <Award className="w-14 h-14 text-yellow-300" />
          </div>
          <div className={`${cardBg} border rounded-2xl mb-4`}>
            <p className="font-bold px-5 pt-4 pb-2">Your Ratings</p>
            {[["Acceptance Rate","95%"],["Completion Rate","100%"],["On-time Rate","76%"],["Customer Rating","4.92 ★"],["Deliveries (30 days)","287"],["Lifetime Deliveries","2,609"]].map(([l,v])=>(
              <div key={l} className={`flex justify-between items-center px-5 py-3 border-t ${darkMode?"border-gray-800":"border-gray-100"}`}>
                <span className={`text-sm ${muted}`}>{l}</span><div className="flex items-center gap-2"><span className="font-bold text-sm">{v}</span><ChevronRight className={`w-4 h-4 ${muted}`} /></div>
              </div>
            ))}
          </div>
          <div className={`${cardBg} border rounded-2xl`}>
            <p className="font-bold px-5 pt-4 pb-2">Unlocked Perks</p>
            {["Priority access to orders","Top priority for high-paying offers","Early scheduling access","VIP Driver Support"].map(p=>(
              <div key={p} className={`flex justify-between items-center px-5 py-3 border-t ${darkMode?"border-gray-800":"border-gray-100"}`}>
                <span className="text-sm">{p}</span><ChevronRight className={`w-4 h-4 ${muted}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCOUNT */}
      {activeScreen === "account" && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Account</h1>
          {([["Profile",User],["Vehicle Management",Truck],["Account Data",BarChart2],["Safe Driving",Shield],["App Settings",Settings],["Help",HelpCircle]] as any[]).map(([label,Icon])=>(
            <div key={label} className={`flex items-center justify-between px-4 py-4 border-b ${darkMode?"border-gray-800":"border-gray-100"}`}>
              <div className="flex items-center gap-4"><Icon className={`w-5 h-5 ${muted}`} /><span className="font-medium">{label}</span></div>
              <ChevronRight className={`w-4 h-4 ${muted}`} />
            </div>
          ))}
          <button className="flex items-center gap-4 px-4 py-4 text-red-400"><LogOut className="w-5 h-5" /><span className="font-medium">Log out</span></button>
        </div>
      )}

      {/* PREFERENCES */}
      {activeScreen === "preferences" && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">Preferences</h1>
          <p className={`text-sm ${muted} mb-6`}>Maximize the types of offers you receive</p>
          {[
            { key:"vapeDelivery", title:"Vape & Tobacco Delivery", desc:"Hand-deliver to 19+ customers after checking government ID. Required for Smoke2Snack orders." },
            { key:"cashOnDelivery", title:"Cash on Delivery", desc:"Access more earning opportunities and keep all cash payments including tips." },
          ].map(({ key, title, desc }) => (
            <div key={key} className={`${cardBg} border rounded-2xl p-5 mb-4`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4"><p className="font-bold mb-1">{title}</p><p className={`text-sm ${muted}`}>{desc}</p></div>
                <Toggle value={(preferences as any)[key]} onChange={() => setPreferences(p => ({ ...p, [key]: !(p as any)[key] }))} />
              </div>
            </div>
          ))}
          <div className={`${cardBg} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
              <div><p className="font-bold mb-1">Dark Mode</p><p className={`text-sm ${muted}`}>Switch between light and dark</p></div>
              <Toggle value={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className={`${cardBg} border-t flex z-20`}>
        <NavBtn icon={Home} label="Home" screen="home" />
        <NavBtn icon={Calendar} label="Schedule" screen="schedule" />
        <NavBtn icon={DollarSign} label="Earnings" screen="earnings" />
        <NavBtn icon={Star} label="Ratings" screen="ratings" />
        <NavBtn icon={User} label="Account" screen="account" />
      </div>

      {/* PHOTO MODAL */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-end">
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className={`w-full ${darkMode?"bg-gray-900":"bg-white"} rounded-t-3xl p-6`}>
              <h3 className="text-xl font-bold mb-2">Confirm Delivery</h3>
              <p className={`text-sm ${muted} mb-4`}>Take a photo or confirm handoff</p>
              <div className={`aspect-video ${darkMode?"bg-gray-800":"bg-gray-100"} rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed ${darkMode?"border-gray-700":"border-gray-300"}`}>
                <div className="text-center"><Camera className={`w-10 h-10 mx-auto mb-2 ${muted}`} /><p className={`text-sm ${muted}`}>Photo proof (optional)</p></div>
              </div>
              <button onClick={() => { setShowPhotoModal(false); updateJobStatus("delivered"); }} className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold mb-3 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />Delivery Complete</button>
              <button onClick={() => setShowPhotoModal(false)} className={`w-full py-3 rounded-2xl ${darkMode?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"} font-medium`}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

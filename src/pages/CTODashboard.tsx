import { useLiveStats } from '../hooks/useLiveStats';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Globe, GitBranch, AlertCircle, CheckCircle, Clock,
  DollarSign, Users, TrendingUp, Bike, MapPin, Package, Zap,
  BarChart2, Settings, X, ChevronRight, RefreshCw, XCircle,
  Code, Layers, Shield, Database, Cpu, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ============ MOCK LIVE DATA ============ */
const revenueData = [
  { time: '8am', revenue: 120, orders: 8 },
  { time: '10am', revenue: 340, orders: 22 },
  { time: '12pm', revenue: 890, orders: 58 },
  { time: '2pm', revenue: 620, orders: 41 },
  { time: '4pm', revenue: 480, orders: 31 },
  { time: '6pm', revenue: 1100, orders: 72 },
  { time: '8pm', revenue: 940, orders: 61 },
];

const commits = [
  { hash: 'e3ebd74', message: 'force redeploy: Yolanda dashboard login fix', author: 'jrocvideos', time: '2h ago', status: 'success' },
  { hash: 'fc0f414', message: 'feat: Peter CGO dashboard at /cgo', author: 'jrocvideos', time: '4h ago', status: 'success' },
  { hash: 'af239f8', message: 'feat: multi-user team auth — Peter self-register', author: 'jrocvideos', time: '5h ago', status: 'success' },
  { hash: '8d65917', message: 'fix: use local smoke2snack product images', author: 'jrocvideos', time: '8h ago', status: 'success' },
  { hash: 'dd04ed3', message: 'fix: admin fee $2.09 + 8%, remove service fee line', author: 'jrocvideos', time: '12h ago', status: 'success' },
];

const backlog = [
  { id: 'b1', title: 'Stripe Payments Integration', priority: 'critical', est: '3–4 days', tags: ['payments', 'backend'], notes: 'Wire real card processing. Currently mock UI only. Need Stripe secret key + webhook.' },
  { id: 'b2', title: 'Signed Release APK', priority: 'high', est: '2 hrs', tags: ['mobile', 'android'], notes: 'Build signed APK with keystore. Current debug APK is 2x larger and slower.' },
  { id: 'b3', title: 'Google Maps API — Real Geocoding', priority: 'high', est: '1 day', tags: ['maps', 'frontend'], notes: 'Replace Leaflet hardcoded Vancouver coords with real customer address geocoding.' },
  { id: 'b4', title: 'Driver Vehicle Logic — Gas vs E-Bike', priority: 'high', est: '1 day', tags: ['backend', 'dispatch'], notes: 'Scooter/e-bike: max 1.7km, $1 less per delivery. Gas: no restriction. Wire in dispatch.' },
  { id: 'b5', title: 'Node.js Upgrade — 18 → 20', priority: 'medium', est: '30 min', tags: ['backend', 'devops'], notes: 'Railway showing Node 18 deprecation warning. Upgrade in Railway environment settings.' },
  { id: 'b6', title: 'Restaurant Signup Email Notifications', priority: 'medium', est: '2 hrs', tags: ['backend', 'email'], notes: 'Nodemailer added to server.js. Need EMAIL_APP_PASSWORD in Railway env vars.' },
  { id: 'b7', title: 'Stripe Identity — Driver ID Verification', priority: 'medium', est: '2 days', tags: ['payments', 'compliance'], notes: 'Required for vape delivery age verification. Stripe Identity API.' },
  { id: 'b8', title: 'Real-time Order Dispatch to Drivers', priority: 'medium', est: '2 days', tags: ['backend', 'websocket'], notes: 'Socket.io is wired. Need order → driver matching logic by zone + vehicle type.' },
  { id: 'b9', title: 'Restaurant Dashboard — Real Order Mgmt', priority: 'low', est: '3 days', tags: ['frontend', 'backend'], notes: 'RestaurantDashboard.tsx exists but uses mock data. Wire to real orders API.' },
  { id: 'b10', title: 'iOS PWA Manifest + Service Worker', priority: 'low', est: '1 hr', tags: ['mobile', 'pwa'], notes: 'Add manifest.json and sw.js for full PWA install on iPhone. Currently unstyled.' },
];

const priorityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
};

const drivers = [
  { id: 'd1', name: 'Marco R.', status: 'delivering', lat: 49.2827, lng: -123.1207, order: 'JOB-2048', earnings: 87.50 },
  { id: 'd2', name: 'Sarah T.', status: 'online', lat: 49.2700, lng: -123.1550, order: null, earnings: 42.00 },
  { id: 'd3', name: 'David K.', status: 'delivering', lat: 49.2680, lng: -123.2460, order: 'JOB-2051', earnings: 123.00 },
];

/* ============ LOGIN ============ */
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const attempt = () => {
    if (pass === 'BoufetCTO2026!') { onLogin(); }
    else { setErr('Incorrect password.'); }
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4">B</div>
        <h1 className="text-2xl font-bold text-white mb-1">Boufet CTO Portal</h1>
        <p className="text-gray-400 text-sm mb-8">Jose — Co-Founder & CTO</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
          <div><label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && attempt()} placeholder="Enter your password" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button onClick={attempt} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">Access CTO Dashboard</button>
          <p className="text-center text-xs text-gray-600">Boufet Internal — CTO Access Only</p>
        </div>
      </div>
    </div>
  );
};

/* ============ SYSTEM HEALTH ============ */
const SystemHealth = () => {
  const [checking, setChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<'up'|'down'|'checking'>('up');

  const checkAPI = async () => {
    setChecking(true);
    setApiStatus('checking');
    try {
      const res = await fetch('https://api.boufet.com/health', { signal: AbortSignal.timeout(5000) });
      setApiStatus(res.ok ? 'up' : 'down');
    } catch {
      setApiStatus('down');
    }
    setChecking(false);
  };

  useEffect(() => { checkAPI(); }, []);

  const services = [
    { name: 'Vercel (Frontend)', status: 'up', url: 'boufet.com', note: 'Auto-deploys on push to main' },
    { name: 'Railway (Backend API)', status: apiStatus, url: 'api.boufet.com', note: 'Node.js + PostgreSQL + Socket.io' },
    { name: 'PostgreSQL Database', status: 'up', url: 'Railway managed', note: 'Primary data store' },
    { name: 'Socket.io (GPS)', status: 'up', url: 'api.boufet.com', note: 'Real-time driver tracking' },
    { name: 'Stripe', status: 'pending', url: 'stripe.com', note: 'Not connected — test keys only' },
    { name: 'Google Maps API', status: 'pending', url: 'maps.googleapis.com', note: 'Not connected — using Leaflet fallback' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">System Health</h3>
        <button onClick={checkAPI} disabled={checking} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} /> Check All
        </button>
      </div>
      <div className="space-y-2">
        {services.map(s => (
          <div key={s.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.status==='up' ? 'bg-teal-400 shadow-[0_0_6px_#2dd4bf]' : s.status==='down' ? 'bg-red-400 animate-pulse' : s.status==='checking' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">{s.note}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status==='up' ? 'bg-teal-500/10 text-teal-400' : s.status==='down' ? 'bg-red-500/10 text-red-400' : s.status==='pending' ? 'bg-gray-700 text-gray-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              {s.status==='up' ? '✓ Online' : s.status==='down' ? '✗ Down' : s.status==='pending' ? 'Not Setup' : 'Checking...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============ MAIN DASHBOARD ============ */
export const CTODashboard = () => {
  const [authed, setAuthed] = useState(false);
  const liveStats = useLiveStats();
  const [tab, setTab] = useState<'overview'|'technical'|'backlog'|'team'|'drivers'>('overview');
  const [todos, setTodos] = useState(backlog);
  const [filter, setFilter] = useState<'all'|'critical'|'high'|'medium'|'low'>('all');

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const filtered = todos.filter(t => filter === 'all' || t.priority === filter);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'technical', label: 'Systems', icon: Cpu },
    { id: 'backlog', label: 'Dev Backlog', icon: Code },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: Bike },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg">B</div>
            <div>
              <h1 className="font-bold text-lg">Boufet CTO Command</h1>
              <p className="text-xs text-gray-400">Jose Yupangco — Co-Founder & CTO</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs text-teal-400 font-medium">{liveStats.connected ? '● Live Data' : '○ Demo Mode'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold">JY</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap ${tab===t.id?'bg-teal-600 text-white':'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'}`}><t.icon className="w-4 h-4"/>{t.label}</button>)}
        </div>

        {/* OVERVIEW */}
        {tab==='overview' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Today's Revenue", v: `$${liveStats.todayRevenue.toLocaleString()}`, c: 'text-teal-400', I: DollarSign, sub: liveStats.connected ? '● Live' : 'Demo mode' },
              { l: 'Orders Today', v: `${liveStats.totalOrders}`, c: 'text-blue-400', I: Package, sub: `${liveStats.ordersActive} active now` },
              { l: 'Active Drivers', v: `${liveStats.activeDrivers}`, c: 'text-yellow-400', I: Bike, sub: 'GPS tracking live' },
              { l: 'Restaurants Live', v: '3', c: 'text-emerald-400', I: Globe, sub: 'Papa Johns, Blue Water, Smoke2Snack' },
            ].map(({l,v,c,I,sub}) => (
              <div key={l} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex justify-between mb-3"><p className="text-xs text-gray-400">{l}</p><I className={`w-4 h-4 ${c}`}/></div>
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Today's Revenue + Orders</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11}/>
                <YAxis stroke="#6b7280" fontSize={11}/>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #374151',borderRadius:12}}/>
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" fillOpacity={1} fill="url(#rev)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Live order feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-400"/>Live Order Feed</h3>
            <div className="space-y-2">
              {liveStats.recentOrders.map(o => (
                <div key={o.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${o.status==='incoming'?'bg-red-400 animate-pulse':o.status==='preparing'?'bg-yellow-400':o.status==='ready'?'bg-teal-400':'bg-blue-400'}`}/>
                  <span className="text-xs font-mono text-yellow-400">{o.orderNumber}</span>
                  <span className="text-sm flex-1">{o.customerName} · {o.restaurantName}</span>
                  <span className="text-xs text-gray-400">{o.status}</span>
                  <span className="text-xs font-bold text-teal-400">${o.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent commits */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><GitBranch className="w-4 h-4 text-teal-400"/>Recent GitHub Commits — main</h3>
            <div className="space-y-2">
              {commits.map(c => (
                <div key={c.hash} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0"/>
                  <code className="text-xs text-yellow-400 bg-gray-900 px-2 py-0.5 rounded font-mono flex-shrink-0">{c.hash}</code>
                  <p className="text-sm flex-1 truncate">{c.message}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0">{c.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical backlog items */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400"/>Critical Items — Fix This Week</h3>
            <div className="space-y-2">
              {backlog.filter(b => b.priority === 'critical' || b.priority === 'high').map(b => (
                <div key={b.id} className={`flex items-center gap-3 p-3 border rounded-xl ${priorityConfig[b.priority].bg}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${priorityConfig[b.priority].color} bg-black/20`}>{b.priority.toUpperCase()}</span>
                  <p className="text-sm flex-1">{b.title}</p>
                  <span className="text-xs text-gray-400">{b.est}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}

        {/* TECHNICAL */}
        {tab==='technical' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
          <SystemHealth />

          {/* Env vars needed */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-yellow-400"/>Environment Variables — Action Required</h3>
            <div className="space-y-2">
              {[
                { key: 'EMAIL_APP_PASSWORD', where: 'Railway', status: 'missing', note: 'Gmail app password for restaurant signup notifications' },
                { key: 'STRIPE_SECRET_KEY', where: 'Railway + Vercel', status: 'placeholder', note: 'Real Stripe key needed for payments to work' },
                { key: 'GOOGLE_MAPS_API_KEY', where: 'Vercel', status: 'missing', note: 'Required for real geocoding + map accuracy' },
                { key: 'JWT_SECRET', where: 'Railway', status: 'set', note: 'Auth token signing — currently using default' },
                { key: 'DATABASE_URL', where: 'Railway', status: 'set', note: 'PostgreSQL connection string' },
              ].map(e => (
                <div key={e.key} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <code className="text-xs text-teal-300 font-mono flex-shrink-0 bg-gray-900 px-2 py-0.5 rounded">{e.key}</code>
                  <span className="text-xs text-gray-500 flex-shrink-0">{e.where}</span>
                  <p className="text-xs text-gray-400 flex-1">{e.note}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${e.status==='set' ? 'bg-teal-500/10 text-teal-400' : e.status==='missing' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {e.status==='set' ? '✓ Set' : e.status==='missing' ? '✗ Missing' : '⚠ Placeholder'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400"/>Tech Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Frontend', 'React + TypeScript + Tailwind', 'Vercel'],
                ['Backend', 'Node.js + Express', 'Railway'],
                ['Database', 'PostgreSQL', 'Railway managed'],
                ['Real-time', 'Socket.io', 'api.boufet.com'],
                ['Mobile', 'Capacitor (Android + iOS)', 'boufet.com/driver-download'],
                ['Auth', 'JWT + bcrypt', 'api.boufet.com/api/auth'],
                ['Payments', 'Stripe (not wired)', 'Pending'],
                ['Maps', 'Leaflet (fallback)', 'Google Maps pending'],
                ['Repo', 'github.com/jrocvideos/biteful', 'main branch'],
              ].map(([name, tech, host]) => (
                <div key={name} className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{name}</p>
                  <p className="text-sm font-medium">{tech}</p>
                  <p className="text-xs text-teal-400 mt-1">{host}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}

        {/* DEV BACKLOG */}
        {tab==='backlog' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-400 text-sm">Prioritized development tasks</p>
              <p className="text-xs text-gray-500 mt-1">{todos.filter(t => t.priority==='critical').length} critical · {todos.filter(t => t.priority==='high').length} high · {todos.filter(t => t.priority==='medium').length} medium · {todos.filter(t => t.priority==='low').length} low</p>
            </div>
            <div className="flex gap-2">
              {(['all','critical','high','medium','low'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===f ? 'bg-teal-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'}`}>{f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className={`border rounded-2xl p-5 ${priorityConfig[item.priority].bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityConfig[item.priority].bg} ${priorityConfig[item.priority].color}`}>{item.priority.toUpperCase()}</span>
                    {item.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{tag}</span>)}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{item.est}</span>
                </div>
                <p className="text-sm text-gray-300">{item.notes}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setTodos(todos.map(t => t.id===item.id ? {...t, priority: 'low'} : t))} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">Mark Done ✓</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>}

        {/* TEAM */}
        {tab==='team' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
          <p className="text-gray-400 text-sm mb-5">Full overview of all team dashboards and activity.</p>

          {/* Team members */}
          {[
            { name: 'Jose Yupangco', role: 'Co-Founder & CTO', url: 'boufet.com/cto', avatar: 'JY', focus: 'Platform architecture, backend, mobile APK, dev backlog', color: 'from-teal-600 to-teal-800' },
            { name: 'Yolanda Cantu', role: 'Co-Founder & Business Development Lead', url: 'boufet.com/biz', avatar: 'YC', focus: 'Restaurant pipeline, sales scripts, KPIs, contact management', color: 'from-violet-600 to-violet-800' },
            { name: 'Peter', role: 'Chief Growth Officer', url: 'boufet.com/cgo', avatar: 'P', focus: 'Market expansion, corporate partnerships, investor KPIs, roadmap', color: 'from-orange-600 to-orange-800' },
          ].map(member => (
            <div key={member.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center font-bold text-xl`}>{member.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-teal-400">{member.role}</p>
                  <a href={`https://${member.url}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mt-0.5">{member.url} <ChevronRight className="w-3 h-3"/></a>
                </div>
              </div>
              <p className="text-sm text-gray-400 bg-gray-800 rounded-xl px-4 py-3">{member.focus}</p>
            </div>
          ))}

          {/* Combined KPIs */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-400"/>Combined Business KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Restaurants Signed', '3', 'text-teal-400'],
                ['Restaurants in Pipeline', '43', 'text-blue-400'],
                ['Meetings Booked', '2', 'text-yellow-400'],
                ['Active Drivers', '3', 'text-orange-400'],
                ['Orders Today', '42', 'text-emerald-400'],
                ['Month 1 Target', '3/10', 'text-purple-400'],
              ].map(([l,v,c]) => (
                <div key={l as string} className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{l}</p>
                  <p className={`text-2xl font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}

        {/* DRIVERS */}
        {tab==='drivers' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Live driver GPS activity</p>
            <div className="flex items-center gap-2 text-xs text-teal-400"><div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"/>{drivers.filter(d=>d.status==='delivering').length} on delivery</div>
          </div>

          {drivers.map(d => (
            <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${d.status==='delivering' ? 'bg-teal-600' : 'bg-gray-700'}`}>{d.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div>
                    <p className="font-bold">{d.name}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${d.status==='delivering' ? 'bg-teal-400 animate-pulse' : 'bg-yellow-400'}`}/>
                      <span className={`text-xs ${d.status==='delivering' ? 'text-teal-400' : 'text-yellow-400'}`}>{d.status==='delivering' ? 'On Delivery' : 'Online — Waiting'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-400">${d.earnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">GPS</p><p className="text-xs font-mono text-teal-300">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</p></div>
                <div className="bg-gray-800 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Active Order</p><p className="text-xs font-mono text-yellow-300">{d.order || '— None'}</p></div>
              </div>
            </div>
          ))}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400"/>Driver Vehicle Policy (Active)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl"><div><p className="text-sm font-medium">Gas Vehicle</p><p className="text-xs text-gray-400">Car / Motorcycle</p></div><p className="text-sm text-teal-400">Standard pay · No distance limit</p></div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl"><div><p className="text-sm font-medium">Scooter / E-Bike</p><p className="text-xs text-gray-400">Electric only</p></div><p className="text-sm text-yellow-400">$1 less/delivery · 1.7km max</p></div>
            </div>
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <p className="text-xs text-orange-400 font-medium">⚠ Not yet wired in dispatch logic — in dev backlog</p>
            </div>
          </div>
        </motion.div>}
      </div>
    </div>
  );
};

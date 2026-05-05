import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Globe, DollarSign, Target, ChevronRight,
  BarChart2, MapPin, Users, Zap, Award, ArrowUpRight,
  CheckCircle, Clock, AlertCircle, Building2, X, Save, Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

const revenueData = [
  { month: 'May', revenue: 12000, orders: 320, target: 15000 },
  { month: 'Jun', revenue: 32000, orders: 850, target: 40000 },
  { month: 'Jul', revenue: 68000, orders: 1800, target: 75000 },
  { month: 'Aug', revenue: 105000, orders: 2800, target: 120000 },
  { month: 'Sep', revenue: 155000, orders: 4100, target: 170000 },
  { month: 'Oct', revenue: 210000, orders: 5500, target: 230000 },
  { month: 'Nov', revenue: 275000, orders: 7200, target: 310000 },
  { month: 'Dec', revenue: 350000, orders: 9200, target: 350000 },
];

const marketData = [
  { city: 'Vancouver', restaurants: 43, drivers: 12, orders: 320, status: 'active', color: 'bg-teal-500' },
  { city: 'Toronto', restaurants: 0, drivers: 0, orders: 0, status: 'month_8', color: 'bg-yellow-500' },
  { city: 'Calgary', restaurants: 0, drivers: 0, orders: 0, status: 'month_9', color: 'bg-yellow-500' },
  { city: 'Montreal', restaurants: 0, drivers: 0, orders: 0, status: 'month_10', color: 'bg-gray-500' },
  { city: 'Seattle', restaurants: 0, drivers: 0, orders: 0, status: 'month_11', color: 'bg-gray-500' },
  { city: 'Mexico City', restaurants: 0, drivers: 0, orders: 0, status: 'month_12', color: 'bg-gray-500' },
];

const partnerships = [
  { id: 'p1', name: 'Fairmont Hotels Vancouver', type: 'Hotel Concierge', status: 'prospect', value: 45000, notes: 'Target all 3 Vancouver properties. Corporate catering angle.' },
  { id: 'p2', name: 'Cactus Club Corp Deal', type: 'Restaurant Chain', status: 'prospect', value: 120000, notes: 'Multi-location deal. 8 Vancouver locations. Approach VP Operations.' },
  { id: 'p3', name: 'White Spot Corporate', type: 'Restaurant Chain', status: 'prospect', value: 85000, notes: 'BC-based chain. Strong brand alignment with local focus.' },
  { id: 'p4', name: 'Lululemon HQ Catering', type: 'Corporate Catering', status: 'prospect', value: 60000, notes: 'HQ in Kitsilano. 2,500 employees. Daily lunch orders potential.' },
  { id: 'p5', name: 'UBC Food Services', type: 'Campus', status: 'in_progress', value: 95000, notes: 'Already have Papa Johns near UBC. Expand to full campus partnership.' },
  { id: 'p6', name: 'A&W Corporate', type: 'Restaurant Chain', status: 'prospect', value: 200000, notes: 'Canadian chain. 1,000+ locations nationally. Strategic for expansion.' },
];

const investorMetrics = [
  { label: 'Monthly Active Users', value: '1,240', change: '+34%', up: true },
  { label: 'Avg Order Value', value: '$38.50', change: '+8%', up: true },
  { label: 'Driver Retention', value: '78%', change: '+12%', up: true },
  { label: 'Restaurant Churn', value: '2%', change: '-1%', up: true },
  { label: 'Customer LTV', value: '$284', change: '+22%', up: true },
  { label: 'CAC', value: '$12.40', change: '-18%', up: true },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  prospect: { label: 'Prospect', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  signed: { label: 'Signed', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
};

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const attempt = () => {
    const accounts = JSON.parse(localStorage.getItem('boufet_team') || '[]');
    const peter = accounts.find((a: any) => a.role === 'CGO');
    if (peter && peter.password === pass) { onLogin(); }
    else if (pass === 'BoufetCGO2026!') { onLogin(); }
    else { setErr('Incorrect password. Contact Jose.'); }
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4">B</div>
        <h1 className="text-2xl font-bold text-white mb-1">Boufet CGO Portal</h1>
        <p className="text-gray-400 text-sm mb-8">Peter — Chief Growth Officer</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
          <div><label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && attempt()} placeholder="Enter your password" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button onClick={attempt} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">Access Dashboard</button>
          <p className="text-center text-xs text-gray-600">Boufet Internal — CGO Access Only</p>
        </div>
      </div>
    </div>
  );
};

export const PeterDashboard = () => {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'overview'|'markets'|'partnerships'|'investor'|'roadmap'>('overview');
  const [partners, setPartners] = useState(partnerships);
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState<any>({ status: 'prospect' });

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const totalPipelineValue = partners.reduce((a, p) => a + p.value, 0);
  const signedValue = partners.filter(p => p.status === 'signed').reduce((a, p) => a + p.value, 0);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'markets', label: 'Markets', icon: Globe },
    { id: 'partnerships', label: 'Partnerships', icon: Building2 },
    { id: 'investor', label: 'Investor KPIs', icon: TrendingUp },
    { id: 'roadmap', label: 'Roadmap', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg">B</div>
            <div><h1 className="font-bold text-lg">Boufet Growth Command</h1><p className="text-xs text-gray-400">Peter — Chief Growth Officer</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block"><p className="text-xs text-gray-400">Partnership Pipeline</p><p className="font-bold text-teal-400">${(totalPipelineValue/1000).toFixed(0)}K</p></div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold">P</div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: 'Monthly Revenue', v: '$12,000', sub: 'May 2026 — Month 1', c: 'text-teal-400', I: DollarSign },
              { l: 'Active Restaurants', v: '43', sub: 'Vancouver pipeline', c: 'text-blue-400', I: Building2 },
              { l: 'Active Drivers', v: '12', sub: 'Online this week', c: 'text-yellow-400', I: Users },
              { l: 'Month 12 Target', v: '$350K', sub: 'On track', c: 'text-emerald-400', I: Target },
            ].map(({l,v,sub,c,I}) => (
              <div key={l} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex justify-between mb-3"><p className="text-xs text-gray-400">{l}</p><I className={`w-4 h-4 ${c}`}/></div>
                <p className={`text-2xl font-bold ${c}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue projection chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Revenue Trajectory — Path to $350K/month</h3>
              <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full">12-Month Plan</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient>
                  <linearGradient id="tar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11}/>
                <YAxis stroke="#6b7280" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}K`}/>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #374151',borderRadius:12}} formatter={(v: any) => [`$${v.toLocaleString()}`, '']}/>
                <Area type="monotone" dataKey="revenue" name="Actual" stroke="#0d9488" fillOpacity={1} fill="url(#rev)"/>
                <Area type="monotone" dataKey="target" name="Target" stroke="#f97316" fillOpacity={1} fill="url(#tar)" strokeDasharray="4 4"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Strategic priorities */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/>CGO Strategic Priorities — May 2026</h3>
            <div className="space-y-3">
              {[
                { priority: '1', task: 'Close 10 restaurant partnerships in Yaletown + Olympic Village', due: 'May 31', status: 'in_progress' },
                { priority: '2', task: 'Initiate corporate catering conversations — Lululemon HQ, Fairmont Hotels', due: 'Jun 15', status: 'prospect' },
                { priority: '3', task: 'Build investor pitch deck — target seed round $500K–$1M', due: 'Jun 30', status: 'prospect' },
                { priority: '4', task: 'Establish Cactus Club and White Spot corporate deal pipeline', due: 'Jul 31', status: 'prospect' },
                { priority: '5', task: 'Toronto market research — identify 20 target restaurants for Month 8 launch', due: 'Aug 1', status: 'prospect' },
              ].map(item => (
                <div key={item.priority} className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.priority}</div>
                  <p className="text-sm flex-1">{item.task}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{item.due}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}

        {/* MARKETS */}
        {tab==='markets' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
          <p className="text-gray-400 text-sm">Vancouver → Canada → USA → Mexico. Track expansion city by city.</p>
          {marketData.map((m, i) => (
            <div key={m.city} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${m.color}`}/>
                  <h3 className="font-bold text-lg">{m.city}</h3>
                  {m.status === 'active' && <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full">Active</span>}
                  {m.status !== 'active' && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Month {m.status.split('_')[1]}</span>}
                </div>
                {m.status === 'active' && <span className="text-teal-400 font-bold">${(m.orders * 38 * 0.095).toLocaleString()}/mo</span>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400 mb-1">Restaurants</p><p className={`font-bold ${m.restaurants > 0 ? 'text-teal-400' : 'text-gray-600'}`}>{m.restaurants > 0 ? m.restaurants : '—'}</p></div>
                <div className="bg-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400 mb-1">Drivers</p><p className={`font-bold ${m.drivers > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{m.drivers > 0 ? m.drivers : '—'}</p></div>
                <div className="bg-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400 mb-1">Orders/day</p><p className={`font-bold ${m.orders > 0 ? 'text-blue-400' : 'text-gray-600'}`}>{m.orders > 0 ? m.orders : '—'}</p></div>
              </div>
              {m.status !== 'active' && (
                <div className="mt-3 p-3 bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-400">Launch criteria: {i <= 2 ? '50+ restaurant commitments, 20+ drivers recruited, local ops manager hired' : i === 3 ? 'French UI complete, Quebec regulatory compliance, 30+ restaurant commitments' : i === 4 ? 'US legal entity (Delaware C-Corp), local business license, 20+ restaurant commitments' : 'Spanish UI, local payment processing, 15+ restaurant commitments'}</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>}

        {/* PARTNERSHIPS */}
        {tab==='partnerships' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-gray-400 text-sm">Corporate accounts, chains, and strategic deals</p>
              <p className="text-xs text-gray-500 mt-1">Total pipeline value: <span className="text-teal-400 font-bold">${totalPipelineValue.toLocaleString()}</span></p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 rounded-xl font-medium text-sm"><Plus className="w-4 h-4"/>Add</button>
          </div>
          <div className="space-y-3">
            {partners.map(p => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-bold">{p.name}</h3><span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[p.status].color}`}>{statusConfig[p.status].label}</span></div>
                    <p className="text-sm text-gray-400">{p.type}</p>
                  </div>
                  <div className="text-right"><p className="font-bold text-teal-400">${p.value.toLocaleString()}</p><p className="text-xs text-gray-500">annual value</p></div>
                </div>
                <p className="text-xs text-gray-400 bg-gray-800 rounded-xl px-3 py-2 italic">"{p.notes}"</p>
                <div className="flex gap-2 mt-3">
                  {(['prospect','in_progress','signed'] as const).map(s => (
                    <button key={s} onClick={() => setPartners(partners.map(x => x.id===p.id ? {...x,status:s} : x))} className={`px-3 py-1 rounded-lg text-xs font-medium ${p.status===s ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{statusConfig[s].label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>}

        {/* INVESTOR KPIs */}
        {tab==='investor' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900/40 to-gray-900 border border-teal-800/40 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-1">Seed Round Target</h3>
            <p className="text-gray-400 text-sm mb-4">Target: $500K–$1M · Timeline: Month 7 (November 2026)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[['Pre-money Valuation','$3.5M','Based on 10x revenue multiple'],['Equity Offered','15–20%','Seed stage standard'],['Use of Funds','Ops + Tech + Marketing','See breakdown below'],['Break-even','Month 9','Conservative projection'],['Investors Targeted','Vancouver Angels + YC','Application Month 7'],['Exit Strategy','Series A @ Month 18','$5M–$8M raise']].map(([l,v,s])=>(
                <div key={l as string} className="bg-gray-800 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">{l as string}</p><p className="font-bold text-teal-400">{v as string}</p><p className="text-xs text-gray-500 mt-1">{s as string}</p></div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {investorMetrics.map(m => (
              <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div><p className="text-sm text-gray-400">{m.label}</p><p className="text-2xl font-bold mt-1">{m.value}</p></div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${m.up ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
                  <ArrowUpRight className="w-4 h-4"/>{m.change}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4">Use of Funds Breakdown</h3>
            <div className="space-y-3">
              {[['Operations & Driver Acquisition','35%','$175K–$350K'],['Technology & Product','25%','$125K–$250K'],['Marketing & Customer Acquisition','20%','$100K–$200K'],['Sales Team (2 reps)','15%','$75K–$150K'],['Legal & Compliance','5%','$25K–$50K']].map(([l,p,v])=>(
                <div key={l as string}>
                  <div className="flex justify-between text-sm mb-1"><span>{l as string}</span><span className="text-teal-400 font-bold">{p as string} · {v as string}</span></div>
                  <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{width:p as string}}/></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>}

        {/* ROADMAP */}
        {tab==='roadmap' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
          <p className="text-gray-400 text-sm mb-2">12-month strategic roadmap — Boufet domination plan.</p>
          {[
            { month: 'Month 1–2', title: 'Yaletown + Olympic Village', status: 'active', items: ['Sign 10 restaurants', 'Hire 15 drivers', 'Launch TikTok + Instagram', '$8K–$40K revenue'] },
            { month: 'Month 3–4', title: 'Kitsilano + West Side Expansion', status: 'upcoming', items: ['Sign 20 more restaurants', 'Corporate catering launch', 'Google Ads begin', '$55K–$120K revenue'] },
            { month: 'Month 5–6', title: 'Metro Vancouver Lock-in', status: 'upcoming', items: ['North Van + Burnaby + Richmond', '70+ total restaurants', 'Seed round preparation', '$140K–$230K revenue'] },
            { month: 'Month 7', title: 'Systemize + National Prep', status: 'upcoming', items: ['85+ restaurants signed', 'Chain corporate deals', 'Seed round close', '$270K–$310K revenue'] },
            { month: 'Month 8–9', title: 'Toronto + Calgary Launch', status: 'future', items: ['Toronto: Liberty Village + King West', 'Calgary: Downtown core', '100+ restaurants nationally', '$300K–$330K revenue'] },
            { month: 'Month 10–11', title: 'Montreal + Seattle', status: 'future', items: ['French UI for Quebec', 'US legal entity', 'Seattle: Capitol Hill + Downtown', '$325K–$360K revenue'] },
            { month: 'Month 12', title: 'Mexico City Pilot', status: 'future', items: ['Spanish UI complete', 'Local payment processing', '200+ restaurants total', '$350,000+/month'] },
          ].map(step => (
            <div key={step.month} className={`border rounded-2xl p-5 ${step.status==='active' ? 'bg-teal-900/20 border-teal-700/50' : step.status==='upcoming' ? 'bg-gray-900 border-gray-800' : 'bg-gray-900/50 border-gray-800/50 opacity-70'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${step.status==='active' ? 'bg-teal-400 animate-pulse' : step.status==='upcoming' ? 'bg-yellow-400' : 'bg-gray-600'}`}/>
                  <span className="text-xs text-gray-400">{step.month}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${step.status==='active' ? 'bg-teal-500/20 text-teal-400' : step.status==='upcoming' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'}`}>{step.status==='active' ? 'In Progress' : step.status==='upcoming' ? 'Upcoming' : 'Future'}</span>
              </div>
              <h3 className="font-bold mb-3">{step.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {step.items.map(item => <div key={item} className="flex items-center gap-2 text-xs text-gray-400"><ChevronRight className="w-3 h-3 text-teal-500 flex-shrink-0"/>{item}</div>)}
              </div>
            </div>
          ))}
        </motion.div>}
      </div>

      {/* Add partnership modal */}
      <AnimatePresence>{showAdd && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-5"><h3 className="font-bold text-lg">Add Partnership</h3><button onClick={()=>setShowAdd(false)}><X className="w-5 h-5 text-gray-400"/></button></div>
            <div className="space-y-3">
              {[['Company Name','name','text'],['Partnership Type','type','text'],['Annual Value ($)','value','number'],['Notes','notes','text']].map(([l,f,t])=>(
                <div key={f as string}><label className="text-xs text-gray-400 mb-1 block">{l as string}</label><input type={t as string} value={np[f as string]||''} onChange={e=>setNp((p: any)=>({...p,[f as string]:t==='number'?+e.target.value:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/></div>
              ))}
              <div><label className="text-xs text-gray-400 mb-1 block">Status</label><select value={np.status||'prospect'} onChange={e=>setNp((p: any)=>({...p,status:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"><option value="prospect">Prospect</option><option value="in_progress">In Progress</option><option value="signed">Signed</option></select></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium">Cancel</button>
              <button onClick={()=>{ if(!np.name) return; setPartners([{id:Date.now().toString(),...np,value:np.value||0},...partners]); setNp({status:'prospect'}); setShowAdd(false); }} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Add</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

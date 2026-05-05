import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Users, FileText, Calculator, Phone, Mail, MapPin, Plus, Search, CheckCircle, Clock, XCircle, Calendar, TrendingUp, DollarSign, Trash2, X, Save, AlertCircle, Award, Zap, MessageSquare } from 'lucide-react';

type PipelineStatus = 'contacted' | 'meeting_booked' | 'signed' | 'declined';
interface Restaurant { id: string; name: string; ownerName: string; phone: string; email: string; address: string; cuisine: string; status: PipelineStatus; followUpDate: string; notes: string; avgMonthlyOrders: number; dateAdded: string; }

const DATA: Restaurant[] = [
  { id: 's1', name: 'Papa Johns (UBC)', ownerName: 'Franchise Manager', phone: '(604) 000-0001', email: 'manager@papajohns.ca', address: 'Near UBC, Vancouver', cuisine: 'Pizza', status: 'signed', followUpDate: '', notes: 'SIGNED. First restaurant on platform.', avgMonthlyOrders: 900, dateAdded: '2026-04-01' },
  { id: 's2', name: 'Smoke2Snack', ownerName: 'Store Manager', phone: '(604) 000-0002', email: 'info@smoke2snack.com', address: 'Olympic Village', cuisine: 'Vape & Convenience', status: 'signed', followUpDate: '', notes: 'SIGNED. Olympic Village.', avgMonthlyOrders: 400, dateAdded: '2026-04-01' },
  { id: 'm1_1', name: 'Provence Marinaside', ownerName: 'Marc Dupont', phone: '(604) 681-4144', email: 'marc@provence.ca', address: '1177 Marinaside Cr, Yaletown', cuisine: 'French', status: 'meeting_booked', followUpDate: '2026-05-08', notes: 'Very interested. Meeting Tue 2pm.', avgMonthlyOrders: 800, dateAdded: '2026-05-04' },
  { id: 'm1_2', name: 'The Keg Yaletown', ownerName: 'Sandra Li', phone: '(604) 685-4388', email: 'sandra@kegyaletown.ca', address: '1011 Mainland St, Yaletown', cuisine: 'Steakhouse', status: 'contacted', followUpDate: '2026-05-07', notes: 'Left message. Follow up Wednesday.', avgMonthlyOrders: 1200, dateAdded: '2026-05-04' },
  { id: 'm1_3', name: 'Blue Water Cafe', ownerName: 'James Olson', phone: '(604) 688-8078', email: 'james@bluewatercafe.net', address: '1095 Hamilton St, Yaletown', cuisine: 'Seafood', status: 'signed', followUpDate: '', notes: 'SIGNED! 20% commission. Live May 10.', avgMonthlyOrders: 950, dateAdded: '2026-05-03' },
  { id: 'm1_4', name: 'Minami Restaurant', ownerName: 'Aki Tanaka', phone: '(604) 685-8080', email: 'aki@minamirestaurant.com', address: '1118 Mainland St, Yaletown', cuisine: 'Japanese', status: 'contacted', followUpDate: '2026-05-09', notes: 'Owner unavailable. Try again Friday.', avgMonthlyOrders: 700, dateAdded: '2026-05-04' },
  { id: 'm1_5', name: 'Cactus Club Yaletown', ownerName: 'GM', phone: '(604) 687-3278', email: 'yaletown@cactusclub.ca', address: '1133 Hamilton St, Yaletown', cuisine: 'Canadian', status: 'contacted', followUpDate: '2026-05-10', notes: 'High volume. Speak to GM only.', avgMonthlyOrders: 1500, dateAdded: '2026-05-04' },
  { id: 'm1_6', name: 'Craft Beer Market', ownerName: 'Tanya Ross', phone: '(604) 709-2337', email: 'tanya@craftbeermarket.ca', address: '85 W 1st Ave, Olympic Village', cuisine: 'Pub/American', status: 'meeting_booked', followUpDate: '2026-05-06', notes: 'GM receptive. Wants comparison sheet.', avgMonthlyOrders: 1100, dateAdded: '2026-05-03' },
  { id: 'm1_7', name: 'Ask For Luigi', ownerName: 'Owner', phone: '(604) 428-2544', email: 'info@askforluigi.com', address: '305 Alexander St, Vancouver', cuisine: 'Italian', status: 'contacted', followUpDate: '2026-05-11', notes: 'Popular brunch. Walk in Tuesday morning.', avgMonthlyOrders: 600, dateAdded: '2026-05-04' },
  { id: 'm1_8', name: 'Tap & Barrel Olympic', ownerName: 'Kevin Park', phone: '(604) 648-2227', email: 'kevin@tapandbarrel.ca', address: '1 Athletes Way, Olympic Village', cuisine: 'Pub', status: 'declined', followUpDate: '', notes: 'DoorDash 2-year contract. Revisit Nov 2026.', avgMonthlyOrders: 600, dateAdded: '2026-05-02' },
  { id: 'm1_9', name: 'The Flying Pig Yaletown', ownerName: 'Owner', phone: '(604) 569-8800', email: 'yaletown@theflyingpig.ca', address: '1168 Hamilton St, Yaletown', cuisine: 'Canadian Bistro', status: 'contacted', followUpDate: '2026-05-08', notes: 'Great brunch volume.', avgMonthlyOrders: 850, dateAdded: '2026-05-04' },
  { id: 'm1_10', name: 'Hawksworth Restaurant', ownerName: 'David Hawksworth', phone: '(604) 673-7000', email: 'info@hawksworthrestaurant.com', address: '801 W Georgia St, Downtown', cuisine: 'Fine Dining', status: 'contacted', followUpDate: '2026-05-12', notes: 'High-end. Use premium pitch angle.', avgMonthlyOrders: 500, dateAdded: '2026-05-04' },
  { id: 'm2_1', name: 'Miku Restaurant', ownerName: 'GM', phone: '(604) 568-3900', email: 'info@mikurestaurant.com', address: '200 Granville St, Downtown', cuisine: 'Japanese', status: 'contacted', followUpDate: '2026-06-01', notes: 'High-volume lunch crowd downtown.', avgMonthlyOrders: 900, dateAdded: '2026-05-05' },
  { id: 'm2_2', name: 'Gotham Steakhouse', ownerName: 'Owner', phone: '(604) 605-8282', email: 'info@gothamsteakhouse.com', address: '615 Seymour St, Downtown', cuisine: 'Steakhouse', status: 'contacted', followUpDate: '2026-06-02', notes: 'Downtown power lunch.', avgMonthlyOrders: 800, dateAdded: '2026-05-05' },
  { id: 'm2_3', name: 'Bao Bei Chinese Brasserie', ownerName: 'Tannis Ling', phone: '(604) 688-0876', email: 'info@bao-bei.ca', address: '163 Keefer St, Chinatown', cuisine: 'Chinese', status: 'contacted', followUpDate: '2026-06-03', notes: 'Trendy Chinatown. Very popular weekends.', avgMonthlyOrders: 650, dateAdded: '2026-05-05' },
  { id: 'm2_4', name: 'Railtown Cafe', ownerName: 'Owner', phone: '(604) 568-8338', email: 'info@railtowncafe.ca', address: '397 Railway St, Railtown', cuisine: 'Cafe/Brunch', status: 'contacted', followUpDate: '2026-06-04', notes: 'Walk in before 10am.', avgMonthlyOrders: 450, dateAdded: '2026-05-05' },
  { id: 'm2_5', name: 'Ancora Waterfront', ownerName: 'GM', phone: '(604) 681-1164', email: 'info@ancoradining.com', address: '1600 Howe St, Downtown', cuisine: 'Seafood/Peruvian', status: 'contacted', followUpDate: '2026-06-05', notes: 'Strong dinner volume.', avgMonthlyOrders: 750, dateAdded: '2026-05-05' },
  { id: 'm2_6', name: 'Homer St Cafe', ownerName: 'Owner', phone: '(604) 428-4299', email: 'info@homerst.ca', address: '898 Homer St, Yaletown', cuisine: 'Cafe/Brunch', status: 'contacted', followUpDate: '2026-06-06', notes: 'Familiar with Boufet from area buzz.', avgMonthlyOrders: 500, dateAdded: '2026-05-05' },
  { id: 'm3_1', name: "Sophie's Cosmic Cafe", ownerName: 'Owner', phone: '(604) 732-6810', email: 'info@sophiescosmic.com', address: '2095 W 4th Ave, Kitsilano', cuisine: 'Diner/Brunch', status: 'contacted', followUpDate: '2026-07-01', notes: 'Kits icon. Very busy weekend brunch.', avgMonthlyOrders: 700, dateAdded: '2026-05-05' },
  { id: 'm3_2', name: 'Fable Kitchen', ownerName: 'Trevor Bird', phone: '(604) 732-1322', email: 'info@fablekitchen.ca', address: '1944 W 4th Ave, Kitsilano', cuisine: 'Farm-to-Table', status: 'contacted', followUpDate: '2026-07-02', notes: 'Chef-driven. Sustainability pitch angle.', avgMonthlyOrders: 600, dateAdded: '2026-05-05' },
  { id: 'm3_3', name: 'Suika Snackbar', ownerName: 'Owner', phone: '(604) 730-4786', email: 'info@suikarestaurant.com', address: '1626 W Broadway, Kitsilano', cuisine: 'Japanese Izakaya', status: 'contacted', followUpDate: '2026-07-03', notes: 'High order volume after 8pm.', avgMonthlyOrders: 800, dateAdded: '2026-05-05' },
  { id: 'm3_4', name: 'Naam Restaurant', ownerName: 'Owner', phone: '(604) 738-7151', email: 'info@thenaam.com', address: '2724 W 4th Ave, Kitsilano', cuisine: 'Vegetarian', status: 'contacted', followUpDate: '2026-07-04', notes: 'Oldest veg restaurant in Vancouver.', avgMonthlyOrders: 500, dateAdded: '2026-05-05' },
  { id: 'm3_5', name: 'Sushi Cocoro', ownerName: 'Owner', phone: '(604) 731-3333', email: 'info@sushicocoro.ca', address: '2232 W 4th Ave, Kitsilano', cuisine: 'Japanese', status: 'contacted', followUpDate: '2026-07-05', notes: 'Neighbourhood sushi staple.', avgMonthlyOrders: 600, dateAdded: '2026-05-05' },
  { id: 'm4_1', name: "Vij's Restaurant", ownerName: 'Vikram Vij', phone: '(604) 736-6664', email: 'info@vijs.ca', address: '3106 Cambie St, Cambie', cuisine: 'Indian', status: 'contacted', followUpDate: '2026-08-01', notes: 'Vancouver icon. Delivery = pure upside.', avgMonthlyOrders: 900, dateAdded: '2026-05-05' },
  { id: 'm4_2', name: 'Tractor Foods Dunbar', ownerName: 'Owner', phone: '(604) 222-0330', email: 'dunbar@tractorfoods.com', address: '3604 W 4th Ave, Dunbar', cuisine: 'Healthy/Bowls', status: 'contacted', followUpDate: '2026-08-02', notes: 'Good weekday lunch.', avgMonthlyOrders: 480, dateAdded: '2026-05-05' },
  { id: 'm4_3', name: 'Browns Socialhouse Dunbar', ownerName: 'GM', phone: '(604) 222-2220', email: 'dunbar@brownssocialhouse.com', address: '3956 Dunbar St, Dunbar', cuisine: 'Pub/Canadian', status: 'contacted', followUpDate: '2026-08-03', notes: 'Try corporate deal angle.', avgMonthlyOrders: 700, dateAdded: '2026-05-05' },
  { id: 'm4_4', name: 'Dunbar Pizzeria', ownerName: 'Owner', phone: '(604) 222-0088', email: 'info@dunbarpizzeria.ca', address: '3847 Dunbar St, Dunbar', cuisine: 'Pizza', status: 'contacted', followUpDate: '2026-08-04', notes: 'Easy win — delivery is their main channel.', avgMonthlyOrders: 600, dateAdded: '2026-05-05' },
  { id: 'm5_1', name: 'Salmon House on the Hill', ownerName: 'GM', phone: '(604) 926-3212', email: 'info@salmonhouseonthehill.com', address: '2229 Folkestone Way, West Van', cuisine: 'Seafood', status: 'contacted', followUpDate: '2026-09-01', notes: 'North Van landmark.', avgMonthlyOrders: 700, dateAdded: '2026-05-05' },
  { id: 'm5_2', name: 'Cactus Club Metrotown', ownerName: 'GM', phone: '(604) 435-2220', email: 'metrotown@cactusclub.ca', address: '4567 Kingsway, Burnaby', cuisine: 'Canadian', status: 'contacted', followUpDate: '2026-09-02', notes: 'High volume mall-adjacent.', avgMonthlyOrders: 1400, dateAdded: '2026-05-05' },
  { id: 'm5_3', name: 'Sushi Garden Burnaby', ownerName: 'Owner', phone: '(604) 298-2666', email: 'info@sushigarden.ca', address: '3608 E Hastings, Burnaby', cuisine: 'Japanese', status: 'contacted', followUpDate: '2026-09-03', notes: 'Legendary lineups. Delivery huge untapped revenue.', avgMonthlyOrders: 1000, dateAdded: '2026-05-05' },
  { id: 'm5_4', name: 'Earls Burnaby', ownerName: 'GM', phone: '(604) 433-2750', email: 'burnaby@earls.ca', address: '4413 Kingsway, Burnaby', cuisine: 'Canadian', status: 'contacted', followUpDate: '2026-09-04', notes: 'Strong all-day volume.', avgMonthlyOrders: 1200, dateAdded: '2026-05-05' },
  { id: 'm6_1', name: 'Dinesty Dumpling House', ownerName: 'Owner', phone: '(604) 278-2868', email: 'info@dinesty.ca', address: '8171 Ackroyd Rd, Richmond', cuisine: 'Chinese/Taiwanese', status: 'contacted', followUpDate: '2026-10-01', notes: 'Always packed. Have Mandarin materials ready.', avgMonthlyOrders: 1200, dateAdded: '2026-05-05' },
  { id: 'm6_2', name: 'Sea Harbour Seafood', ownerName: 'Owner', phone: '(604) 232-0816', email: 'info@seaharbour.com', address: '3711 No 3 Rd, Richmond', cuisine: 'Chinese Seafood', status: 'contacted', followUpDate: '2026-10-02', notes: 'Premium dim sum. Very high ticket orders.', avgMonthlyOrders: 900, dateAdded: '2026-05-05' },
  { id: 'm6_3', name: 'Kirin Restaurant Richmond', ownerName: 'Owner', phone: '(604) 303-8833', email: 'info@kirinrestaurant.com', address: '7900 Westminster Hwy, Richmond', cuisine: 'Chinese', status: 'contacted', followUpDate: '2026-10-03', notes: 'Good corporate lunch.', avgMonthlyOrders: 800, dateAdded: '2026-05-05' },
  { id: 'm6_4', name: 'Cactus Club Surrey', ownerName: 'GM', phone: '(604) 582-3278', email: 'surrey@cactusclub.ca', address: '10268 King George Blvd, Surrey', cuisine: 'Canadian', status: 'contacted', followUpDate: '2026-10-04', notes: 'High volume Surrey location.', avgMonthlyOrders: 1300, dateAdded: '2026-05-05' },
  { id: 'm6_5', name: 'Browns Socialhouse Surrey', ownerName: 'GM', phone: '(604) 503-9990', email: 'surrey@brownssocialhouse.com', address: '7550 120 St, Surrey', cuisine: 'Pub/Canadian', status: 'contacted', followUpDate: '2026-10-05', notes: 'Good Surrey suburban volume.', avgMonthlyOrders: 750, dateAdded: '2026-05-05' },
  { id: 'lat1', name: 'La Taqueria Pinche Taco', ownerName: 'Owner', phone: '(604) 568-4406', email: 'info@lataqueria.ca', address: '322 W Hastings St, Downtown', cuisine: 'Mexican', status: 'contacted', followUpDate: '2026-05-15', notes: 'Best tacos in Vancouver. Walk in before noon.', avgMonthlyOrders: 750, dateAdded: '2026-05-05' },
  { id: 'lat2', name: 'Tacofino', ownerName: 'Owner', phone: '(604) 899-1070', email: 'info@tacofino.com', address: '2327 E Hastings St, Vancouver', cuisine: 'Mexican/Surf', status: 'contacted', followUpDate: '2026-05-17', notes: 'Popular chain. Approach corporate for multi-location deal.', avgMonthlyOrders: 900, dateAdded: '2026-05-05' },
  { id: 'lat3', name: 'El Camino', ownerName: 'Owner', phone: '(604) 709-0072', email: 'info@elcaminovancouver.com', address: '3250 Main St, Main Street', cuisine: 'Latin American', status: 'contacted', followUpDate: '2026-05-19', notes: 'Trendy Latin spot on Main St.', avgMonthlyOrders: 650, dateAdded: '2026-05-05' },
  { id: 'lat4', name: 'Chipotle Vancouver', ownerName: 'GM', phone: '(604) 620-0090', email: 'vancouver@chipotle.com', address: '1032 Alberni St, Downtown', cuisine: 'Mexican', status: 'contacted', followUpDate: '2026-05-18', notes: 'High volume. Pitch exclusivity window vs competitors.', avgMonthlyOrders: 1400, dateAdded: '2026-05-05' },
  { id: 'pet1', name: 'Global Pet Foods Yaletown', ownerName: 'Owner', phone: '(604) 669-5551', email: 'yaletown@globalpetfoods.com', address: '1095 Homer St, Yaletown', cuisine: 'Pet Store', status: 'contacted', followUpDate: '2026-05-22', notes: 'Dog owners in Yaletown = high disposable income. Same-day delivery pitch.', avgMonthlyOrders: 400, dateAdded: '2026-05-05' },
  { id: 'pet2', name: 'Tisol Pet Nutrition', ownerName: 'Owner', phone: '(604) 875-8801', email: 'info@tisol.ca', address: '2476 Kingsway, Vancouver', cuisine: 'Pet Store', status: 'contacted', followUpDate: '2026-05-23', notes: 'Local chain. Go for multi-store deal.', avgMonthlyOrders: 500, dateAdded: '2026-05-05' },
  { id: 'pet3', name: 'Pet Valu Olympic Village', ownerName: 'Manager', phone: '(604) 879-0044', email: 'olympicvillage@petvalu.com', address: '180 W 2nd Ave, Olympic Village', cuisine: 'Pet Store', status: 'contacted', followUpDate: '2026-05-25', notes: 'Right in our core zone. Olympic Village has tons of dog owners.', avgMonthlyOrders: 450, dateAdded: '2026-05-05' },
];

const SC = { contacted: { label: 'Contacted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' }, meeting_booked: { label: 'Meeting Booked', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' }, signed: { label: 'Signed', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30', dot: 'bg-teal-400' }, declined: { label: 'Declined', color: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-400' } };

const SCRIPTS = [
  { id: 1, title: 'The Opening Line', tag: 'At the door', color: 'from-teal-600 to-teal-800', content: `"Hi, is the owner or manager available? I'm not here to sell you anything — I just want to show you something on my phone that's making Vancouver restaurants an extra $1,000 a month. Takes 2 minutes."` },
  { id: 2, title: 'The Core Pitch', tag: 'When they say yes', color: 'from-violet-600 to-violet-800', content: `"My name is Yolanda. I'm the Business Developer for Boufet. DoorDash charges you 30% commission. On Boufet, you pay 20%. On $100 order, that's $10 extra in your pocket. 30 orders a day = $9,000 extra per month. First 30 days are FREE. Live in 48 hours."` },
  { id: 3, title: 'Already on DoorDash', tag: 'Objection handler', color: 'from-orange-600 to-orange-800', content: `"Perfect. Keep DoorDash. Add us as a second channel. More orders, lower fees, zero risk. You are literally leaving money on the table by not being on Boufet."` },
  { id: 4, title: 'Too Busy Right Now', tag: 'Objection handler', color: 'from-rose-600 to-rose-800', content: `"The restaurants that sign now lock in our lowest commission rate. In 6 months when we have 10,000 users in this neighbourhood, you'll be the restaurant they already know. The ones who wait pay more and start later."` },
  { id: 5, title: 'Need to Think About It', tag: 'Objection handler', color: 'from-slate-600 to-slate-800', content: `"Totally fair. I'll send you a one-page breakdown today and follow up in exactly 3 days. If it's still a no, I'll never bother you again. Deal?"` },
  { id: 6, title: 'The Closing Line', tag: 'Always end with this', color: 'from-emerald-600 to-emerald-800', content: `"I'm signing restaurants in this neighbourhood this week. The ones on Boufet first are the ones their neighbours order from first. I'd love that to be you. What do you say?"` },
];

const Calc = () => {
  const [orders, setOrders] = useState(30);
  const [avg, setAvg] = useState(45);
  const gmv = orders * avg * 30;
  const saved = gmv * 0.10;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-6 text-white">Live Savings Calculator</h3>
      <div className="space-y-5 mb-6">
        <div><div className="flex justify-between mb-2"><span className="text-sm text-gray-400">Orders per day</span><span className="font-bold text-teal-400">{orders}</span></div><input type="range" min={5} max={200} value={orders} onChange={e => setOrders(+e.target.value)} className="w-full accent-teal-500" /></div>
        <div><div className="flex justify-between mb-2"><span className="text-sm text-gray-400">Average order value</span><span className="font-bold text-teal-400">${avg}</span></div><input type="range" min={15} max={150} value={avg} onChange={e => setAvg(+e.target.value)} className="w-full accent-teal-500" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 text-center"><p className="text-xs text-red-400 mb-1">DoorDash keeps (30%)</p><p className="font-bold text-red-400 text-xl">-${(gmv*0.30).toLocaleString()}/mo</p></div>
        <div className="bg-teal-950/50 border border-teal-900/50 rounded-xl p-4 text-center"><p className="text-xs text-teal-400 mb-1">Boufet keeps (20%)</p><p className="font-bold text-teal-400 text-xl">-${(gmv*0.20).toLocaleString()}/mo</p></div>
      </div>
      <div className="bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border border-teal-700/50 rounded-2xl p-5 text-center">
        <p className="text-teal-300 text-sm mb-1">This restaurant saves with Boufet</p>
        <p className="text-4xl font-bold text-teal-400">${saved.toLocaleString()}</p>
        <p className="text-teal-300 text-sm mt-1">per month · ${(saved*12).toLocaleString()} per year</p>
      </div>
    </div>
  );
};

const INVITE_CODE = 'BoufetTeam2026';

const getTeamAccounts = () => {
  try { return JSON.parse(localStorage.getItem('boufet_team') || '[]'); } catch { return []; }
};

const saveTeamAccounts = (accounts: any[]) => {
  localStorage.setItem('boufet_team', JSON.stringify(accounts));
};

// Seed Yolanda's account if not exists
const seedYolanda = () => {
  const accounts = getTeamAccounts();
  if (!accounts.find((a: any) => a.email === 'yolandacantusa@gmail.com')) {
    saveTeamAccounts([...accounts, { email: 'yolandacantusa@gmail.com', password: 'Boufet2026!', name: 'Yolanda Cantu', role: 'Business Developer' }]);
  }
};
seedYolanda();

const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('');
  const [role, setRole] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);

  const attempt = () => {
    const accounts = getTeamAccounts();
    const found = accounts.find((a: any) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass);
    if (found) { onLogin(found.name); }
    else { setErr('Incorrect email or password.'); }
  };

  const register = () => {
    if (invite !== INVITE_CODE) { setErr('Invalid invite code. Ask Jose for the team invite code.'); return; }
    if (!name || !email || !pass || !role) { setErr('Please fill in all fields.'); return; }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    const accounts = getTeamAccounts();
    if (accounts.find((a: any) => a.email.toLowerCase() === email.trim().toLowerCase())) { setErr('An account with this email already exists.'); return; }
    saveTeamAccounts([...accounts, { email: email.trim().toLowerCase(), password: pass, name, role }]);
    onLogin(name);
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4">B</div>
          <h1 className="text-2xl font-bold text-white">Boufet Business Hub</h1>
          <p className="text-gray-400 text-sm mt-1">{mode === 'login' ? 'Team Login' : 'Create Team Account'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          {mode === 'register' && (
            <>
              <div><label className="text-xs text-gray-400 mb-1 block">Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Peter Smith" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Your Role</label><input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Project Manager" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" /></div>
            </>
          )}
          <div><label className="text-xs text-gray-400 mb-1 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && (mode==='login'?attempt():register())} placeholder="your@email.com" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Password</label>
            <div className="relative"><input type={show?'text':'password'} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && (mode==='login'?attempt():register())} placeholder="Password" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 pr-16" /><button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">{show?'Hide':'Show'}</button></div>
          </div>
          {mode === 'register' && (
            <div><label className="text-xs text-gray-400 mb-1 block">Team Invite Code</label><input value={invite} onChange={e => setInvite(e.target.value)} placeholder="Ask Jose for the invite code" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" /></div>
          )}
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button onClick={mode==='login'?attempt:register} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors">
            {mode==='login' ? 'Sign In' : 'Create Account'}
          </button>
          <button onClick={() => { setMode(mode==='login'?'register':'login'); setErr(''); }} className="w-full py-2 text-sm text-teal-400 hover:text-teal-300">
            {mode==='login' ? 'New team member? Create account →' : '← Back to login'}
          </button>
          <p className="text-center text-xs text-gray-600">Boufet Internal — Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export const YolandaDashboard = () => {
  const [authed, setAuthed] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [tab, setTab] = useState<'kpi'|'pipeline'|'scripts'|'calculator'|'contacts'>('kpi');
  const [rests, setRests] = useState<Restaurant[]>(DATA);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PipelineStatus|'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [nr, setNr] = useState<Partial<Restaurant>>({ status: 'contacted' });

  if (!authed) return <LoginScreen onLogin={(n) => { setAuthed(true); setMemberName(n); }} />;

  const signed = rests.filter(r => r.status === 'signed');
  const meetings = rests.filter(r => r.status === 'meeting_booked');
  const commission = signed.reduce((a, r) => a + r.avgMonthlyOrders * 45 * 0.20 * 0.05, 0);
  const filtered = rests.filter(r => (filter==='all'||r.status===filter) && (r.name.toLowerCase().includes(search.toLowerCase())||r.ownerName.toLowerCase().includes(search.toLowerCase())));

  const add = () => {
    if (!nr.name || !nr.ownerName) return;
    setRests([{ id: Date.now().toString(), name: nr.name!, ownerName: nr.ownerName!, phone: nr.phone||'', email: nr.email||'', address: nr.address||'', cuisine: nr.cuisine||'', status: nr.status as PipelineStatus||'contacted', followUpDate: nr.followUpDate||'', notes: nr.notes||'', avgMonthlyOrders: nr.avgMonthlyOrders||500, dateAdded: new Date().toISOString().split('T')[0] }, ...rests]);
    setNr({ status: 'contacted' }); setShowAdd(false);
  };

  const TABS = [{id:'kpi',label:'KPIs',icon:BarChart2},{id:'pipeline',label:'Pipeline',icon:TrendingUp},{id:'scripts',label:'Scripts',icon:FileText},{id:'calculator',label:'Calculator',icon:Calculator},{id:'contacts',label:'Contacts',icon:Users}];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg">B</div><div><h1 className="font-bold text-lg">Boufet Business Hub</h1><p className="text-xs text-gray-400">{memberName} — Boufet Team</p></div></div>
          <div className="flex items-center gap-3"><div className="text-right"><p className="text-xs text-gray-400">Commission This Month</p><p className="font-bold text-teal-400">${commission.toFixed(0)}</p></div><div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold">{memberName.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()}</div></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap ${tab===t.id?'bg-teal-600 text-white':'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'}`}><t.icon className="w-4 h-4"/>{t.label}</button>)}
        </div>

        {tab==='kpi' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{l:'Signed',v:signed.length,c:'text-teal-400',I:CheckCircle},{l:'Meetings',v:meetings.length,c:'text-yellow-400',I:Calendar},{l:'Total Pipeline',v:rests.length,c:'text-blue-400',I:Phone},{l:'Commission',v:`$${commission.toFixed(0)}`,c:'text-emerald-400',I:DollarSign}].map(({l,v,c,I})=>(
              <div key={l} className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><div className="flex justify-between mb-3"><p className="text-xs text-gray-400">{l}</p><I className={`w-4 h-4 ${c}`}/></div><p className={`text-3xl font-bold ${c}`}>{v}</p></div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-teal-900/40 to-gray-900 border border-teal-800/40 rounded-2xl p-6">
            <div className="flex justify-between mb-4"><div><h3 className="font-bold text-lg">Month 1 Target — Yaletown + Olympic Village</h3><p className="text-gray-400 text-sm">Sign 10 restaurants by May 31, 2026</p></div><div className="text-right"><p className="text-3xl font-bold text-teal-400">{signed.length}/10</p><p className="text-xs text-gray-400">{10-signed.length} remaining</p></div></div>
            <div className="w-full bg-gray-800 rounded-full h-3"><div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-3 rounded-full" style={{width:`${Math.min(100,(signed.length/10)*100)}%`}}/></div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-400"/>Upcoming Follow-Ups</h3>
            <div className="space-y-3">{rests.filter(r=>r.followUpDate&&r.status!=='signed'&&r.status!=='declined').sort((a,b)=>a.followUpDate.localeCompare(b.followUpDate)).slice(0,5).map(r=>(
              <div key={r.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-xl"><div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-400">{r.ownerName} · {r.followUpDate}</p></div><span className={`text-xs px-2 py-1 rounded-full border ${SC[r.status].color}`}>{SC[r.status].label}</span></div>
            ))}</div>
          </div>
        </motion.div>}

        {tab==='pipeline' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/></div>
            <div className="flex gap-2 overflow-x-auto">{(['all','contacted','meeting_booked','signed','declined'] as const).map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${filter===s?'bg-teal-600 text-white':'bg-gray-900 border border-gray-800 text-gray-400'}`}>{s==='all'?'All':SC[s].label}</button>)}</div>
            <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 rounded-xl font-medium text-sm whitespace-nowrap"><Plus className="w-4 h-4"/>Add</button>
          </div>
          <div className="space-y-3">{filtered.map(r=>(
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between mb-2"><div><div className="flex items-center gap-2 mb-1"><h3 className="font-bold">{r.name}</h3><span className={`text-xs px-2 py-0.5 rounded-full border ${SC[r.status].color}`}>{SC[r.status].label}</span></div><p className="text-sm text-gray-400">{r.ownerName} · {r.cuisine}</p><p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/>{r.address}</p></div><div className="text-right"><p className="font-bold text-teal-400">${(r.avgMonthlyOrders*45*0.20).toLocaleString()}</p><p className="text-xs text-gray-500">Boufet/mo</p></div></div>
              {r.notes && <p className="text-xs text-gray-400 bg-gray-800 rounded-xl px-3 py-2 mb-3 italic">"{r.notes}"</p>}
              <div className="flex items-center justify-between">
                <div className="flex gap-2"><a href={`tel:${r.phone}`} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700"><Phone className="w-3 h-3"/>Call</a><a href={`mailto:${r.email}`} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700"><Mail className="w-3 h-3"/>Email</a>{r.followUpDate&&<span className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-yellow-400"><Clock className="w-3 h-3"/>{r.followUpDate}</span>}</div>
                <div className="flex gap-1 items-center">{(['contacted','meeting_booked','signed','declined'] as PipelineStatus[]).map(s=><button key={s} onClick={()=>setRests(rests.map(x=>x.id===r.id?{...x,status:s}:x))} className={`w-3 h-3 rounded-full ${r.status===s?SC[s].dot:'bg-gray-700 hover:bg-gray-500'}`} title={SC[s].label}/>)}<button onClick={()=>setRests(rests.filter(x=>x.id!==r.id))} className="ml-2 p-1 text-gray-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button></div>
              </div>
            </div>
          ))}</div>
        </motion.div>}

        {tab==='scripts' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <p className="text-gray-400 text-sm mb-5">Memorize these. Use word for word until you close 20 restaurants.</p>
          <div className="grid md:grid-cols-2 gap-4">{SCRIPTS.map(s=>(
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className={`bg-gradient-to-r ${s.color} p-4`}><span className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{s.tag}</span><h3 className="font-bold text-white mt-2">{s.title}</h3></div>
              <div className="p-4"><p className="text-sm text-gray-300 italic leading-relaxed">{s.content}</p><button onClick={()=>navigator.clipboard?.writeText(s.content)} className="mt-3 text-xs text-teal-400 hover:text-teal-300">Copy →</button></div>
            </div>
          ))}</div>
          <div className="mt-6 bg-gradient-to-r from-teal-900/40 to-gray-900 border border-teal-800/40 rounded-2xl p-5"><h3 className="font-bold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/>Customer One-Liner</h3><p className="text-gray-300 italic">"Boufet charges you less, pays drivers more, and was built right here in Vancouver — not in a boardroom in San Francisco."</p></div>
        </motion.div>}

        {tab==='calculator' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><p className="text-gray-400 text-sm mb-5">Show live on your phone while pitching.</p><Calc/></motion.div>}

        {tab==='contacts' && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{rests.map(r=>(
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex justify-between mb-3"><div><h3 className="font-bold">{r.name}</h3><p className="text-sm text-gray-400">{r.cuisine}</p></div><span className={`text-xs px-2 py-0.5 rounded-full border ${SC[r.status].color}`}>{SC[r.status].label}</span></div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-gray-500"/><span className="text-gray-300">{r.ownerName}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-500"/><a href={`tel:${r.phone}`} className="text-teal-400 hover:underline">{r.phone}</a></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-500"/><a href={`mailto:${r.email}`} className="text-teal-400 hover:underline text-xs truncate">{r.email}</a></div>
                <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0"/><span className="text-gray-400 text-xs">{r.address}</span></div>
              </div>
              {r.notes&&<p className="mt-3 text-xs text-gray-500 border-t border-gray-800 pt-3 italic">"{r.notes}"</p>}
            </div>
          ))}</div>
        </motion.div>}
      </div>

      <AnimatePresence>{showAdd&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-5"><h3 className="font-bold text-lg">Add to Pipeline</h3><button onClick={()=>setShowAdd(false)}><X className="w-5 h-5 text-gray-400"/></button></div>
            <div className="space-y-3">
              {[['Restaurant Name','name','text'],['Owner Name','ownerName','text'],['Phone','phone','tel'],['Email','email','email'],['Address','address','text'],['Cuisine','cuisine','text'],['Avg Monthly Orders','avgMonthlyOrders','number'],['Follow-up Date','followUpDate','date']].map(([l,f,t])=>(
                <div key={f as string}><label className="text-xs text-gray-400 mb-1 block">{l as string}</label><input type={t as string} value={(nr as any)[f as string]||''} onChange={e=>setNr(p=>({...p,[f as string]:t==='number'?+e.target.value:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/></div>
              ))}
              <div><label className="text-xs text-gray-400 mb-1 block">Status</label><select value={nr.status||'contacted'} onChange={e=>setNr(p=>({...p,status:e.target.value as PipelineStatus}))} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"><option value="contacted">Contacted</option><option value="meeting_booked">Meeting Booked</option><option value="signed">Signed</option><option value="declined">Declined</option></select></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Notes</label><textarea value={nr.notes||''} onChange={e=>setNr(p=>({...p,notes:e.target.value}))} rows={3} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"/></div>
            </div>
            <div className="flex gap-3 mt-5"><button onClick={()=>setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium">Cancel</button><button onClick={add} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Add</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

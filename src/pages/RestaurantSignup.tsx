import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, MapPin, ChevronRight, Check, Utensils, TrendingDown, DollarSign, Clock } from 'lucide-react';

export const RestaurantSignup = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '', ownerName: '', email: '', phone: '',
    address: '', cuisine: '', avgMonthlyOrders: '', message: ''
  });

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('https://api.boufet.com/api/restaurant/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Application Received!</h1>
        <p className="text-muted-foreground mb-2">Thank you, <strong>{form.ownerName}</strong>. Our team will contact you within 24 hours to get <strong>{form.restaurantName}</strong> live on Boufet.</p>
        <p className="text-sm text-muted-foreground mt-4">Check your email at <strong>{form.email}</strong> for confirmation.</p>
        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/20">
          <p className="text-sm font-medium text-primary">What happens next?</p>
          <div className="mt-3 space-y-2 text-left">
            {['Our team calls you within 24 hours', 'We set up your menu on Boufet (free)', 'You go live within 48 hours', 'First 30 days — zero commission'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">{i+1}</div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">Partner with Boufet</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Grow your restaurant.<br />Keep more of what you earn.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">We charge 20% commission. DoorDash charges 30%. On $10,000 in orders, that's $1,000 more in your pocket — every single month.</p>
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: DollarSign, title: '20% Commission', sub: 'DoorDash charges 30%', color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
            { icon: Clock, title: 'Live in 48 Hours', sub: 'Free menu setup included', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' },
            { icon: TrendingDown, title: '30 Days Free', sub: 'Zero commission to start', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' },
          ].map(({ icon: Icon, title, sub, color, bg }) => (
            <div key={title} className={`${bg} border rounded-2xl p-5 text-center`}>
              <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
              <p className={`font-bold text-lg ${color}`}>{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-1">Apply to Join Boufet</h2>
            <p className="text-muted-foreground text-sm mb-8">Fill out the form below and our team will reach out within 24 hours.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Restaurant Name *</label>
                  <input value={form.restaurantName} onChange={e => update('restaurantName', e.target.value)} placeholder="e.g. Mama's Pizza" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Owner / Manager Name *</label>
                  <input value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="e.g. Maria Garcia" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="owner@restaurant.com" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(604) 000-0000" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Restaurant Address *</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="1234 Main St, Vancouver, BC" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Cuisine Type</label>
                  <select value={form.cuisine} onChange={e => update('cuisine', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="">Select cuisine</option>
                    {['Italian','Japanese','Chinese','Mexican','Indian','Canadian','American','Thai','Vietnamese','Greek','Mediterranean','Pub/Bar','Pizza','Sushi','Vegan/Vegetarian','Seafood','Steakhouse','Bakery/Cafe','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Avg Monthly Orders</label>
                  <select value={form.avgMonthlyOrders} onChange={e => update('avgMonthlyOrders', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="">Select range</option>
                    <option value="under_200">Under 200</option>
                    <option value="200_500">200 – 500</option>
                    <option value="500_1000">500 – 1,000</option>
                    <option value="1000_plus">1,000+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Anything else? (optional)</label>
                <textarea value={form.message} onChange={e => update('message', e.target.value)} placeholder="Current platforms, questions, special requirements..." rows={3} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.restaurantName || !form.ownerName || !form.email || !form.phone || !form.address || loading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : <><span>Apply to Partner with Boufet</span><ChevronRight className="w-5 h-5" /></>}
              </button>
              <p className="text-center text-xs text-muted-foreground">Our team will contact you within 24 hours. First 30 days are commission-free.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

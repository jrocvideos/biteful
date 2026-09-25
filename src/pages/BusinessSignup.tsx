import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Clock, CreditCard, ChevronRight, Check, Star } from 'lucide-react';

export const BusinessSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    teamSize: '', frequency: '', budget: '', address: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      await fetch('https://api.boufet.com/api/business/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Request received!</h1>
        <p className="text-muted-foreground mb-8">A Boufet Business account manager will contact you within 2 business hours.</p>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors">Back to Home</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-teal-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Boufet for Business</h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto">Feed your team from the best local restaurants in Vancouver. Centralized billing, easy ordering, happy employees.</p>
        </div>
      </div>

      <div className="bg-teal-700 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div><div className="text-2xl font-bold">20%</div><div className="text-teal-200 text-sm">lower fees</div></div>
          <div><div className="text-2xl font-bold">$0</div><div className="text-teal-200 text-sm">setup fee</div></div>
          <div><div className="text-2xl font-bold">2hr</div><div className="text-teal-200 text-sm">account setup</div></div>
        </div>
      </div>

      <div className="py-12 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why companies choose Boufet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: CreditCard, title: "Centralized Billing", desc: "One monthly invoice for all team orders. No expense reports." },
              { icon: Users, title: "Team Ordering", desc: "Each employee orders what they want. You set the budget per person." },
              { icon: Clock, title: "Scheduled Deliveries", desc: "Set recurring lunch or dinner orders. Everything arrives together." },
              { icon: Star, title: "Dedicated Support", desc: "Priority support line and dedicated account manager for teams of 20+." },
            ].map((b, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <b.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{b.title}</h3>
                  <p className="text-muted-foreground text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Simple pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", size: "2-10 employees", price: "$0", perks: ["Central billing", "Standard delivery", "Email support"], popular: false },
              { name: "Team", size: "11-50 employees", price: "$49/mo", perks: ["Everything in Starter", "Scheduled deliveries", "Budget controls", "Priority support"], popular: true },
              { name: "Enterprise", size: "50+ employees", price: "Custom", perks: ["Everything in Team", "Dedicated account manager", "Custom integrations", "SLA guarantee"], popular: false },
            ].map((plan, i) => (
              <div key={i} className={"rounded-2xl p-6 border-2 " + (plan.popular ? "border-teal-600 bg-teal-50" : "border-border bg-card")}>
                {plan.popular && <div className="text-teal-600 text-sm font-bold mb-2">MOST POPULAR</div>}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.size}</p>
                <div className="text-3xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-2">
                  {plan.perks.map((perk, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-teal-600 shrink-0" />{perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12 px-4 bg-muted/30">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">Get started today</h2>
          <p className="text-muted-foreground text-center mb-8">We will have your account ready in 2 hours</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className={"h-2 rounded-full transition-all " + (s === step ? "w-8 bg-teal-600" : s < step ? "w-4 bg-teal-400" : "w-4 bg-muted")} />
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <input value={form.companyName} onChange={e => update("companyName", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <input value={form.contactName} onChange={e => update("contactName", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Work Email</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="jane@company.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="604-555-0100" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Office Address in Vancouver</label>
                <input value={form.address} onChange={e => update("address", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="1055 West Georgia St, Vancouver" />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.companyName || !form.email || !form.contactName} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Team Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {["2-10", "11-25", "26-50", "50+"].map(size => (
                    <button key={size} onClick={() => update("teamSize", size)} className={"py-3 rounded-xl font-medium transition-colors " + (form.teamSize === size ? "bg-teal-600 text-white" : "bg-card border border-border text-muted-foreground hover:bg-muted")}>
                      {size} people
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">How often do you need delivery?</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Daily lunch", "Daily dinner", "Weekly", "For events"].map(freq => (
                    <button key={freq} onClick={() => update("frequency", freq)} className={"py-3 rounded-xl font-medium transition-colors text-sm " + (form.frequency === freq ? "bg-teal-600 text-white" : "bg-card border border-border text-muted-foreground hover:bg-muted")}>
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Budget per person per meal</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Under $15", "$15-25", "$25+"].map(b => (
                    <button key={b} onClick={() => update("budget", b)} className={"py-3 rounded-xl font-medium transition-colors text-sm " + (form.budget === b ? "bg-teal-600 text-white" : "bg-card border border-border text-muted-foreground hover:bg-muted")}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Anything else we should know?</label>
                <textarea value={form.message} onChange={e => update("message", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none" placeholder="Dietary restrictions, preferred cuisines, special requirements..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-colors">Back</button>
                <button onClick={handleSubmit} disabled={!form.teamSize || !form.frequency} className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Get Started</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

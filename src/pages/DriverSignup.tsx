import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, DollarSign, Clock, Shield, ChevronRight, Check } from 'lucide-react';

export const DriverSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    vehicle: 'car', license: '', city: 'Vancouver',
    availability: [] as string[], agreeTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleAvailability = (slot: string) =>
    setForm(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot]
    }));

  const handleSubmit = async () => {
    try {
      await fetch('https://api.boufet.com/api/driver/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">You are on the list!</h1>
        <p className="text-muted-foreground mb-8">We will review your application and reach out within 24 hours. Welcome to the Boufet driver community.</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors">
          Back to Home
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-teal-600 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Drive with Boufet</h1>
          <p className="text-teal-100 text-lg">Earn on your schedule. Keep more of what you make.</p>
        </div>
      </div>

      <div className="bg-teal-700 text-white py-6 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div><div className="text-2xl font-bold">$18-25</div><div className="text-teal-200 text-sm">avg/hour</div></div>
          <div><div className="text-2xl font-bold">100%</div><div className="text-teal-200 text-sm">tips yours</div></div>
          <div><div className="text-2xl font-bold">Daily</div><div className="text-teal-200 text-sm">payouts</div></div>
        </div>
      </div>

      <div className="py-12 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: DollarSign, title: 'Earn More', desc: 'Higher base pay than competitors. Keep 100% of tips.' },
            { icon: Clock, title: 'Your Schedule', desc: 'Go online when you want. No minimum hours.' },
            { icon: Shield, title: 'Full Support', desc: '24/7 driver support. Insurance coverage while on delivery.' },
          ].map((b, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">Apply in 2 minutes</h2>
          <p className="text-muted-foreground text-center mb-8">We will be in touch within 24 hours</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className={"h-2 rounded-full transition-all " + (s === step ? 'w-8 bg-teal-600' : s < step ? 'w-4 bg-teal-400' : 'w-4 bg-muted')} />
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  <input value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Jose" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  <input value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Smith" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="you@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="604-555-0100" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['car', 'bike', 'scooter'].map(v => (
                    <button key={v} onClick={() => update('vehicle', v)}
                      className={"py-3 rounded-xl font-medium capitalize transition-colors " + (form.vehicle === v ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.firstName || !form.email || !form.phone}
                className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Driver License Number</label>
                <input value={form.license} onChange={e => update('license', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="BC1234567" />
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">Availability</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Weekday Mornings', 'Weekday Evenings', 'Weekend Days', 'Weekend Evenings'].map(slot => (
                    <button key={slot} onClick={() => toggleAvailability(slot)}
                      className={"py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left " + (form.availability.includes(slot) ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {form.availability.includes(slot) && <Check className="w-4 h-4 inline mr-2" />}
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                <input type="checkbox" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)}
                  className="mt-1 accent-teal-600" />
                <p className="text-sm text-muted-foreground">I agree to the Boufet Driver Terms of Service and confirm I have a valid driver license and vehicle insurance.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-6 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-colors">
                  Back
                </button>
                <button onClick={handleSubmit} disabled={!form.agreeTerms || !form.license}
                  className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Submit Application
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

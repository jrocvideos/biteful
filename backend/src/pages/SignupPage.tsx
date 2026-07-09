import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.email || !form.password) return setError('Please fill in all required fields');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await signup({ ...form, role: 'customer' });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📧</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Check your email!</h1>
        <p className="text-muted-foreground mb-2">We sent a confirmation to</p>
        <p className="font-bold text-teal-600 mb-6">{form.email}</p>
        <p className="text-muted-foreground text-sm mb-8">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-colors">
          Go to Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-muted-foreground mt-2">Join Boufet and order from the best restaurants</p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Name</label>
              <input value={form.first_name} onChange={e => update('first_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Jose" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Last Name</label>
              <input value={form.last_name} onChange={e => update('last_name', e.target.value)}
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
            <label className="text-sm font-medium mb-2 block">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password}
                onChange={e => update('password', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
                placeholder="Min 6 characters" />
              <button onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

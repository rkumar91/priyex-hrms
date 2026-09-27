import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@priyex.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err?.message || err || 'Invalid credentials or connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glowing Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/25 mb-4">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Priyex HRMS</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Human Resource Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@priyex.com"
                className="w-full bg-slate-50 text-slate-900 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 text-slate-900 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 bg-slate-50 text-emerald-600 focus:ring-emerald-500" />
              <span>Remember this device</span>
            </label>
            <a href="#forgot" className="text-emerald-600 hover:underline font-medium">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-5 border-t border-slate-200 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Login Profiles</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">1-Click AutoFill</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setEmail('admin@priyex.com'); setPassword('Admin@123'); setError(null); }}
              className="px-2.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-center transition cursor-pointer font-semibold shadow-xs"
            >
              <div className="text-[11px] font-bold text-slate-900">Admin</div>
              <div className="text-[9px] text-emerald-700">SUPER_ADMIN</div>
            </button>

            <button
              type="button"
              onClick={() => { setEmail('hr@priyex.com'); setPassword('Admin@123'); setError(null); }}
              className="px-2.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-center transition cursor-pointer font-semibold shadow-xs"
            >
              <div className="text-[11px] font-bold text-slate-900">HR Manager</div>
              <div className="text-[9px] text-teal-700">HR_ADMIN</div>
            </button>

            <button
              type="button"
              onClick={() => { setEmail('employee@priyex.com'); setPassword('Admin@123'); setError(null); }}
              className="px-2.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-center transition cursor-pointer font-semibold shadow-xs"
            >
              <div className="text-[11px] font-bold text-slate-900">Employee</div>
              <div className="text-[9px] text-cyan-700">EMPLOYEE</div>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-1 border-t border-slate-200/80 font-mono">
            Default Password: <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Admin@123</span>
          </div>
        </div>
      </div>
    </div>
  );
};


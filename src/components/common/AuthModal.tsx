import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, ArrowRight, Check, AlertCircle, Database, Shield } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { supabaseSignIn, supabaseSignUp, supabaseSignOut } from '../../services/supabaseService';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, currentUser, setCurrentUser, isSupabaseOnline } = useStore();
  const [method, setMethod] = useState<'email' | 'otp'>('email');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('4291');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabaseSignUp(email, password, name, phone);
        if (error) throw error;

        if (data?.user && !data?.session) {
          setSuccessMessage('Check your email for confirmation link to complete registration.');
        } else {
          setCurrentUser({
            name: name || email.split('@')[0],
            email: email,
            phone: phone
          });
          setIsAuthOpen(false);
        }
      } else {
        const { data, error } = await supabaseSignIn(email, password);
        if (error) throw error;

        if (data?.user) {
          setCurrentUser({
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            email: data.user.email || email,
            phone: data.user.user_metadata?.phone || ''
          });
          setIsAuthOpen(false);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit')) {
        setErrorMessage(
          'Supabase email limit exceeded (free tier sends max 3 emails/hr). To test signups immediately without waiting, disable "Confirm email" in your Supabase Auth settings.'
        );
      } else {
        setErrorMessage(msg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      name: 'Rohan Mehra',
      email: email || 'rohan.mehra@gadgethouse.in',
      phone: phone
    });
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setCurrentUser(null);
      setIsAuthOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={() => setIsAuthOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl text-slate-100 z-10 p-6 sm:p-8">
          
          <button
            onClick={() => setIsAuthOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-surface"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Connection status badge */}
          <div className="flex items-center gap-1.5 mb-4 text-[11px] font-medium">
            {isSupabaseOnline ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Database className="w-3 h-3" />
                <span>Supabase Live Auth</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Shield className="w-3 h-3" />
                <span>Local / Mock Auth Mode</span>
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-brand/20 text-brand flex items-center justify-center mx-auto border border-brand/30">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
                <p className="text-xs text-slate-400">{currentUser.phone}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold transition border border-red-500/30 disabled:opacity-50"
                >
                  {isLoading ? 'Signing out...' : 'Log Out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand/15 text-brand flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">Welcome to Gadget House</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access saved phone models, orders & exclusive accessories
                </p>
              </div>

              {/* Login Method Tabs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold bg-[#111724] p-1 rounded-xl">
                <button
                  onClick={() => { setMethod('email'); setErrorMessage(null); }}
                  className={`py-2 rounded-lg transition ${
                    method === 'email' ? 'bg-brand text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  onClick={() => { setMethod('otp'); setOtpSent(false); setErrorMessage(null); }}
                  className={`py-2 rounded-lg transition ${
                    method === 'otp' ? 'bg-brand text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mobile OTP
                </button>
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  {authMode === 'signup' && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                        className="px-2.5 py-1 bg-brand text-white rounded-lg text-[11px] font-bold hover:bg-brand-hover transition"
                      >
                        Try Sign In Instead
                      </button>
                    </div>
                  )}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {method === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#111723] text-xs text-white p-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111723] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111723] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-400">
                    {authMode === 'signin' ? (
                      <span>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
                          className="text-brand font-bold hover:underline"
                        >
                          Sign Up
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                          className="text-brand font-bold hover:underline"
                        >
                          Sign In
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-dark-border/40 space-y-2 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Quick Demo Switch
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUser({
                            name: 'Vikram Sethi (Owner)',
                            email: 'owner@gadgethouse.in',
                            phone: '+91 98765 43210',
                            role: 'Owner'
                          });
                          setIsAuthOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand/15 text-brand border border-brand/30 hover:bg-brand/25 text-[11px] font-bold transition"
                      >
                        ⚡ Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUser({
                            name: 'Amit Sen (Cashier)',
                            email: 'cashier@gadgethouse.in',
                            phone: '+91 98765 43210',
                            role: 'Cashier'
                          });
                          setIsAuthOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-[11px] font-bold transition"
                      >
                        ⚡ Cashier (POS Only)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUser({
                            name: 'Rohan Mehra',
                            email: 'customer@gadgethouse.in',
                            phone: '+91 98765 43210',
                            role: 'Customer'
                          });
                          setIsAuthOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 text-[11px] font-medium transition"
                      >
                        Shopper
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {method === 'otp' && (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">
                        Enter Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#111723] text-sm text-white pl-10 pr-3 py-2.5 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <span>Get 4-Digit OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">
                        Enter 4-Digit OTP sent to {phone}
                      </label>
                      <input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="w-full bg-[#111723] text-center text-lg tracking-widest font-mono text-white py-2.5 rounded-xl border border-brand focus:outline-none"
                        maxLength={4}
                      />
                      <span className="text-[10px] text-slate-500 block text-center mt-1">
                        Use demo code: <strong className="text-brand">4291</strong>
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify & Continue</span>
                    </button>
                  </form>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

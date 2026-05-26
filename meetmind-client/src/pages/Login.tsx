import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { normalizeUser, getPostAuthRedirect } from '../utils/auth';
import { BrainCircuit, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { user, authReady, setUser, addToast } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  if (authReady && user) {
    return <Navigate to={getPostAuthRedirect(user)} replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);
      const normalized = normalizeUser(response.data.user);
      setUser(normalized);
      navigate(getPostAuthRedirect(normalized));
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-[#070b14] overflow-hidden p-6">
      {/* Background Neon Blurs */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main card */}
      <GlassCard className="w-full max-w-lg p-10 relative z-10 border-white/5 shadow-2xl">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-2">
            <BrainCircuit size={28} className="glow-text-purple" />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-sans tracking-wide">
            Welcome back to <span className="text-brand-400 glow-text-purple">MeetMind</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Enter your credentials to access your productivity suite.
          </p>
        </div>

        {/* Forms */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`
                  w-full 
                  pl-12 
                  pr-4 
                  py-3.5 
                  rounded-xl 
                  bg-white/5 
                  border 
                  ${errors.email ? 'border-rose-500/50' : 'border-white/5'} 
                  text-slate-200 
                  placeholder-slate-500 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-brand-500/20 
                  focus:border-brand-500/30 
                  transition-all
                `}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-400 font-medium pl-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`
                  w-full 
                  pl-12 
                  pr-4 
                  py-3.5 
                  rounded-xl 
                  bg-white/5 
                  border 
                  ${errors.password ? 'border-rose-500/50' : 'border-white/5'} 
                  text-slate-200 
                  placeholder-slate-500 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-brand-500/20 
                  focus:border-brand-500/30 
                  transition-all
                `}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-400 font-medium pl-1">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full 
              py-3.5 
              px-6 
              rounded-xl 
              bg-brand-600 
              hover:bg-brand-500 
              text-white 
              font-semibold 
              font-sans 
              flex 
              items-center 
              justify-center 
              gap-2 
              shadow-lg 
              shadow-brand-500/10 
              hover:shadow-brand-500/20 
              active:scale-[0.98] 
              transition-all 
              disabled:opacity-50 
              disabled:pointer-events-none
            "
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Continue Workspace
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Sign up free
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

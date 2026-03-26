import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FrameSvg from '../../assets/auth/Frame 5.svg';
import AuthSvg from '../../assets/auth/auth.svg';
import { loginSchema } from './schemas/authSchemas';
import { loginUser, persistAuth } from './api/authApi';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/shadcn/form';
import { Input } from '../../components/shadcn/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setApiError('');
    setApiSuccess('');

    try {
      const authData = await loginUser(values);
      persistAuth(authData);
      setApiSuccess('Login successful. Redirecting...');
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      setApiError(error.message || 'Unable to log in right now.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-slate-100">
        
        {/* Background & Hero Images (Kept exactly as requested) */}
        <img src={FrameSvg} alt="frame background" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center mt-10">
          <img src={AuthSvg} alt="auth doctors" className="w-full max-w-[85%] object-contain" />
        </div>

        {/* Subtle Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top Branding */}
        <div className="absolute top-10 left-10 z-20 flex items-center gap-3 text-white">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="text-3xl font-bold tracking-tight">CareLink</span>
        </div>

        {/* Floating Glassmorphic Card 1 */}
        <Motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute left-10 top-[30%] z-20 flex items-center gap-4 rounded-2xl border border-white/20 bg-black/40 px-5 py-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Well qualified doctors</h4>
            <p className="text-xs text-white/70">Treat with utmost care</p>
          </div>
        </Motion.div>

        {/* Floating Glassmorphic Card 2 */}
        <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/20 bg-black/50 px-6 py-4 shadow-2xl backdrop-blur-xl w-max"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Book an appointment</h4>
            <p className="text-xs text-white/70">Call/text/video/inperson</p>
          </div>
        </Motion.div>
      </div>

      {/* RIGHT PANEL: Form Area */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center px-8 py-12 sm:px-12 lg:px-24">
        
        {/* Close/Back Button */}
        <Link to="/" className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="mb-10 flex items-center justify-center gap-2 text-slate-900 lg:hidden">
            <svg className="w-8 h-8 text-[#1649FF]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span className="text-2xl font-bold tracking-tight">CareLink</span>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">
              New to CareLink? <Link to="/auth/register" className="font-semibold text-[#1649FF] hover:underline">Sign up</Link>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}
              {apiSuccess ? <p className="text-sm text-emerald-600">{apiSuccess}</p> : null}

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-2 h-11 w-full rounded-md bg-[#3d9db8] text-sm font-semibold text-white transition hover:bg-[#2f88a1] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </Form>
          
        </Motion.div>
      </div>

    </div>
  );
}
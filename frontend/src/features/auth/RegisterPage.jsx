import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import FrameSvg from '../../assets/auth/Frame 5.svg';
import AuthSvg from '../../assets/auth/auth.svg';
import { registerSchema } from './schemas/authSchemas';
import { registerUser } from './api/authApi';
import { useAuth } from './context/AuthContext';
import { getDashboardRoute } from './utils/roleRouting';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/shadcn/form';
import { Input } from '../../components/shadcn/input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      titles: '',
      role: 'Patient',
    },
  });

  const onSubmit = async (values) => {
    setApiError('');

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      titles: values.titles || null,
      role: values.role,
    };

    try {
      const authData = await registerUser(payload);
      setAuthSession(authData);
      toast.success('Account created', {
        description: 'Welcome to CareLink.',
      });
      setTimeout(() => navigate(getDashboardRoute(authData?.user?.role || authData?.role)), 500);
    } catch (error) {
      const message = error.message || 'Unable to create account right now.';
      setApiError(message);
      toast.error('Registration failed', {
        description: message,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-slate-100">
        
        {/* Background & Hero Images */}
        <img src={FrameSvg} alt="frame background" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center mt-10">
          <img src={AuthSvg} alt="auth doctors" className="w-full max-w-[85%] object-contain" />
        </div>

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top Branding */}
        <div className="absolute top-10 left-10 z-20 flex items-center gap-3 text-white">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="text-3xl font-bold tracking-tight">CareLink</span>
        </div>

        {/* Floating Glassmorphic Card 1 */}
        <motion.div 
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
        </motion.div>

        {/* Floating Glassmorphic Card 2 */}
        <motion.div 
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
        </motion.div>
      </div>

      {/* RIGHT PANEL: Form Area */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center px-8 py-12 sm:px-12 lg:px-24">
        
        {/* Close/Back Button */}
        <Link to="/" className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="mb-10 flex items-center justify-center gap-2 text-slate-900 lg:hidden">
            <svg className="w-8 h-8 text-[#1649FF]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span className="text-2xl font-bold tracking-tight">CareLink</span>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Create an account</h2>
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/auth/login" className="font-semibold text-[#1649FF] hover:underline">Log in</Link>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" autoComplete="given-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" autoComplete="family-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                name="titles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr, Mr, Ms" maxLength={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus-visible:border-[#1649FF] focus-visible:ring-2 focus-visible:ring-[#1649FF]/30"
                      >
                        <option value="Patient">Patient</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Admin">Admin</option>
                      </select>
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
                      <div className="relative">
                        <Input
                          placeholder="Create a password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0112 4.91c5.05 0 9.27 3.11 10.5 7.09a11.65 11.65 0 01-4.12 5.94" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A11.71 11.71 0 001.5 12c.58 1.86 1.8 3.47 3.43 4.68" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Re-enter your password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className="pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A10.94 10.94 0 0112 4.91c5.05 0 9.27 3.11 10.5 7.09a11.65 11.65 0 01-4.12 5.94" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A11.71 11.71 0 001.5 12c.58 1.86 1.8 3.47 3.43 4.68" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-2 h-11 w-full rounded-md bg-[#06b6d4] text-sm font-semibold text-white transition hover:bg-[#1649FF] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </Form>
          
        </motion.div>
      </div>

    </div>
  );
}
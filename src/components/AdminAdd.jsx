import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, ShieldCheck } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const CARD_BG = 'bg-[#3a3d42]/70';

const adminRegisterSchema = z.object({
  firstName: z.string().min(3, 'Minimum 3 characters'),
  emailId: z.string().email({ message: 'Invalid Email' }),
  password: z.string().min(8, 'Password is too weak'),
  role: z.enum(['user', 'admin']),
});

const inputClass =
  'w-full rounded-xl border-none bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50';

function FieldError({ message }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-rose-400">{message}</span>;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className={`rounded-2xl border border-white/10 ${CARD_BG} p-6 shadow-lg backdrop-blur-md`}>
      <div className="mb-5 flex items-center gap-2 text-slate-100">
        <Icon size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AdminAdd() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [savedData, setSavedData] = useState(null);
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: { role: 'user' },
  });

  // Step 1: form → sends OTP
  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await axiosClient.post('/user/admin/register', data);
      setSavedData(data);
      setStep('otp');
    } catch (err) {
      setServerError(err.response?.data || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP → creates user
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError('');
    setLoading(true);
    try {
      await axiosClient.post('/user/admin/register', { ...savedData, otp });
      setStep('success');
    } catch (err) {
      setServerError(err.response?.data || err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    reset({ firstName: '', emailId: '', password: '', role: 'user' });
    setSavedData(null);
    setOtp('');
    setServerError('');
    setStep('form');
  };

  return (
    <div className="min-h-screen w-full bg-[#3a3d42] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Register New User</h1>

        {serverError && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </div>
        )}

        {/* ============ STEP 1: FORM ============ */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <SectionCard icon={UserPlus} title="User Details">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    className={inputClass}
                    placeholder="e.g. Jane"
                  />
                  <FieldError message={errors.firstName?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('emailId')}
                    className={inputClass}
                    placeholder="jane@example.com"
                  />
                  <FieldError message={errors.emailId?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`${inputClass} pr-12`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <FieldError message={errors.password?.message} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Role
                  </label>
                  <select {...register('role')} className={inputClass}>
                    <option value="user" className="text-slate-900">User</option>
                    <option value="admin" className="text-slate-900">Admin</option>
                  </select>
                  <FieldError message={errors.role?.message} />
                </div>
              </div>
            </SectionCard>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-medium text-white transition-colors duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ============ STEP 2: OTP ============ */}
        {step === 'otp' && (
          <form onSubmit={onVerifyOtp} className="space-y-6">
            <SectionCard icon={ShieldCheck} title="Verify OTP">
              <p className="mb-4 text-sm text-slate-300">
                An OTP has been sent to{' '}
                <span className="font-medium text-emerald-300">{savedData?.emailId}</span>.
                It expires in 5 minutes.
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                autoFocus
              />
            </SectionCard>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                  setServerError('');
                }}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-base font-medium text-slate-200 transition-colors duration-200 hover:bg-white/10 disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="flex-2 rounded-xl bg-emerald-600 py-3.5 text-base font-medium text-white transition-colors duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
            </div>
          </form>
        )}

        {/* ============ STEP 3: SUCCESS ============ */}
        {step === 'success' && (
          <SectionCard icon={ShieldCheck} title="User Registered">
            <p className="mb-6 text-sm text-slate-300">
              <span className="font-medium text-slate-100">{savedData?.firstName}</span>{' '}
              has been registered successfully with the role{' '}
              <span className="font-medium capitalize text-emerald-300">
                {savedData?.role}
              </span>
              .
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRegisterAnother}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Register Another
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Back to Admin
              </button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default AdminAdd;
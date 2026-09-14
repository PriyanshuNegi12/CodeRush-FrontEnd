import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

// ---------- GlassCodePanel ----------
function GlassCodePanel({ className, rotateY, rotateX = 0, lines, chart, header }) {
  return (
    <div
      className={`absolute w-115 h-56 rounded-2xl 
        bg-linear-to-br from-[#C6D6D9]/70 via-[#B6C3C7]/60 to-[#879499]/40
        backdrop-blur-md 
        border border-[#C6D6D9]/70
        shadow-xl p-4 overflow-hidden 
        ${className}`}
      style={{
        transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
      }}
    >
      {header && (
        <div className="text-[9px] text-slate-600/70 text-right mb-1 font-mono">
          {header}
        </div>
      )}

      <div className="font-mono text-[10px] leading-relaxed text-slate-700/80 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} style={{ paddingLeft: `${line.indent * 10}px` }}>
            <span className={line.color || ''}>{line.text}</span>
          </div>
        ))}
      </div>

      {chart && (
        <div className="absolute bottom-4 left-4 flex items-end gap-1 h-10">
          {[6, 10, 16, 12, 20, 14, 8].map((h, i) => (
            <div
              key={i}
              className="w-2 bg-[#879499]/70 rounded-sm"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Sparkle({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute ${className}`}
      width="28"
      height="28"
      fill="none"
    >
      <path
        d="M12 0 C12 6 14 10 24 12 C14 14 12 18 12 24 C12 18 10 14 0 12 C10 10 12 6 12 0 Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}

const loginSchema = z.object({
  emailId: z.string().min(3, 'Username is too short'),
  password: z.string().min(8, 'Password is too weak'),
});

const topLeftLines = [
  { text: 'show commonception(', indent: 0 },
  { text: 'chaur konnection {', indent: 0 },
  { text: '', indent: 0 },
  { text: 'function getUserData() {', indent: 0 },
  { text: 'let s,', indent: 1 },
  { text: 'init_sceeion() {', indent: 1 },
  { text: "username: 'name',", indent: 2 },
  { text: 'pecsword: 0,', indent: 2 },
  { text: "nomi: 'moviant'", indent: 2, color: 'text-emerald-600/80' },
  { text: '}', indent: 1 },
  { text: 'esea =', indent: 1 },
  { text: 'sesaion secion("route)', indent: 2, color: 'text-rose-500/80' },
  { text: 'else {', indent: 1 },
  { text: "'ctatiemare',", indent: 2 },
  { text: "conocotrocs-vaber')", indent: 2 },
  { text: 'return "tunchent + celor";', indent: 2 },
  { text: '}', indent: 0 },
];

const bottomLeftLines = [
  { text: 'function getUserData() {', indent: 0 },
  { text: 'init_session = init_session(', indent: 1 },
  { text: 'return heair;', indent: 2 },
  { text: '),', indent: 1 },
  { text: 'uases = -10;', indent: 1 },
  { text: "init_session(params, 'cession')", indent: 1 },
  { text: 'return heak;', indent: 1 },
  { text: '}', indent: 0 },
];

const topRightLines = [
  { text: '[08:24:01 log] tag: no priorities', indent: 0 },
  { text: '[08:24:02 log] mnavagem_gebget(init)', indent: 0 },
  { text: "[08:24:03] session error -> 'delae' + 400", indent: 0 },
  { text: '[08:24:04 log] token cracked pre-cluvebiedde -> 400', indent: 0 },
  { text: '[08:24:05 log] session in cebema', indent: 0 },
  { text: '[08:24:06 log] second cache route bevier', indent: 0 },
  { text: '[08:24:07 log] beacon route tag response', indent: 0 },
  { text: 'coriaie', indent: 0 },
  { text: '[08:24:08 log] second cache route bevier', indent: 0 },
  { text: '[08:24:09 log] beacon route tag ceet...', indent: 0 },
];

const bottomRightLines = [
  { text: 'reddeaced doe: vet exteword (000)', indent: 0 },
  { text: 'baodegooj cepenteajoo(dell), Invedeoieoja(000)', indent: 0 },
];

function getAuthErrorMessage(err) {
  if (!err) return '';
  const message = typeof err === 'string' ? err : err.message || err.error || '';

  if (/401|unauthori[sz]ed|invalid credentials|invalid (email|username|password)|user not found/i.test(message)) {
    return 'Invalid username or password. Please check your credentials and try again.';
  }
  if (/403|forbidden|blocked|disabled|not verified/i.test(message)) {
    return 'Your account is not authorized to log in. Please contact support.';
  }
  if (/network|failed to fetch|timeout|ECONNREFUSED|500|502|503/i.test(message)) {
    return 'Unable to reach the server right now. Please try again in a moment.';
  }
  return message || 'Something went wrong while logging in. Please try again.';
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    setFormTouched(false);
    dispatch(loginUser(data));
  };

  const serverErrorMessage = formTouched ? '' : getAuthErrorMessage(error);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#868c94]"
      style={{
        // Pin light color-scheme so the browser canvas never paints black
        colorScheme: 'light',
        WebkitTapHighlightColor: 'transparent',
        backgroundImage: `
          radial-gradient(
            ellipse 220px 140px at 50% 0%,
            rgba(255,255,255,0.95) 0%,
            rgba(255,255,255,0) 70%
          ),
          radial-gradient(
            ellipse 90% 75% at 50% 5%,
            #eef0f2 0%,
            #c7cbd1 45%,
            #868c94 100%
          )
        `,
        backgroundColor: '#868c94',
      }}
    >
      {/* Dark overlays */}
      <div className="absolute inset-0 pointer-events-none z-0 flex">
        <div className="w-[30%] h-full bg-linear-to-r from-black/40 to-transparent" />
        <div className="flex-1" />
        <div className="w-[30%] h-full bg-linear-to-l from-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none z-0 bg-linear-to-t from-black/40 to-transparent" />

      {/* Four glass panels */}
      <GlassCodePanel className="top-12 left-10 -rotate-2" rotateY={35} rotateX={2} lines={topLeftLines} />
      <GlassCodePanel className="bottom-12 left-14 rotate-1" rotateY={30} rotateX={-2} lines={bottomLeftLines} chart />
      <GlassCodePanel className="top-12 right-10 rotate-2" rotateY={-35} rotateX={2} lines={topRightLines} />
      <GlassCodePanel
        className="bottom-12 right-14 -rotate-1"
        rotateY={-30}
        rotateX={-2}
        lines={bottomRightLines}
        chart
        header="foomarale.coremotMorlajofeg]"
      />

      <Sparkle className="bottom-16 right-8" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-95 bg-[#dfe6e9dd] rounded-[28px] shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-slate-900 leading-snug mb-8">
          CodeRush
        </h1>

        {serverErrorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-500">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-13a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1zm0 9a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z"
                clipRule="evenodd"
              />
            </svg>
            <span>{serverErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('emailId', { onChange: () => setFormTouched(true) })}
              type="text"
              placeholder="Username"
              autoComplete="username"
              className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
            {errors.emailId && (
              <span className="text-error text-xs mt-1 block">{errors.emailId.message}</span>
            )}
          </div>

          <div>
            <input
              {...register('password', { onChange: () => setFormTouched(true) })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
            {errors.password && (
              <span className="text-error text-xs mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((v) => !v)}
              className="checkbox checkbox-xs"
            />
            Show password
          </label>

          {/* FIX: <button> instead of <input type="submit"> — no UA-style flash */}
          <button
            type="submit"
            disabled={loading}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="w-full rounded-xl bg-neutral-800 text-white text-base font-medium py-3 mt-2
                       transition-colors duration-150
                       hover:bg-neutral-900
                       active:bg-neutral-800
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500
                       disabled:opacity-60 disabled:cursor-not-allowed
                       select-none"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-sm text-black">
            Don't have an account?{' '}
            <NavLink to="/signup" className="link text-blue-500">
              Sign Up
            </NavLink>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
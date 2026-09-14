import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../authSlice';

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

const topLeftLines = [
  { text: 'sshdir commencceilers', indent: 0 },
  { text: 'ctacor konnection {', indent: 0 },
  { text: '', indent: 0 },
  { text: '    function GetUserDetail() {', indent: 1 },
  { text: '    let in s,', indent: 2 },
  { text: '    init_sceelon() {', indent: 2 },
  { text: '    username, "Noma",', indent: 3 },
  { text: '    pecsward10,', indent: 3 },
  { text: '    noma; mofion,', indent: 3 },
  { text: '    }', indent: 2 },
  { text: '', indent: 0 },
  { text: '    eseg = "actesssion"("focss")', indent: 2 },
  { text: '    else {', indent: 2 },
  { text: '    "ctotiemere",', indent: 3 },
  { text: '    conosccicoss, water;', indent: 3 },
  { text: '    return "tunchent e "cedor";', indent: 3 },
  { text: '    }', indent: 2 },
  { text: '    }', indent: 1 },
  { text: '}', indent: 0 },
];

const bottomLeftLines = [
  { text: 'function getUserData() {', indent: 0 },
  { text: '    init_session = init_session(', indent: 1 },
  { text: '    return heart;', indent: 2 },
  { text: '    )', indent: 1 },
  { text: '    useses = -10;', indent: 1 },
  { text: '    init_session[parons, "cession"];', indent: 1 },
  { text: '    return heak;', indent: 1 },
  { text: '}', indent: 0 },
];

const topRightLines = [
  { text: '2023-03-02 14:30:00', indent: 0 },
  { text: '2023-03-02 15:00:00', indent: 0 },
  { text: '2023-03-02 16:00:00', indent: 0 },
  { text: '2023-03-02 17:00:00', indent: 0 },
  { text: '2023-03-02 18:00:00', indent: 0 },
  { text: '2023-03-02 19:00:00', indent: 0 },
  { text: '2023-03-02 20:00:00', indent: 0 },
  { text: '2023-03-02 21:00:00', indent: 0 },
  { text: '2023-03-02 22:00:00', indent: 0 },
  { text: '2023-03-02 23:00:00', indent: 0 },
  { text: '2023-03-02 24:00:00', indent: 0 },
  { text: '2023-03-02 25:00:00', indent: 0 },
  { text: '2023-03-02 26:00:00', indent: 0 },
  { text: '2023-03-02 27:00:00', indent: 0 },
  { text: '2023-03-02 28:00:00', indent: 0 },
  { text: '2023-03-02 29:00:00', indent: 0 },
  { text: '2023-03-02 30:00:00', indent: 0 },
  { text: '2023-03-02 31:00:00', indent: 0 },
  { text: 'Ошибка 0x0000007E (0x0000007E): Нет памяти для записи данных.', indent: 0 },
  { text: 'Дополнительные сведения:', indent: 0 },
  { text: 'Входные данные записываются в память, которая занимает 8 байт.', indent: 0 },
  { text: 'Выходные данные записываются в память, которая занимает 4 байт.', indent: 0 },
];

const bottomRightLines = [
  { text: 'vidhuhmte olo sem bebesed (5000)', indent: 0 },
  { text: '(behohegne moroletacocoreqambojelid), imbitilovsang(5011)', indent: 0 },
  { text: 'Content', indent: 0 },
  { text: 'Mafet: cunebojon (obsepsiozibod)', indent: 0 },
  { text: 'Sema sebervileb (cunohungant sindis, auzicumolist, xhemomadol)', indent: 0 },
];

const signupSchema = z.object({
  firstname: z.string().min(3, 'Minimum character should be 3'),
  emailId: z.string().email({ message: 'Invalid Email' }),
  password: z.string().min(8, 'Password is too weak'),
});

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('form');           // 'form' | 'otp'
  const [savedData, setSavedData] = useState(null);   // signup data from step 1
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // ---------- STEP 1: submit signup form → backend sends OTP ----------
  const onSubmit = async (data) => {
    setServerError('');
    try {
      await dispatch(registerUser(data)).unwrap(); // { message: "OTP sent..." }
      setSavedData(data);
      setStep('otp');
    } catch (err) {
      setServerError(typeof err === 'string' ? err : 'Something went wrong');
    }
  };

  // ---------- STEP 2: submit OTP → backend verifies + logs in ----------
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setServerError('');
    try {
      await dispatch(registerUser({ ...savedData, otp })).unwrap();
      // isAuthenticated flips true → useEffect navigates to '/'
    } catch (err) {
      setServerError(typeof err === 'string' ? err : 'Invalid OTP');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
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

      {/* Glass panels */}
      <GlassCodePanel
        className="top-12 left-10 -rotate-2"
        rotateY={35}
        rotateX={2}
        lines={topLeftLines}
      />
      <GlassCodePanel
        className="bottom-12 left-14 rotate-1"
        rotateY={30}
        rotateX={-2}
        lines={bottomLeftLines}
        chart
      />
      <GlassCodePanel
        className="top-12 right-10 rotate-2"
        rotateY={-35}
        rotateX={2}
        lines={topRightLines}
      />
      <GlassCodePanel
        className="bottom-12 right-14 -rotate-1"
        rotateY={-30}
        rotateX={-2}
        lines={bottomRightLines}
        chart
        header="fcomorarie.comemotMorlojofog)"
      />
      <Sparkle className="bottom-16 right-8" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-95 bg-[#dfe6e9dd] rounded-[28px] shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-slate-900 leading-snug mb-8">
          CodeRush
        </h1>

        {/* ================= STEP 1: SIGNUP FORM ================= */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <input
                {...register('firstname')}
                type="text"
                placeholder="First Name"
                className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm"
              />
              {errors.firstname && (
                <span className="text-error text-xs mt-1 block">
                  {errors.firstname.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                {...register('emailId')}
                type="email"
                placeholder="Email"
                className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm"
              />
              {errors.emailId && (
                <span className="text-error text-xs mt-1 block">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password with show/hide */}
            <div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 pr-12 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    /* eye-off */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    /* eye */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-xs mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            {serverError && (
              <span className="text-error text-xs block">{serverError}</span>
            )}

            <input
              type="submit"
              value={loading ? 'Sending OTP...' : 'Sign Up'}
              disabled={loading}
              className="btn w-full rounded-xl bg-neutral-800 text-white border-none hover:bg-neutral-900 text-base font-medium h-auto py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </form>
        )}

        {/* ================= STEP 2: OTP FORM ================= */}
        {step === 'otp' && (
          <form onSubmit={onVerifyOtp} className="space-y-4">
            <p className="text-sm text-slate-700 text-center">
              We sent a 6-digit OTP to{' '}
              <span className="font-semibold">{savedData?.emailId}</span>
            </p>

            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input w-full max-w-none rounded-xl bg-white border-none px-5 py-3 h-auto text-slate-700 placeholder:text-slate-400 shadow-sm tracking-[0.5em] text-center text-lg"
              />
            </div>

            {serverError && (
              <span className="text-error text-xs block">{serverError}</span>
            )}

            <input
              type="submit"
              value={loading ? 'Verifying...' : 'Verify OTP'}
              disabled={otp.length !== 6 || loading}
              className="btn w-full rounded-xl bg-neutral-800 text-white border-none hover:bg-neutral-900 text-base font-medium h-auto py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={() => {
                setStep('form');
                setOtp('');
                setServerError('');
              }}
              className="text-xs text-slate-600 hover:text-slate-800 w-full text-center underline"
              disabled ={loading}
            >
              ← Edit details / Resend OTP
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <span className="text-sm text-black">
            Already have an account?{' '}
            <NavLink to="/login" className="link text-blue-500">
              Log In
            </NavLink>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
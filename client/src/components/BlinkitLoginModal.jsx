import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw, Sparkles, MapPin, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BlinkitLoginModal() {
  const { isAuthOpen, setIsAuthOpen, sendOtp, verifyOtp, completeProfile, demoLogin } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [activeOtpHint, setActiveOtpHint] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile completion state for new users
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    pincode: '500033'
  });

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend timer countdown
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset state on close
  const handleClose = () => {
    setIsAuthOpen(false);
    setTimeout(() => {
      setStep('phone');
      setPhone('');
      setOtpDigits(['', '', '', '']);
      setError('');
      setActiveOtpHint('');
    }, 300);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await sendOtp(cleanPhone);
    setIsLoading(false);

    if (res.success) {
      setActiveOtpHint(res.otp || '1234');
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      setTimeout(() => otpInputRefs[0].current?.focus(), 200);
    } else {
      setError(res.message || 'Failed to send OTP. Try again.');
    }
  };

  // Step 2: Handle OTP input change
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance
    if (digit && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }

    // If all 4 filled, trigger auto-verify
    if (digit && index === 3 && newDigits.every(d => d !== '')) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setOtpDigits(newDigits);
      handleVerifyOtp(pasted);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (fullOtp) => {
    const otpToTest = fullOtp || otpDigits.join('');
    if (otpToTest.length !== 4) {
      setError('Please enter all 4 digits of the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await verifyOtp(cleanPhone, otpToTest);
    setIsLoading(false);

    if (res.success) {
      if (res.isNewUser) {
        setStep('profile');
      } else {
        handleClose();
      }
    } else {
      setError(res.message || 'Incorrect OTP. Try 1234.');
    }
  };

  // Step 3: Complete Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await completeProfile({
      phone: cleanPhone,
      ...profileData
    });
    setIsLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.message || 'Failed to save profile');
    }
  };

  // One-click demo login
  const handleDemoClick = async () => {
    setIsLoading(true);
    await demoLogin();
    setIsLoading(false);
  };

  if (!isAuthOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 relative flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Brand Splash (Blinkit Yellow / Gold with Mangoes) */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-nikhila-green-600 p-6 sm:p-7 text-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-md">
              🥭
            </div>
            <div>
              <div className="text-2xl font-black font-serif tracking-tight text-stone-950">
                Nikhila<span className="text-white">Foods</span>
              </div>
              <p className="text-xs font-bold text-amber-950/80">
                Fresh & Authentic Food in Minutes
              </p>
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-950 font-medium">
            Naturally ripened mangoes, grandma pickles & wood-pressed cooking oils delivered fresh to your door.
          </div>
        </div>

        {/* Body content based on step */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: PHONE NUMBER INPUT ================= */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 font-serif">
                  India's Authentic Food Store
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Log in or sign up with your 10-digit mobile number
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
                {/* Mobile Input with +91 Flag */}
                <div className="flex items-center rounded-2xl border-2 border-stone-200 focus-within:border-amber-500 overflow-hidden bg-stone-50 transition-all">
                  <div className="flex items-center gap-1.5 px-3.5 py-3 border-r border-stone-200 bg-stone-100/80 text-stone-800 font-bold text-xs sm:text-sm select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength="10"
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base font-bold text-stone-900 focus:outline-none placeholder-stone-400 tracking-wider font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.length !== 10}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Tap Demo Login Shortcut */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider absolute">
                    Instant Demo
                  </span>
                </div>

                <button
                  onClick={handleDemoClick}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>1-Tap Demo Login (Ananya - 9848022338)</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-400 text-center leading-relaxed">
                By continuing, you agree to our <a href="#" className="underline text-stone-600">Terms of service</a> & <a href="#" className="underline text-stone-600">Privacy policy</a>
              </div>
            </div>
          )}

          {/* ================= STEP 2: OTP VERIFICATION ================= */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 font-serif">
                  Verify Mobile Number
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <span>Enter 4-digit code sent to <strong>+91 {phone}</strong></span>
                  <button
                    onClick={() => { setStep('phone'); setError(''); }}
                    className="text-amber-700 hover:text-amber-800 font-bold underline ml-1"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Test OTP Hint Card */}
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Use Test OTP:</span>
                  <span className="bg-white px-2.5 py-0.5 rounded-md font-mono font-black text-emerald-700 text-sm border border-emerald-300">
                    {activeOtpHint || '1234'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = (activeOtpHint || '1234').split('');
                    setOtpDigits(digits);
                    handleVerifyOtp(activeOtpHint || '1234');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-xs"
                >
                  Auto Fill
                </button>
              </div>

              {/* 4-Box Split OTP Input */}
              <div className="flex justify-center gap-3 pt-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="tel"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-14 text-center text-2xl font-black font-mono bg-stone-50 border-2 border-stone-200 focus:border-amber-500 focus:bg-white rounded-2xl focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>

              {/* Resend OTP */}
              <div className="text-center text-xs text-stone-500">
                {!canResend ? (
                  <span>Resend code in <strong className="text-stone-800">{timer}s</strong></span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    Resend OTP via SMS
                  </button>
                )}
              </div>

              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpDigits.some(d => d === '')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Log In</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP 3: PROFILE COMPLETION (FOR NEW USERS) ================= */}
          {step === 'profile' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 font-serif">
                  Welcome to Nikhila Foods! 🥭
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Tell us where to deliver your fresh food orders
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 px-3 py-2">
                    <User className="w-4 h-4 text-stone-400 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email / Gmail (Optional)</label>
                  <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 px-3 py-2">
                    <Mail className="w-4 h-4 text-stone-400 mr-2" />
                    <input
                      type="email"
                      placeholder="e.g. name@gmail.com"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Address *</label>
                  <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 px-3 py-2">
                    <MapPin className="w-4 h-4 text-stone-400 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="House/Flat No, Apartment, Street"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Profile & Start Ordering</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

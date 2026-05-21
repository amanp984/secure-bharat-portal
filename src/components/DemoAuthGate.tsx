import { useEffect, useState } from "react";
import { Lock, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const AUTH_KEY = "bharat_bank_demo_auth";
const DEMO_USER = "demo";
const DEMO_PASS = "demo123";

export function DemoAuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaCode = "BH7K2A";

  useEffect(() => {
    setAuthed(typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return null;

  if (authed) {
    return (
      <>
        {children}
        <button
          onClick={() => {
            localStorage.removeItem(AUTH_KEY);
            setAuthed(false);
            toast.success("Logged out securely");
          }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !pwd) {
      toast.error("Please enter User ID and Password");
      return;
    }
    if (captcha.toUpperCase() !== captchaCode) {
      toast.error("Invalid CAPTCHA");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (userId === DEMO_USER && pwd === DEMO_PASS) {
        localStorage.setItem(AUTH_KEY, "1");
        setAuthed(true);
        toast.success("Login successful. Welcome to Bharat Bank.");
      } else {
        toast.error("Invalid credentials. Use demo / demo123");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 text-white">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/10 backdrop-blur mb-3">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bharat Bank</h1>
          <p className="text-xs text-white/70 mt-1">Secure Net Banking Portal</p>
        </div>

        <Card className="p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Personal Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="uid">User ID / CIF Number</Label>
              <Input id="uid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter User ID" autoComplete="username" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Login Password</Label>
              <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cap">Enter CAPTCHA</Label>
              <div className="flex gap-2">
                <div className="flex-1 select-none rounded-md border bg-muted px-3 py-2 text-center font-mono text-base font-bold tracking-[0.3em] line-through decoration-wavy decoration-muted-foreground/40">
                  {captchaCode}
                </div>
                <Input id="cap" value={captcha} onChange={(e) => setCaptcha(e.target.value)} placeholder="CAPTCHA" className="flex-1" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Secure Login"}
            </Button>

            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <p className="font-semibold mb-0.5">Demo Credentials</p>
              <p>User ID: <code className="font-mono">demo</code> · Password: <code className="font-mono">demo123</code></p>
            </div>
          </form>
        </Card>

        <p className="text-center text-[10px] text-white/50 mt-4">
          This is a demonstration portal. No real banking data is processed.
        </p>
      </div>
    </div>
  );
}
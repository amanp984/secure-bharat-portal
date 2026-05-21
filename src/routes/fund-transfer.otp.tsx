import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/banking/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useBankingModal } from "@/components/banking/ModalContext";

const search = z.object({ amt: z.string().optional(), to: z.string().optional() });

export const Route = createFileRoute("/fund-transfer/otp")({
  component: OTPPage,
  validateSearch: search,
});

function OTPPage() {
  const { amt, to } = Route.useSearch();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(55);
  const [submitting, setSubmitting] = useState(false);
  const modal = useBankingModal();

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const verify = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      modal.show("mobile-only");
    }, 1400);
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto pt-6">
        <Card className="p-7 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 -top-10 flex justify-center">
            <div className="w-40 h-40 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12 }}
            className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant"
          >
            <ShieldCheck className="w-10 h-10 text-primary-foreground" />
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border-2 border-primary"
            />
          </motion.div>
          <h1 className="text-xl font-bold">Secure OTP Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code sent to your registered mobile<br />
            for ₹{amt} to <span className="font-semibold text-foreground">{to}</span>
          </p>

          <div className="flex justify-center my-6">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="w-11 h-12 text-lg font-bold" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            {timer > 0 ? (
              <>Resend OTP in <span className="font-bold text-primary">00:{timer.toString().padStart(2, "0")}</span></>
            ) : (
              <button onClick={() => setTimer(55)} className="text-primary font-bold hover:underline">Resend OTP</button>
            )}
          </div>

          <Button disabled={otp.length !== 6 || submitting} onClick={verify}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Verifying…</> : "Verify & Pay"}
          </Button>

          <div className="flex items-center gap-1.5 justify-center mt-4 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 text-success" />
            256-bit encrypted · Never share your OTP
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
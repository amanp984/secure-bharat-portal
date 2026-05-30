import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { IndianBankOneLogo } from "@/components/banking/IndianBankOneLogo";
import { useLoadingState, showLoading } from "@/lib/loading";
import { useStatementDownloadState } from "@/lib/pdf-statement";

export function LoadingOverlay() {
  const { visible, label } = useLoadingState();
  const router = useRouter();
  const downloading = useStatementDownloadState();

  // Bridge: show overlay while a statement download is in progress.
  useEffect(() => {
    if (!downloading) return;
    const release = showLoading("Preparing statement");
    return release;
  }, [downloading]);

  // Bridge: show overlay during route navigations.
  useEffect(() => {
    const releases = new Map<string, () => void>();
    const unsubBefore = router.subscribe("onBeforeLoad", (e: any) => {
      // ignore initial / same-route
      if (e?.pathChanged === false) return;
      const key = String(e?.toLocation?.href ?? Math.random());
      releases.set(key, showLoading("Loading"));
    });
    const finish = (e: any) => {
      const key = String(e?.toLocation?.href ?? "");
      // Release matching, or release oldest if no match
      const fn = releases.get(key);
      if (fn) { fn(); releases.delete(key); }
      else if (releases.size) {
        const first = releases.keys().next().value as string;
        releases.get(first)?.();
        releases.delete(first);
      }
    };
    const unsubResolved = router.subscribe("onResolved", finish);
    const unsubError = router.subscribe("onBeforeNavigate" as any, () => {});
    return () => { unsubBefore(); unsubResolved(); unsubError(); releases.forEach((r) => r()); };
  }, [router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center backdrop-blur-[2px]"
          style={{ zIndex: 999999, background: "rgba(255,255,255,0.6)" }}
          role="status"
          aria-live="polite"
          aria-label={label}
        >
          <div className="relative flex flex-col items-center">
            <div className="relative w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] flex items-center justify-center">
              {/* Rotating segmented ring */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full animate-[spin_1.4s_linear_infinite]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ibo-arc-a" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="ibo-arc-b" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                {/* faint full ring */}
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(30,58,138,0.12)" strokeWidth="4" />
                {/* 4 segmented arcs (gap between each) */}
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#ibo-arc-a)" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray="46 23" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#ibo-arc-b)" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray="20 256" strokeDashoffset="-140" />
              </svg>
              {/* Center logo */}
              <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-white shadow-lg flex items-center justify-center p-2">
                <IndianBankOneLogo className="w-full h-full" />
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
              {label}…
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

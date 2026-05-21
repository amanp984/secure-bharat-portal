import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

type ModalKind = "mobile-only" | "beneficiary-restricted" | null;

interface ModalCtx {
  show: (kind: Exclude<ModalKind, null>) => void;
  hide: () => void;
}

const Ctx = createContext<ModalCtx>({ show: () => {}, hide: () => {} });

export const useBankingModal = () => useContext(Ctx);

export function BankingModalProvider({ children }: { children: ReactNode }) {
  const [kind, setKind] = useState<ModalKind>(null);
  const navigate = useNavigate();

  const config = {
    "mobile-only": {
      icon: AlertTriangle,
      title: "Transaction Not Available",
      message:
        "We can't process this transaction through Net Banking currently. Please use Mobile Banking to complete this transaction.",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    "beneficiary-restricted": {
      icon: Shield,
      title: "Mobile Banking Required",
      message:
        "For security reasons, beneficiary management is currently available only on Mobile Banking. Please use Mobile Banking to continue.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  } as const;

  return (
    <Ctx.Provider value={{ show: setKind, hide: () => setKind(null) }}>
      {children}
      <AnimatePresence>
        {kind && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setKind(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-elegant max-w-md w-full overflow-hidden border"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className={`w-14 h-14 rounded-2xl ${config[kind].bg} flex items-center justify-center`}
                  >
                    {(() => {
                      const Icon = config[kind].icon;
                      return <Icon className={`w-7 h-7 ${config[kind].color}`} />;
                    })()}
                  </motion.div>
                  <button
                    onClick={() => setKind(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{config[kind].title}</h3>
                <p className="text-muted-foreground leading-relaxed">{config[kind].message}</p>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setKind(null)}>
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
                    onClick={() => {
                      setKind(null);
                      navigate({ to: "/" });
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
              <div className="h-1 bg-gradient-gold" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
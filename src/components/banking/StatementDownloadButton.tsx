import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { type ButtonProps, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadStatementPDF, useStatementDownloadState, type StatementTxn } from "@/lib/pdf-statement";

type StatementDownloadButtonProps = ButtonProps & {
  idleIcon: ComponentType<{ className?: string }>;
  idleLabel: string;
  loadingLabel?: string;
  /** Pre-filtered transactions to include in the PDF. */
  txns?: StatementTxn[];
  /** Explicit date range (YYYY-MM-DD). When set without `txns`, the PDF is
   *  generated from a fresh database query filtered to this range. */
  range?: { from: string; to: string };
};

export function StatementDownloadButton({
  idleIcon: IdleIcon,
  idleLabel,
  loadingLabel = "Generating...",
  txns,
  range,
  className,
  disabled,
  onClick,
  ...props
}: StatementDownloadButtonProps) {
  const isDownloading = useStatementDownloadState();

  return (
    <Button
      {...props}
      disabled={disabled || isDownloading}
      aria-busy={isDownloading}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented || isDownloading) return;
        await downloadStatementPDF({ txns, from: range?.from, to: range?.to });
      }}
      className={cn("relative", isDownloading && "opacity-80", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDownloading ? "loading" : "idle"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="inline-flex items-center gap-2"
        >
          {isDownloading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <IdleIcon className="shrink-0" />
          )}
          <span>{isDownloading ? loadingLabel : idleLabel}</span>
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { type ButtonProps, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadStatementPDF, useStatementDownloadState, type StatementTxn } from "@/lib/pdf-statement";

type StatementDownloadButtonProps = ButtonProps & {
  idleIcon: React.ComponentType<{ className?: string }>;
  idleLabel: string;
  loadingLabel?: string;
  txns?: StatementTxn[];
};

export function StatementDownloadButton({
  idleIcon: IdleIcon,
  idleLabel,
  loadingLabel = "Generating...",
  txns,
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
        await downloadStatementPDF(txns);
      }}
      className={cn("relative", isDownloading && "opacity-85", className)}
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
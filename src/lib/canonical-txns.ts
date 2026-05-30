// Canonical (full, unfiltered) transaction snapshot shared across the app.
// `useTransactions` writes the full ledger here on every load. The PDF
// generator reads from this snapshot so that EVERY download button on EVERY
// device produces the exact same PDF — the website ledger in its canonical
// order, never a filtered subset.
import type { UiTransaction } from "@/hooks/useTransactions";

let snapshot: UiTransaction[] = [];

export function setCanonicalTxns(txns: UiTransaction[]) {
  snapshot = txns;
}

export function getCanonicalTxns(): UiTransaction[] {
  return snapshot;
}

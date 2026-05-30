// Tiny global store for the LoadingOverlay. Lets any code (login, router,
// downloads, async work) show/hide a full-screen loader.
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let counter = 0;
let visible = false;
let label = "Loading";
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const MIN_VISIBLE_MS = 600;
let shownAt = 0;

function emit() {
  for (const l of listeners) l();
}

function setVisible(v: boolean) {
  if (v === visible) return;
  visible = v;
  if (v) shownAt = Date.now();
  emit();
}

export function showLoading(text = "Loading"): () => void {
  label = text;
  counter += 1;
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  setVisible(true);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    counter = Math.max(0, counter - 1);
    if (counter === 0) {
      const elapsed = Date.now() - shownAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      hideTimer = setTimeout(() => { if (counter === 0) setVisible(false); }, wait);
    }
  };
}

/** Show for at least `ms` then hide automatically. */
export function flashLoading(ms = 1500, text = "Loading") {
  const release = showLoading(text);
  setTimeout(release, ms);
}

export function useLoadingState() {
  const v = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => visible,
    () => false,
  );
  return { visible: v, label };
}

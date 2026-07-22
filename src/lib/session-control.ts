// Cross-device session control via Supabase realtime broadcast.
// - Each browser tab gets a unique deviceId (sessionStorage scope).
// - Admin can broadcast a "destroy-others" event; every other tab expires.
// - Local hooks/listeners let the auth gate react to expiry events.
import { supabase } from "@/integrations/supabase/client";

const DEVICE_KEY = "indone_device_id";

export function getDeviceId(): string {
  try {
    let id = sessionStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36));
      sessionStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSessionExpired(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function triggerSessionExpired() {
  listeners.forEach((l) => {
    try { l(); } catch { /* ignore */ }
  });
}

let channel: ReturnType<typeof supabase.channel> | null = null;
let initialized = false;

export function initSessionControl() {
  if (initialized) return;
  initialized = true;
  const myId = getDeviceId();
  try {
    channel = supabase.channel("session-control", {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "destroy-others" }, ({ payload }) => {
        const origin = (payload as { origin?: string } | null)?.origin;
        if (origin && origin !== myId) {
          triggerSessionExpired();
        }
      })
      .subscribe();
  } catch {
    /* realtime unavailable — feature degrades gracefully */
  }
}

export async function destroyOtherSessions(): Promise<void> {
  initSessionControl();
  const myId = getDeviceId();
  if (!channel) return;
  await channel.send({
    type: "broadcast",
    event: "destroy-others",
    payload: { origin: myId, at: Date.now() },
  });
}

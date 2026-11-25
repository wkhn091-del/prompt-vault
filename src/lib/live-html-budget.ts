/**
 * Cap concurrent live HTML iframes (each runs its own JS + layout).
 * High enough that Mine + Vault first screens stay live once granted
 * (tearing down heavy kits makes cards look stuck black).
 */
/** Keep the animations grid snappy — only a few live iframes at once. */
const MAX_LIVE = 6;

type Slot = { id: string; release: () => void; since: number };

const live = new Map<string, Slot>();
const waiters: Array<{
  id: string;
  grant: () => void;
  since: number;
}> = [];

function flushWaiters() {
  while (live.size < MAX_LIVE && waiters.length > 0) {
    const next = waiters.shift();
    if (!next) break;
    next.grant();
  }
}

/** Ask for a live-HTML slot. Returns a release() that must be called. */
export function requestHtmlSlot(
  id: string,
  onGrant: () => void,
): () => void {
  let granted = false;
  let cancelled = false;

  const grant = () => {
    if (cancelled || granted) return;
    if (live.size >= MAX_LIVE) {
      waiters.push({ id, grant, since: Date.now() });
      return;
    }
    granted = true;
    live.set(id, {
      id,
      release: () => {
        live.delete(id);
        flushWaiters();
      },
      since: Date.now(),
    });
    onGrant();
  };

  // Prefer immediate grant; if full, queue (or bump oldest if waiting long)
  if (live.size < MAX_LIVE) {
    grant();
  } else {
    waiters.push({ id, grant, since: Date.now() });
  }

  return () => {
    cancelled = true;
    const idx = waiters.findIndex((w) => w.id === id);
    if (idx >= 0) waiters.splice(idx, 1);
    if (granted) {
      live.get(id)?.release();
      live.delete(id);
      flushWaiters();
    }
  };
}

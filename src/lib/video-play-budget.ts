/**
 * Hard cap on concurrent video decoders.
 * Decoding — not network — is what freezes the machine on big galleries.
 */
const MAX_PLAYING = 3;

type Slot = { video: HTMLVideoElement; priority: number; since: number };

const playing = new Map<HTMLVideoElement, Slot>();

function pauseAndDrop(video: HTMLVideoElement) {
  playing.delete(video);
  try {
    video.pause();
  } catch {
    /* ignore */
  }
}

/** Fully tear down decoder + buffered frames (critical for gallery scroll). */
export function unloadVideo(video: HTMLVideoElement): void {
  pauseAndDrop(video);
  try {
    video.removeAttribute("src");
    while (video.firstChild) video.removeChild(video.firstChild);
    video.load();
  } catch {
    /* ignore */
  }
}

export function releaseVideo(video: HTMLVideoElement): void {
  pauseAndDrop(video);
}

/**
 * Request muted autoplay. Lower priority loses when over budget.
 * priority: hero=3, visible grid=2, hover=4, background=1
 */
export function requestVideoPlay(
  video: HTMLVideoElement,
  priority = 2,
): void {
  const existing = playing.get(video);
  if (existing) {
    existing.priority = Math.max(existing.priority, priority);
    if (video.paused) void video.play().catch(() => pauseAndDrop(video));
    return;
  }

  while (playing.size >= MAX_PLAYING) {
    let loser: Slot | null = null;
    for (const slot of playing.values()) {
      if (!loser || slot.priority < loser.priority || (slot.priority === loser.priority && slot.since < loser.since)) {
        loser = slot;
      }
    }
    if (!loser || loser.priority > priority) {
      // All current players are higher priority — skip this one
      return;
    }
    pauseAndDrop(loser.video);
  }

  playing.set(video, { video, priority, since: Date.now() });
  void video.play().catch(() => pauseAndDrop(video));
}

export function playingCount(): number {
  return playing.size;
}

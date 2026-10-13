import { useCallback, useEffect, useRef, useState } from "react";

type Hold = {
  timer: ReturnType<typeof setTimeout> | null;
  interval: ReturnType<typeof setInterval> | null;
  repeated: boolean;
  onTap: () => void;
  /** The finger/mouse that started it, so other pointers can't end it. */
  pointerId: number | null;
};

type HoldCallbacks = {
  /** Released before the hold delay: a single tap. */
  onTap: () => void;
  /** Fires once after the delay, then every interval while held. */
  onRepeat: () => void;
};

/**
 * Tap-or-hold buttons (e.g. +1 on tap, +10 repeatedly while held).
 *
 * Each key has its own timers, so several buttons can be held at once (a
 * whole table pressing their own life totals). A hold also stops when its
 * own pointer is released anywhere on the page, when the window loses focus
 * or is hidden, and on unmount, so it can never keep running after the finger
 * is lifted, even if the button became disabled mid-hold and missed its own
 * pointerup. Other people's taps don't affect it.
 */
export function useHoldToRepeat({
  delayMs = 1000,
  intervalMs = 500,
}: { delayMs?: number; intervalMs?: number } = {}) {
  const holds = useRef(new Map<string, Hold>());
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const sync = useCallback(() => {
    setActiveKeys(new Set(holds.current.keys()));
  }, []);

  const stop = useCallback((key: string): Hold | undefined => {
    const hold = holds.current.get(key);
    if (!hold) return undefined;
    if (hold.timer) clearTimeout(hold.timer);
    if (hold.interval) clearInterval(hold.interval);
    holds.current.delete(key);
    return hold;
  }, []);

  const start = useCallback(
    (
      key: string,
      { onTap, onRepeat }: HoldCallbacks,
      pointerId: number | null = null
    ) => {
      stop(key);
      const hold: Hold = {
        timer: null,
        interval: null,
        repeated: false,
        onTap,
        pointerId,
      };
      hold.timer = setTimeout(() => {
        hold.timer = null;
        hold.repeated = true;
        onRepeat();
        hold.interval = setInterval(onRepeat, intervalMs);
      }, delayMs);
      holds.current.set(key, hold);
      sync();
    },
    [delayMs, intervalMs, stop, sync]
  );

  /** Release: a tap if the hold never started repeating. */
  const end = useCallback(
    (key: string) => {
      const hold = stop(key);
      sync();
      if (hold && !hold.repeated) hold.onTap();
    },
    [stop, sync]
  );

  /** Abandon without a tap (pointer left the button, gesture cancelled). */
  const cancel = useCallback(
    (key: string) => {
      if (stop(key)) sync();
    },
    [stop, sync]
  );

  const cancelAll = useCallback(() => {
    if (holds.current.size === 0) return;
    for (const key of Array.from(holds.current.keys())) stop(key);
    sync();
  }, [stop, sync]);

  useEffect(() => {
    // Window listeners run after the button's own handlers (React attaches
    // at the root), so this only catches holds the button failed to end.
    const onPointerRelease = (event: PointerEvent) => {
      let changed = false;
      for (const [key, hold] of Array.from(holds.current.entries())) {
        if (hold.pointerId === event.pointerId) {
          stop(key);
          changed = true;
        }
      }
      if (changed) sync();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") cancelAll();
    };
    window.addEventListener("pointerup", onPointerRelease);
    window.addEventListener("pointercancel", onPointerRelease);
    window.addEventListener("blur", cancelAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      window.removeEventListener("blur", cancelAll);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAll();
    };
  }, [cancelAll, stop, sync]);

  const isActive = useCallback(
    (key: string) => activeKeys.has(key),
    [activeKeys]
  );

  /** Pointer handlers to spread onto a tap-or-hold element. */
  const bind = useCallback(
    (key: string, callbacks: HoldCallbacks) => ({
      onPointerDown: (event: React.PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        start(key, callbacks, event.pointerId);
      },
      onPointerUp: () => end(key),
      onPointerLeave: () => cancel(key),
      onPointerCancel: () => cancel(key),
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    }),
    [start, end, cancel]
  );

  return { bind, isActive, cancelAll };
}

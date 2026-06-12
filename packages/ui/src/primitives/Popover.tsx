"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

/**
 * Anchored popover panel (Admin Vendors list T3 chunk B: filter popover, sort
 * dropdown, row overflow menu all sit on this). Portal-rendered with fixed
 * positioning so it never clips inside table overflow; dismisses on outside
 * pointer-down, Escape (refocuses the trigger), and scroll-away re-measure.
 *
 * The trigger is a render prop so any kit element (Button, icon button) can
 * anchor it without nesting interactive elements.
 */

export interface PopoverTriggerApi {
  ref: Ref<HTMLButtonElement>;
  open: boolean;
  toggle: () => void;
}

export interface PopoverProps {
  trigger: (api: PopoverTriggerApi) => ReactNode;
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Horizontal alignment of the panel against the trigger. */
  align?: "start" | "end";
  /** Fixed panel width in px; defaults to content width (min 180). */
  width?: number;
  className?: string;
}

export function Popover({ trigger, children, align = "start", width, className = "" }: PopoverProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; right: number } | null>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  return (
    <>
      {trigger({ ref: triggerRef, open, toggle })}
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            className={`fixed z-50 rounded-xl border shadow-[0_8px_28px_rgba(20,25,20,0.14)] ${className}`}
            style={{
              top: pos.top,
              ...(align === "end" ? { right: pos.right } : { left: pos.left }),
              width,
              minWidth: width ? undefined : 180,
              background: "var(--portal-card-reading)",
              borderColor: "var(--portal-line)",
              maxHeight: `calc(100vh - ${pos.top + 12}px)`,
              overflowY: "auto",
            }}
          >
            {typeof children === "function" ? children({ close }) : children}
          </div>,
          document.body,
        )}
    </>
  );
}

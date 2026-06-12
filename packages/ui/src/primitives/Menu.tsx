"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons";
import { Popover } from "./Popover";

/**
 * Action menu on the Popover primitive (T3 row overflow + bulk-action menus,
 * locked 2026-06-02 on the Admin Vendors list). Items are 36px rows, 13px
 * Inter; a disabled item stays VISIBLE with a muted parked note (rule 2b:
 * a locked affordance whose backing isn't built yet renders as a placeholder,
 * never disappears).
 */

export interface MenuItemSpec {
  label: string;
  /** Navigate on select (renders an <a>). */
  href?: string;
  /** Run on select; the menu closes first. */
  onSelect?: () => void;
  disabled?: boolean;
  /** Muted one-line explanation shown under a disabled item. */
  note?: string;
  danger?: boolean;
  separatorBefore?: boolean;
}

export interface MenuProps {
  items: MenuItemSpec[];
  /** Custom trigger; defaults to the kebab (overflow dots) icon button. */
  trigger?: ReactNode;
  align?: "start" | "end";
  width?: number;
  /** Accessible label for the default kebab trigger. */
  label?: string;
}

export function Menu({ items, trigger, align = "end", width = 232, label = "Actions" }: MenuProps) {
  return (
    <Popover
      align={align}
      width={width}
      trigger={({ ref, open, toggle }) =>
        trigger ? (
          <button
            ref={ref}
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            className="inline-flex"
          >
            {trigger}
          </button>
        ) : (
          <button
            ref={ref}
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={label}
            className="size-8 grid place-items-center rounded-md hover:bg-[var(--portal-card-hover)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Icon name="dots" size={17} />
          </button>
        )
      }
    >
      {({ close }) => (
        <div role="menu" className="py-1.5">
          {items.map((item, i) => (
            <MenuRow key={`${item.label}${i}`} item={item} close={close} />
          ))}
        </div>
      )}
    </Popover>
  );
}

function MenuRow({ item, close }: { item: MenuItemSpec; close: () => void }) {
  const color = item.danger ? "oklch(0.48 0.18 25)" : "var(--portal-ink)";
  const inner = (
    <>
      <span className="block text-[13px] font-medium" style={{ color: item.disabled ? "var(--muted-foreground)" : color }}>
        {item.label}
      </span>
      {item.disabled && item.note && (
        <span className="block text-[11.5px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {item.note}
        </span>
      )}
    </>
  );
  const rowCls =
    "w-full text-left px-3.5 py-2 block hover:bg-[var(--portal-card-hover)] disabled:hover:bg-transparent disabled:cursor-not-allowed";

  return (
    <>
      {item.separatorBefore && (
        <div className="my-1.5 border-t" style={{ borderColor: "var(--portal-line)" }} />
      )}
      {item.href && !item.disabled ? (
        <a role="menuitem" href={item.href} className={rowCls} onClick={close}>
          {inner}
        </a>
      ) : (
        <button
          role="menuitem"
          type="button"
          disabled={item.disabled}
          className={rowCls}
          onClick={() => {
            close();
            item.onSelect?.();
          }}
        >
          {inner}
        </button>
      )}
    </>
  );
}

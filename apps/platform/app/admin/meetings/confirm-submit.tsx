"use client";

/**
 * Submit button gated by a native confirm() dialog, for admin actions that
 * move money or state and should not fire on a stray click.
 */
export function ConfirmSubmit({
  message,
  children,
  className,
  style,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

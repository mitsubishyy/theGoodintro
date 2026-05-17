import { CALENDLY_URL } from "@/lib/config";

type Props = {
  children: React.ReactNode;
  className?: string;
};

// Single conversion control. Points at the Calendly event once wired;
// stubbed to "#" for the validation build.
export function CallButton({ children, className = "btn" }: Props) {
  const isStub = CALENDLY_URL === "#";
  return (
    <a
      className={className}
      href={CALENDLY_URL}
      {...(isStub
        ? { "aria-disabled": "true", "data-todo": "wire-calendly" }
        : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}

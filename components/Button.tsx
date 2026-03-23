import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const sharedClassName =
  "inline-flex items-center justify-center rounded-full bg-linear-to-r from-stll-accent to-[#b8956a] px-6 py-3 text-sm font-semibold text-stll-charcoal shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-soft relative overflow-hidden group";

export function Button({
  children,
  href,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={`${sharedClassName} ${className}`}>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <span className="absolute inset-0 rounded-full bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${sharedClassName} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="absolute inset-0 rounded-full bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></span>
    </button>
  );
}
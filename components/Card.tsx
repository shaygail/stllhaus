import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <article className={`rounded-2xl border border-stll-light bg-linear-to-br from-white to-stll-cream/30 p-6 shadow-soft transition-all duration-300 hover:shadow-lg hover:border-stll-accent/50 hover:-translate-y-1 hover:bg-linear-to-br hover:from-stll-cream/50 hover:to-stll-cream/20 sm:p-8 group scroll-reveal ${className}`}>
      {children}
    </article>
  );
}
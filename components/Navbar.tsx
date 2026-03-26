"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Menu" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => setMenuOpen(false), 0);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <>
      <input
        type="checkbox"
        id="mobile-menu-check"
        className="sr-only peer/menu"
        checked={menuOpen}
        onChange={(e) => setMenuOpen(e.target.checked)}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          transparent
            ? "bg-transparent"
            : "bg-white/97 backdrop-blur-md border-b border-black/8"
        }`}
      >
        <nav className="flex items-center justify-between px-6 sm:px-12 lg:px-16 py-5">
          <Link
            href="/"
            className={`text-sm font-bold tracking-[0.35em] uppercase transition-colors duration-500 ${
              transparent ? "text-white" : "text-stll-charcoal"
            }`}
          >
            STLL HAUS
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300 border-b pb-0.5 ${
                      isActive
                        ? transparent
                          ? "border-white text-white"
                          : "border-stll-charcoal text-stll-charcoal"
                        : transparent
                        ? "border-transparent text-white/70 hover:text-white hover:border-white/50"
                        : "border-transparent text-stll-muted hover:text-stll-charcoal hover:border-stll-charcoal/40"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-5">
            <Link
              href="/checkout"
              className={`text-[11px] tracking-[0.25em] uppercase font-medium transition-colors duration-500 flex items-center gap-2 ${
                transparent
                  ? "text-white/70 hover:text-white"
                  : "text-stll-muted hover:text-stll-charcoal"
              }`}
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span
                  className={`inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                    transparent
                      ? "bg-white text-stll-charcoal"
                      : "bg-stll-charcoal text-white"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <label
              htmlFor="mobile-menu-check"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={`md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 cursor-pointer ${
                transparent ? "text-white" : "text-stll-charcoal"
              }`}
            >
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${
                  menuOpen ? "rotate-45 translate-y-1.25" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-all duration-300 origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-1.25" : ""
                }`}
              />
            </label>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 flex flex-col px-8 pt-28 pb-16 bg-[#FAF8F5] md:hidden
          transition-transform duration-300 ease-in-out
          peer-checked/menu:translate-y-0 peer-checked/menu:pointer-events-auto
          ${
            menuOpen
              ? "translate-y-0 pointer-events-auto"
              : "-translate-y-full pointer-events-none"
          }`}
      >
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <li
                  key={item.href}
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                  className="animate-slideUp"
                >
                  <Link
                    href={item.href}
                    className={`block text-4xl font-black uppercase tracking-tight py-3 transition-colors duration-200 ${
                      isActive ? "text-stll-charcoal" : "text-stll-charcoal/40 hover:text-stll-charcoal"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          style={{ animationDelay: "240ms", animationFillMode: "both" }}
          className="border-t border-stll-charcoal/10 pt-8 animate-slideUp"
        >
          <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/40">
            stllhaus.co
          </p>
        </div>
      </div>
    </>
  );
}
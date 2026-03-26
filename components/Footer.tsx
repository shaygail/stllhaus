import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stll-charcoal text-white">
      <div className="px-10 sm:px-16 lg:px-24 py-16 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-bold tracking-[0.35em] uppercase">STLL HAUS</p>
            <p className="mt-4 text-xs text-white/45 leading-relaxed max-w-50">
              a quiet place, <br></br>made for slowing down.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/35 mb-5">Pages</p>
            <ul className="space-y-3">
              {[
                { href: "/gallery", label: "Menu" },
                { href: "/loyalty", label: "Loyalty" },
                { href: "/checkout", label: "Checkout" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/35 mb-5">Compliance</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="/food-business-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                >
                  Food Certificate
                </a>
              </li>
              <li>
                <Link
                  href="/records"
                  className="text-xs tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                >
                  Business Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/35 mb-5">Social</p>
            <ul className="space-y-3">
              {["Instagram", "TikTok", "Email"].map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="text-xs tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/25">
            © {new Date().getFullYear()} STLL HAUS · All rights reserved
          </p>
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/25">
            stllhaus.co
          </p>
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/25">
            Designed by <a href="https://shaygaliste.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">SGDesign</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

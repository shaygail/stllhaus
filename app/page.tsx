"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* ─────────────────────────────────────────
          SECTION 1 · Full-screen hero
      ───────────────────────────────────────── */}
      <section className="relative w-full h-screen min-h-150 overflow-hidden">
        <Image
          src="/head-webpage.jpg"
          alt="STLL HAUS – slow drinks, soft moments"
          fill
          unoptimized
          className="object-cover object-center"
          priority
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/50 pointer-events-none" />

        {/* content */}
        <div className="relative z-10 flex flex-col h-full px-10 sm:px-16 pt-28 pb-16">
          {/* centered brand mark */}
          <div className="flex-1 flex flex-col items-center justify-end pb-32 text-center">
            <h1 className="text-white text-7xl sm:text-8xl lg:text-[9rem] font-black tracking-[0.12em] uppercase leading-none">
              STLL HAUS
            </h1>
            <p className="mt-4 text-white/60 text-[11px] tracking-[0.5em] uppercase">
              Matcha and Coffee Bar
            </p>
          </div>

          {/* bottom-left tagline */}
          <p className="text-white/65 text-sm leading-relaxed max-w-sm">
            A space for stillness — serving matcha, <br></br>cold brew, and slow-crafted drinks for your quiet moments.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 2 · Dark brand story
      ───────────────────────────────────────── */}
      <section className="bg-stll-charcoal text-white px-10 sm:px-16 lg:px-24 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto divide-y divide-white/10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-10 gap-y-4 py-12 items-start">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white leading-loose">
              Our<br />Story
            </p>
            <div className="space-y-3">
              <p className="text-sm text-white/55 leading-relaxed">
                STLL HAUS is your go-to for thoughtfully crafted drinks — made for slow moments, even on busy days.
              </p>
              <p className="text-sm text-white/55 leading-relaxed">
                Inspired by the word &quot;still,&quot; our name reflects calm, simplicity, and intention — reimagined into something uniquely ours. What started as a small passion project is now a{" "}
                <a
                  href="https://mpi.my.salesforce-sites.com/publicregister/PublicRegisterSearch#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-white/75 hover:text-white transition-colors"
                >
                  licensed food business
                </a>
                , serving handcrafted drinks for both pickup orders and local markets.
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-10 gap-y-4 py-12 items-start">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white leading-loose">
              This Is<br />STLL HAUS
            </p>
            <div className="space-y-3">
              <p className="text-sm text-white/55 leading-relaxed">
                Whether you&apos;re ordering ahead, stopping by after hours, or visiting us at a stall, every cup is made with care — designed to give you a moment to pause, reset, and enjoy.
              </p>
              <p className="text-sm text-white/55 leading-relaxed">
                Order online. Pick up. Find us at the markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 3 · Split: bold headline + product image
      ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        {/* Left: cream + large headline */}
        <div className="bg-[#EAE4DC] flex flex-col justify-between p-10 sm:p-16 lg:p-20 min-h-[55vw] md:min-h-0">
          <p className="text-xs text-stll-muted/60 leading-relaxed max-w-xs tracking-wide">
            Thoughtfully crafted drinks, made to slow you down and bring you back to the moment.
          </p>
          <div>
            <h2 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-stll-charcoal uppercase leading-[0.88] tracking-tight">
              YOUR<br />MOMENT TO<br />SLOW DOWN
            </h2>
            <p className="mt-8 text-[10px] tracking-[0.35em] text-stll-muted uppercase">
              stllhaus.co
            </p>
          </div>
        </div>

        {/* Right: product photo */}
        <div className="relative min-h-[70vw] md:min-h-0 overflow-hidden bg-stll-light">
          <Image
            src="/niyo photo.png"
            alt="Niyo – STLL HAUS"
            fill
            unoptimized
            className="object-cover object-center"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 4 · Split: product image + dark text
      ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        {/* Left: product image */}
        <div className="relative min-h-[70vw] md:min-h-0 overflow-hidden bg-stll-sage/20">
          <Image
            src="/ube.jpg"
            alt="Ube drink – STLL HAUS"
            fill
            unoptimized
            className="object-cover object-center"
          />
        </div>

        {/* Right: dark bg + text + CTA */}
        <div className="bg-stll-charcoal flex flex-col justify-center p-10 sm:p-16 lg:p-20">
          <span className="text-[10px] text-white/35 tracking-[0.35em] uppercase mb-6">
            The Stll Haus Experience
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-[0.9] tracking-tight">
            CRAFTED<br />FOR THE<br />STILL<br />MOMENT
          </h2>
          <p className="mt-6 text-sm text-white/45 leading-relaxed max-w-xs">
            Built from a passion for craft, every drink is created with intention — for your everyday pause.
          </p>
          <Link
            href="/gallery"
            className="mt-10 self-start inline-block border border-white/25 text-white text-[11px] tracking-[0.3em] uppercase px-8 py-4 hover:bg-white hover:text-stll-charcoal transition-all duration-400"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          SECTION 5 · Cloud Collection + CTA
      ───────────────────────────────────────── */}
      <section className="relative w-full min-h-[75vh] overflow-hidden">
        <Image
          src="/part2.jpg"
          alt="The Cloud Collection – STLL HAUS"
          fill
          unoptimized
          className="object-cover object-center"
        />
        {/* Dark gradient overlay so text reads clearly */}
        <div className="absolute inset-0 bg-stll-charcoal/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-8 text-center">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-[0.08em] leading-tight">
            MAKE IT YOUR<br />STLL MOMENT
          </h2>
          <Link
            href="/gallery"
            className="mt-10 inline-block border border-white text-white text-[11px] tracking-[0.35em] uppercase px-12 py-4 hover:bg-white hover:text-stll-charcoal transition-all duration-400"
          >
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
}


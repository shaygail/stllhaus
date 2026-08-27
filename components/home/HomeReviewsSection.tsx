import { ReviewCard } from "@/components/ReviewCard";
import { TrustpilotWidget } from "@/components/TrustpilotWidget";
import { CUSTOMER_REVIEWS, GOOGLE_REVIEW_URL, TRUSTPILOT_REVIEW_URL } from "@/data/customer-reviews";

export function HomeReviewsSection() {
  const trustpilotConfigured = Boolean(process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID?.trim());

  return (
    <section className="bg-[#EAE4DC] px-6 sm:px-12 lg:px-20 py-16 sm:py-24 border-y border-stll-charcoal/10">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">
            Still moments
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-stll-charcoal leading-tight">
            Still Moments
          </h2>
          <p className="mt-4 text-sm text-stll-muted leading-relaxed">
            What our guests say — on Google, Trustpilot, and at the markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 sm:mb-12">
          {CUSTOMER_REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {trustpilotConfigured ? (
          <div className="mb-10 sm:mb-12 bg-white/70 border border-stll-charcoal/10 p-4 sm:p-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-4 text-center">
              Live on Trustpilot
            </p>
            <TrustpilotWidget height="260px" />
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-stll-charcoal/25 text-stll-charcoal text-[11px] tracking-[0.3em] uppercase px-8 py-3.5 hover:bg-stll-charcoal hover:text-white transition-all duration-300"
          >
            Read on Google
          </a>
          <a
            href={TRUSTPILOT_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-stll-charcoal/15 text-stll-charcoal/80 text-[11px] tracking-[0.3em] uppercase px-8 py-3.5 hover:border-stll-charcoal/40 hover:text-stll-charcoal transition-colors duration-300"
          >
            {trustpilotConfigured ? "Review on Trustpilot" : "Trustpilot"}
          </a>
        </div>
      </div>
    </section>
  );
}

import type { CustomerReview } from "@/data/customer-reviews";

type ReviewCardProps = {
  review: CustomerReview;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rating ? "text-stll-charcoal" : "text-stll-charcoal/15"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function sourceLabel(source: CustomerReview["source"]): string {
  switch (source) {
    case "google":
      return "Google";
    case "trustpilot":
      return "Trustpilot";
    case "facebook":
      return "Facebook";
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="flex flex-col h-full border border-stll-charcoal/10 bg-white/80 p-6 sm:p-8">
      <Stars rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-sm text-stll-charcoal/80 leading-relaxed">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <footer className="mt-6 pt-4 border-t border-stll-charcoal/8">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-stll-charcoal">
          {review.author}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.2em] uppercase text-stll-muted">
          {review.dateLabel ?? sourceLabel(review.source)}
        </p>
      </footer>
    </article>
  );
}

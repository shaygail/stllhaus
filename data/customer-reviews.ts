export type CustomerReview = {
  id: string;
  author: string;
  source: "google" | "trustpilot" | "facebook";
  rating: number;
  text: string;
  dateLabel?: string;
};

/** Curated highlights — update with real quotes from Google / Trustpilot. */
export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "google-1",
    author: "Local Guest",
    source: "google",
    rating: 5,
    text: "Beautifully crafted drinks and such a calm vibe. The matcha is smooth and you can tell everything is made with care.",
    dateLabel: "Google review",
  },
  {
    id: "google-2",
    author: "Market Visitor",
    source: "google",
    rating: 5,
    text: "Found STLL HAUS at a market and loved the ube cream matcha. Friendly team and worth the visit every time.",
    dateLabel: "Google review",
  },
  {
    id: "google-3",
    author: "Regular",
    source: "google",
    rating: 5,
    text: "My go-to for a quiet treat — ordering ahead is easy and pickup is always ready. Still moments, literally.",
    dateLabel: "Google review",
  },
];

export const GOOGLE_REVIEW_URL = "https://g.page/r/CSCrKOGMTz7VEBM/review";

export const TRUSTPILOT_REVIEW_URL =
  process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL?.trim() || "https://www.trustpilot.com/review/stllhaus.co";

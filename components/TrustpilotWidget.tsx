"use client";

import { TRUSTPILOT_REVIEW_URL } from "@/data/customer-reviews";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, force?: boolean) => void;
    };
  }
}

type TrustpilotWidgetProps = {
  className?: string;
  height?: string;
  /** TrustBox template id from Trustpilot → Integrations → TrustBox */
  templateId?: string;
};

const DEFAULT_TEMPLATE_ID = "53aa8912dec7e10d38f59f32";

export function TrustpilotWidget({
  className = "",
  height = "240px",
  templateId,
}: TrustpilotWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const businessUnitId = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID?.trim();
  const resolvedTemplateId =
    templateId?.trim() ||
    process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID?.trim() ||
    DEFAULT_TEMPLATE_ID;

  useEffect(() => {
    if (!businessUnitId || !ref.current) return;

    const loadWidget = () => {
      window.Trustpilot?.loadFromElement(ref.current, true);
    };

    if (window.Trustpilot) {
      loadWidget();
      return;
    }

    const existing = document.querySelector('script[data-trustpilot-bootstrap="true"]');
    if (existing) {
      existing.addEventListener("load", loadWidget);
      return () => existing.removeEventListener("load", loadWidget);
    }

    const script = document.createElement("script");
    script.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;
    script.dataset.trustpilotBootstrap = "true";
    script.onload = loadWidget;
    document.head.appendChild(script);
  }, [businessUnitId, resolvedTemplateId]);

  if (!businessUnitId) {
    return null;
  }

  return (
    <div className={className}>
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale="en-NZ"
        data-template-id={resolvedTemplateId}
        data-businessunit-id={businessUnitId}
        data-style-height={height}
        data-style-width="100%"
        data-theme="light"
        data-stars="4,5"
        data-review-languages="en"
      >
        <a href={TRUSTPILOT_REVIEW_URL} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </div>
  );
}

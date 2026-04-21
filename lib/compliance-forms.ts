export const COMPLIANCE_FORM_TYPES = [
  "allergens",
  "staff_sickness",
  "fridge_temp_check",
  "trusted_supplier_delivery",
  "trusted_suppliers",
  "food_safety_area_review",
] as const;

export type ComplianceFormType = (typeof COMPLIANCE_FORM_TYPES)[number];

export const COMPLIANCE_FORM_LABELS: Record<ComplianceFormType, string> = {
  allergens: "Allergens in your food",
  staff_sickness: "Managing personal hygiene and health - staff sickness",
  fridge_temp_check: "Keeping food cold - fridge/chiller temperature checks",
  trusted_supplier_delivery: "Trusted supplier deliveries",
  trusted_suppliers: "My trusted suppliers",
  food_safety_area_review: "Food safety area review",
};

const PREFIX = "COMPLIANCE_FORM_V1:";

export function serializeComplianceForm(formType: ComplianceFormType, payload: Record<string, unknown>): string {
  return `${PREFIX}${JSON.stringify({ formType, payload })}`;
}

/** Parsed from stored `details`; `formType` may be any string so new forms still render after deploy. */
export type ParsedComplianceForm = {
  formType: string;
  payload: Record<string, unknown>;
};

function humanizeUnknownFormType(id: string): string {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Label for a form type id — known types use the canonical title; others get a readable fallback. */
export function getComplianceFormLabel(formType: string): string {
  if (COMPLIANCE_FORM_TYPES.includes(formType as ComplianceFormType)) {
    return COMPLIANCE_FORM_LABELS[formType as ComplianceFormType];
  }
  return humanizeUnknownFormType(formType);
}

export function parseComplianceForm(details: string): ParsedComplianceForm | null {
  if (!details.startsWith(PREFIX)) return null;
  try {
    const raw = JSON.parse(details.slice(PREFIX.length)) as {
      formType?: unknown;
      payload?: unknown;
    };
    const formType = raw.formType;
    if (typeof formType !== "string" || !formType.trim()) {
      return null;
    }
    if (!raw.payload || typeof raw.payload !== "object") return null;
    return { formType: formType.trim(), payload: raw.payload as Record<string, unknown> };
  } catch {
    return null;
  }
}

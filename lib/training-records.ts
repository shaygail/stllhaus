/** SS&S food safety plan topics — "part of the plan that has been covered". */
export const TRAINING_TOPICS = [
  "Health & hygiene",
  "Preparing food",
  "Separating food",
  "Sourcing, receiving, and storing food",
  "Keeping food cold",
  "Cleaning and sanitising",
  "Managing customer complaints",
  "When something goes wrong",
  "Recalling your food",
  "Checking for pests",
  "Thoroughly cooking food",
  "Cooking poultry, minced meat, and liver",
  "Proving the method you use works every time",
  "Reheating food",
  "Cooling freshly cooked food",
  "Defrosting food",
  "Keeping food hot",
  "Transporting food",
  "Displaying food and customers serving themselves",
  "Knowing what is in your food",
  "Packing and labelling your food",
  "Selling food to other business",
  "Maintaining equipment and facilities",
  "Tracing your food",
  "Using water activity to control bugs",
  "Using acid to control bugs",
  "Hot-smoking to control bugs",
  "Making sushi",
  "Making Chinese style roast duck",
  "Making doner kebabs",
  "Cooking using sous vide",
  "Preparing red meat for mincing and serving lightly-cooked or raw",
] as const;

export type StaffTrainingProfile = {
  employeeName: string;
  position: string;
  startDate: string;
  email: string;
  phoneNumber: string;
};

export type TrainingSessionRow = {
  id: string;
  topic: string;
  staffName: string;
  trainerInitials: string;
  date: string;
};

export type StaffTrainingDocument = {
  profile: StaffTrainingProfile;
  sessions: TrainingSessionRow[];
};

const PREFIX_V2 = "TRAINING_RECORD_V2:";
const PREFIX_V1 = "TRAINING_RECORD_V1:";

export function employeeTrainingTitle(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `${trimmed}'s training record` : "Staff training record";
}

export function slugifyEmployeeKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createEmptyTrainingDocument(employeeName: string): StaffTrainingDocument {
  return {
    profile: {
      employeeName: employeeName.trim(),
      position: "",
      startDate: "",
      email: "",
      phoneNumber: "",
    },
    sessions: [],
  };
}

export function serializeStaffTrainingDocument(doc: StaffTrainingDocument): string {
  return `${PREFIX_V2}${JSON.stringify(doc)}`;
}

function newRowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseV1Record(details: string): StaffTrainingDocument | null {
  if (!details.startsWith(PREFIX_V1)) return null;
  try {
    const raw = JSON.parse(details.slice(PREFIX_V1.length)) as {
      employeeName?: unknown;
      phoneNumber?: unknown;
      position?: unknown;
      startDate?: unknown;
      topic?: unknown;
      supervisor?: unknown;
      trainingDate?: unknown;
      notes?: unknown;
    };
    if (typeof raw.employeeName !== "string") return null;
    const profile: StaffTrainingProfile = {
      employeeName: raw.employeeName,
      position: typeof raw.position === "string" ? raw.position : "",
      startDate: typeof raw.startDate === "string" ? raw.startDate : "",
      email: "",
      phoneNumber: typeof raw.phoneNumber === "string" ? raw.phoneNumber : "",
    };
    const sessions: TrainingSessionRow[] = [];
    if (typeof raw.topic === "string" && raw.topic.trim()) {
      sessions.push({
        id: newRowId(),
        topic: raw.topic,
        staffName: raw.employeeName,
        trainerInitials: typeof raw.supervisor === "string" ? raw.supervisor : "",
        date: typeof raw.trainingDate === "string" ? raw.trainingDate : "",
      });
    }
    return { profile, sessions };
  } catch {
    return null;
  }
}

function parseV2Record(details: string): StaffTrainingDocument | null {
  if (!details.startsWith(PREFIX_V2)) return null;
  try {
    const raw = JSON.parse(details.slice(PREFIX_V2.length)) as Partial<StaffTrainingDocument>;
    if (!raw.profile || typeof raw.profile !== "object") return null;
    const profile = raw.profile as Partial<StaffTrainingProfile>;
    if (typeof profile.employeeName !== "string" || !profile.employeeName.trim()) return null;
    const sessions = Array.isArray(raw.sessions)
      ? raw.sessions
          .filter((row): row is TrainingSessionRow => {
            return (
              !!row &&
              typeof row === "object" &&
              typeof row.id === "string" &&
              typeof row.topic === "string" &&
              typeof row.staffName === "string" &&
              typeof row.trainerInitials === "string" &&
              typeof row.date === "string"
            );
          })
          .map((row) => ({ ...row }))
      : [];
    return {
      profile: {
        employeeName: profile.employeeName.trim(),
        position: typeof profile.position === "string" ? profile.position : "",
        startDate: typeof profile.startDate === "string" ? profile.startDate : "",
        email: typeof profile.email === "string" ? profile.email : "",
        phoneNumber: typeof profile.phoneNumber === "string" ? profile.phoneNumber : "",
      },
      sessions,
    };
  } catch {
    return null;
  }
}

export function parseStaffTrainingDocument(details: string): StaffTrainingDocument | null {
  return parseV2Record(details) ?? parseV1Record(details);
}

export function isTrainingRecordLog(tags: string[]): boolean {
  return tags.includes("training_record");
}

export function formatTrainingDate(value: string): string {
  if (!value.trim()) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

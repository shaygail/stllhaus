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

export type TrainingRecord = {
  employeeName: string;
  phoneNumber: string;
  position: string;
  startDate: string;
  topic: string;
  supervisor: string;
  trainingDate: string;
  notes: string;
};

const PREFIX = "TRAINING_RECORD_V1:";

export function serializeTrainingRecord(record: TrainingRecord): string {
  return `${PREFIX}${JSON.stringify(record)}`;
}

export function parseTrainingRecord(details: string): TrainingRecord | null {
  if (!details.startsWith(PREFIX)) return null;
  try {
    const raw = JSON.parse(details.slice(PREFIX.length)) as Partial<TrainingRecord>;
    if (
      typeof raw.employeeName !== "string" ||
      typeof raw.phoneNumber !== "string" ||
      typeof raw.position !== "string" ||
      typeof raw.startDate !== "string" ||
      typeof raw.topic !== "string" ||
      typeof raw.supervisor !== "string" ||
      typeof raw.trainingDate !== "string" ||
      typeof raw.notes !== "string"
    ) {
      return null;
    }
    return raw as TrainingRecord;
  } catch {
    return null;
  }
}

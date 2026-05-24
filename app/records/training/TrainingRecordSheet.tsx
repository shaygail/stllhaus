import type { StaffTrainingDocument } from "@/lib/training-records";
import { formatTrainingDate } from "@/lib/training-records";

const MIN_TABLE_ROWS = 10;

type Props = {
  document: StaffTrainingDocument;
};

export function TrainingRecordSheet({ document }: Props) {
  const { profile, sessions } = document;
  const displayRows = [...sessions];
  while (displayRows.length < MIN_TABLE_ROWS) {
    displayRows.push({
      id: `empty-${displayRows.length}`,
      topic: "",
      staffName: "",
      trainerInitials: "",
      date: "",
    });
  }

  return (
    <div className="training-record-sheet bg-white border border-stll-charcoal/10 p-6 sm:p-10 print:border-0 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div
          className="h-14 w-14 rounded-full bg-[#e8f0fa] border border-[#1e4f8a]/20 shrink-0"
          aria-hidden
        />
        <p className="text-[11px] leading-snug text-[#1e4f8a] bg-[#e8f0fa] border border-[#1e4f8a]/20 rounded-md px-3 py-2 max-w-xs print:text-[10px]">
          See the &apos;Training and competency&apos; card in SS&amp;S
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-[#1e4f8a] tracking-tight mb-1">
        Staff training records
      </h2>
      <p className="text-lg text-stll-charcoal mb-6">
        <span className="font-semibold">{profile.employeeName || "____________________"}</span>
        &apos;s training record
      </p>

      <p className="text-sm text-stll-charcoal leading-relaxed mb-8 max-w-3xl">
        Staff could include volunteers, family, friends, owner/operators, and managers, who may carry
        out food related tasks in your business. If you are a sole operator you do not need to keep
        training records.
      </p>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
        <ProfileField label="Position*" value={profile.position} />
        <ProfileField label="Start date*" value={formatTrainingDate(profile.startDate)} />
        <ProfileField label="Email*" value={profile.email} />
        <ProfileField label="Phone number*" value={profile.phoneNumber} />
      </div>

      <div className="overflow-x-auto border border-stll-charcoal/15">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e4f8a] text-white">
              <th className="py-3 px-3 text-xs font-semibold align-top w-[42%]">
                Topic
                <span className="block font-normal text-white/85 text-[10px] mt-0.5">
                  (Part of the plan that has been covered)
                </span>
              </th>
              <th className="py-3 px-3 text-xs font-semibold align-top w-[22%]">Staff&apos;s name</th>
              <th className="py-3 px-3 text-xs font-semibold align-top w-[18%]">Trainer initials</th>
              <th className="py-3 px-3 text-xs font-semibold align-top w-[18%]">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id} className="border-t border-stll-charcoal/15 min-h-[2.5rem]">
                <td className="py-3 px-3 text-sm text-stll-charcoal align-top">{row.topic || "\u00a0"}</td>
                <td className="py-3 px-3 text-sm text-stll-charcoal align-top">{row.staffName || "\u00a0"}</td>
                <td className="py-3 px-3 text-sm text-stll-charcoal align-top">{row.trainerInitials || "\u00a0"}</td>
                <td className="py-3 px-3 text-sm text-stll-charcoal align-top">
                  {row.date ? formatTrainingDate(row.date) : "\u00a0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-stll-muted italic">
        any items marked with a * are not required by law to record but you may find them useful
      </p>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-stll-charcoal mb-1">{label}</p>
      <div className="border-b border-stll-charcoal/30 pb-1 min-h-[1.75rem] text-sm text-stll-charcoal">
        {value || "\u00a0"}
      </div>
    </div>
  );
}

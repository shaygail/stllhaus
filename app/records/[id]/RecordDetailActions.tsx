"use client";

type DetailRow = {
  field: string;
  value: string;
};

type RecordDetailActionsProps = {
  formLabel: string;
  summary: string;
  enteredBy: string;
  date: string;
  detailRows: DetailRow[];
};

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsvContent(props: RecordDetailActionsProps): string {
  const headerRows = [
    ["Form", props.formLabel],
    ["Summary", props.summary],
    ["Entered By", props.enteredBy],
    ["Date", props.date],
  ];

  const detailRows = props.detailRows.map((row) => [row.field, row.value || ""]);
  const allRows = [...headerRows, [], ["Field", "Value"], ...detailRows];

  return allRows
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\n");
}

export function RecordDetailActions(props: RecordDetailActionsProps) {
  function onPrint() {
    window.print();
  }

  function onExportCsv() {
    const csvContent = buildCsvContent(props);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-details.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/20 text-stll-charcoal hover:border-stll-charcoal/40"
      >
        Print Form
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/20 text-stll-charcoal hover:border-stll-charcoal/40"
      >
        Export CSV
      </button>
    </div>
  );
}

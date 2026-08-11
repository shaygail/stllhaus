type PostgrestLikeError = {
  code?: string;
  message?: string;
  details?: string;
};

export function formatSupabaseAdminError(
  error: unknown,
  setupSqlPath: string
): { error: string; detail: string } {
  const row = error as PostgrestLikeError;
  const code = typeof row?.code === "string" ? row.code : "";
  const message =
    typeof row?.message === "string"
      ? row.message
      : error instanceof Error
        ? error.message
        : "save_failed";

  if (
    code === "PGRST205" ||
    message.includes("Could not find the table") ||
    message.includes("relation") && message.includes("does not exist")
  ) {
    return {
      error: "database_not_configured",
      detail: `Admin database tables are missing. In Supabase → SQL Editor, run the SQL in ${setupSqlPath}, then try saving again.`,
    };
  }

  if (code === "23505" || message.includes("duplicate key")) {
    return {
      error: "duplicate_entry",
      detail: "That record conflicts with an existing one (for example, two events with the same name and date). Change the details and try again.",
    };
  }

  return { error: message, detail: message };
}

import { getOrderingStatus } from "@/lib/ordering-settings-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Public: whether the menu accepts orders / pre-orders right now. */
export async function GET() {
  try {
    const { settings, ...status } = await getOrderingStatus();
    return NextResponse.json({
      ...status,
      settings: {
        orderingEnabled: settings.orderingEnabled,
        drinksOrderingEnabled: settings.drinksOrderingEnabled,
        blockOrdersWhenClosed: settings.blockOrdersWhenClosed,
        preOrderWhenClosed: settings.preOrderWhenClosed,
        useWeekdayWeekendSchedule: settings.useWeekdayWeekendSchedule,
        weekdayHours: settings.weekdayHours,
        weekendHours: settings.weekendHours,
        singleHours: settings.singleHours,
        closedDays: settings.closedDays,
        timezone: settings.timezone,
      },
    });
  } catch (e) {
    console.error("ordering-status", e);
    return NextResponse.json({ error: "ordering_status_unavailable" }, { status: 500 });
  }
}

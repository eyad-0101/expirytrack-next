import { differenceInDays, parseISO, format } from "date-fns";

export type ExpiryStatus = "expired" | "soon" | "warning" | "ok";

export function diffDays(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function statusOf(dateStr: string): ExpiryStatus {
  const d = diffDays(dateStr);
  if (d < 0) return "expired";
  if (d <= 7) return "soon";
  if (d <= 30) return "warning";
  return "ok";
}

export function fmtDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy");
}

export function fmtDaysLabel(d: number): string {
  if (d < 0) return `منذ ${Math.abs(d)} يوم`;
  if (d === 0) return "اليوم!";
  return `${d} يوم`;
}

export const STATUS_META: Record<
  ExpiryStatus,
  { label: string; text: string; border: string; card: string; ring: string; bar: string }
> = {
  expired: {
    label: "منتهي الصلاحية",
    text: "text-red-600",
    border: "border-red-600",
    card: "bg-red-50",
    ring: "ring-red-600",
    bar: "bg-red-600",
  },
  soon: {
    label: "ينتهي قريباً",
    text: "text-orange-600",
    border: "border-orange-600",
    card: "bg-orange-50",
    ring: "ring-orange-600",
    bar: "bg-orange-600",
  },
  warning: {
    label: "تحذير",
    text: "text-amber-700",
    border: "border-amber-700",
    card: "bg-amber-50",
    ring: "ring-amber-700",
    bar: "bg-amber-700",
  },
  ok: {
    label: "جيد",
    text: "text-brand-600",
    border: "border-brand-600",
    card: "bg-brand-50",
    ring: "ring-brand-600",
    bar: "bg-brand-600",
  },
};

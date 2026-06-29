import { differenceInDays, parseISO, format } from "date-fns";
import { ar } from "date-fns/locale";

export type ExpiryStatus = "expired" | "soon" | "warning" | "ok";

export function diffDays(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function statusOf(dateStr: string): ExpiryStatus {
  const d = diffDays(dateStr);
  if (d < 0)   return "expired";
  if (d <= 30)  return "soon";
  if (d <= 90) return "warning";
  return "ok";
}

export function fmtDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy", { locale: ar });
}

export function fmtDaysLabel(d: number): string {
  if (d < 0)  return `منذ ${Math.abs(d)} يوم`;
  if (d === 0) return "اليوم!";
  if (d === 1) return "غدًا";
  return `${d} يوم`;
}

export const STATUS_META: Record<
  ExpiryStatus,
  { label: string; text: string; border: string; card: string; ring: string; bar: string }
> = {
  expired: {
    label:  "منتهي الصلاحية",
    text:   "text-red-600",
    border: "border-red-500",
    card:   "bg-red-50",
    ring:   "ring-red-500",
    bar:    "bg-red-500",
  },
  soon: {
    label:  "ينتهي قريبًا",
    text:   "text-orange-600",
    border: "border-orange-500",
    card:   "bg-orange-50",
    ring:   "ring-orange-500",
    bar:    "bg-orange-500",
  },
  warning: {
    label:  "تحذير",
    text:   "text-amber-700",
    border: "border-amber-500",
    card:   "bg-amber-50",
    ring:   "ring-amber-500",
    bar:    "bg-amber-500",
  },
  ok: {
    label:  "جيد",
    text:   "text-brand-600",
    border: "border-brand-500",
    card:   "bg-brand-50",
    ring:   "ring-brand-500",
    bar:    "bg-brand-600",
  },
};

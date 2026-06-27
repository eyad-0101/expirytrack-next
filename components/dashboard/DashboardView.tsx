"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

import { listTracked, deleteTracked, type TrackedItem } from "@/lib/api-client";
import { statusOf, fmtDate, fmtDaysLabel, diffDays, STATUS_META } from "@/lib/expiry";

type Filter = "all" | "expired" | "soon" | "warning" | "ok";

export default function DashboardView() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery<TrackedItem[]>({
    queryKey: ["tracked"],
    queryFn: listTracked,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTracked(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracked"] });
      toast.success("تم حذف العنصر");
    },
    onError: () => toast.error("فشل حذف العنصر"),
  });

  const counts = useMemo(() => {
    const c = { expired: 0, soon: 0, warning: 0, ok: 0 };
    items.forEach((i) => c[statusOf(i.expiryDate)]++);
    return c;
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((i) => {
      const matchStatus = filter === "all" || statusOf(i.expiryDate) === filter;
      const matchSearch =
        !search ||
        i.product.name.toLowerCase().includes(search.toLowerCase()) ||
        i.product.barcode.includes(search);
      return matchStatus && matchSearch;
    });
  }, [items, filter, search]);

  const statusCards: {
    key: Filter;
    label: string;
    icon: typeof AlertTriangle;
    color: string;
  }[] = [
    { key: "expired", label: "منتهي الصلاحية", icon: AlertTriangle, color: "text-red-600" },
    { key: "soon",    label: "ينتهي قريبًا",   icon: Clock,          color: "text-orange-600" },
    { key: "warning", label: "تحذير",           icon: CalendarCheck,  color: "text-amber-700" },
    { key: "ok",      label: "جيد",             icon: CheckCircle,    color: "text-brand-600" },
  ];

  const handleDelete = (item: TrackedItem) => {
    if (confirm("هل تريد حذف هذا العنصر؟")) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">العناصر المتابعة</h1>
          <p className="mt-1 text-sm text-ink-500">
            {items.length === 0
              ? "لا توجد عناصر بعد"
              : `${items.length} عنصر في المتابعة`}
          </p>
        </div>
        <Link
          href="/add"
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:px-4"
        >
          + إضافة عنصر
        </Link>
      </div>

      {/* ── Status summary cards (2-col mobile → 4-col sm+) ───── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statusCards.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            aria-pressed={filter === key}
            className={`flex flex-col gap-1 rounded-xl border p-3 text-right transition-all sm:p-4 ${
              filter === key
                ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                : "border-ink-200 bg-white hover:border-brand-300 hover:shadow-sm"
            }`}
          >
            <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            <span className="text-[11px] text-ink-500 sm:text-xs">{label}</span>
            <span className={`text-xl font-bold sm:text-2xl ${color}`}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* ── Search + clear filter ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="بحث بالاسم أو الباركود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600 whitespace-nowrap hover:bg-ink-50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            مسح الفلتر
          </button>
        )}
      </div>

      {/* ── Items list ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-ink-400">
          جاري التحميل...
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-white py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <CheckCircle className="h-6 w-6 text-ink-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-ink-700">
            {items.length === 0 ? "لا توجد عناصر بعد" : "لا توجد نتائج لهذا الفلتر"}
          </p>
          {items.length === 0 && (
            <Link
              href="/add"
              className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
            >
              أضف أول عنصر →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: card list (hidden on md+) */}
          <div className="space-y-3 md:hidden">
            {visible.map((item) => {
              const status = statusOf(item.expiryDate);
              const meta = STATUS_META[status];
              const days = diffDays(item.expiryDate);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{item.product.name}</p>
                      {item.notes && (
                        <p className="mt-0.5 text-xs text-ink-400">{item.notes}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold badge-${status}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[11px] text-ink-400">تاريخ الانتهاء</p>
                      <p className="font-medium text-ink-700">{fmtDate(item.expiryDate)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-400">المتبقي</p>
                      <p className={`font-semibold ${meta.text}`}>{fmtDaysLabel(days)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-400">الكمية</p>
                      <p className="font-medium text-ink-700">{item.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleteMutation.isPending}
                      aria-label={`حذف ${item.product.name}`}
                      className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table (hidden on mobile) */}
          <div className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="border-b border-ink-200 bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-ink-700">المنتج</th>
                    <th className="px-4 py-3 font-semibold text-ink-700">تاريخ الانتهاء</th>
                    <th className="px-4 py-3 font-semibold text-ink-700">المتبقي</th>
                    <th className="px-4 py-3 font-semibold text-ink-700">الكمية</th>
                    <th className="px-4 py-3 font-semibold text-ink-700">الحالة</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {visible.map((item) => {
                    const status = statusOf(item.expiryDate);
                    const meta = STATUS_META[status];
                    const days = diffDays(item.expiryDate);
                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-ink-50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink-900">{item.product.name}</div>
                          {item.notes && (
                            <div className="mt-0.5 text-xs text-ink-400">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-700">{fmtDate(item.expiryDate)}</td>
                        <td className={`px-4 py-3 font-semibold ${meta.text}`}>
                          {fmtDaysLabel(days)}
                        </td>
                        <td className="px-4 py-3 text-ink-700">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold badge-${status}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deleteMutation.isPending}
                            aria-label={`حذف ${item.product.name}`}
                            className="invisible rounded p-1 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:visible disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

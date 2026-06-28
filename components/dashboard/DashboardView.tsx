"use client";

import { useState, useMemo, useRef, useCallback } from "react";
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

import { listTracked, deleteTracked, getMe, type TrackedItem } from "@/lib/api-client";
import { statusOf, fmtDate, fmtDaysLabel, diffDays, STATUS_META } from "@/lib/expiry";

/* ── SwipeableCard — mobile swipe-to-delete ─────────────────── */
const SWIPE_THRESHOLD = 80;
const SWIPE_SNAP = 120;

function SwipeableCard({
  children,
  onDelete,
  isDeleting,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const swipeXRef = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    // RTL: swipe LEFT-to-RIGHT reveals the delete button on the right
    const dx = e.touches[0].clientX - startX.current;
    // Clamp: allow up to SWIPE_SNAP, resist beyond that
    const clamped = Math.min(Math.max(0, dx), SWIPE_SNAP + 20);
    swipeXRef.current = clamped;
    setSwipeX(clamped);
  }, []);

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (swipeXRef.current >= SWIPE_THRESHOLD) {
      setSwipeX(SWIPE_SNAP);
      setOpen(true);
    } else {
      setSwipeX(0);
      setOpen(false);
    }
  }, []);

  const snapBack = useCallback(() => {
    setSwipeX(0);
    setOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (confirm("هل تريد حذف هذا العنصر؟")) {
      onDelete();
      snapBack();
    }
  }, [onDelete, snapBack]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action underneath the card — on the RIGHT for RTL */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-start rounded-xl transition-all duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ width: SWIPE_SNAP }}
      >
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="حذف"
          className="flex h-full w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
        >
          {isDeleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              حذف
            </>
          )}
        </button>
      </div>

      {/* Card that slides */}
      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={open ? snapBack : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Escape") snapBack();
        }}
        className="relative rounded-xl bg-white shadow-sm transition-[transform,box_shadow] duration-200 ease-out dark:bg-ink-800"
        style={{
          transform: `translateX(${swipeX}px)`,
          // Slight shadow increase as card slides
          boxShadow: swipeX > 0
            ? `${Math.min(swipeX, 8)}px 0 16px -4px rgba(0,0,0,0.08)`
            : undefined,
          touchAction: "pan-y",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {/* Subtle hint on first render — a tiny peek of red on the right edge (RTL) */}
      {!open && swipeX === 0 && (
        <div
          className="pointer-events-none absolute inset-y-2 right-0 w-1 rounded-full bg-red-400/30"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

type Filter = "all" | "expired" | "soon" | "warning" | "ok";

export default function DashboardView() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
  const isAdmin = me?.role === "admin";

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
    borderActive: string;
    ringActive: string;
  }[] = [
    { key: "expired", label: "منتهي الصلاحية", icon: AlertTriangle, color: "text-red-600", borderActive: "border-red-500", ringActive: "ring-2 ring-red-500/30" },
    { key: "soon",    label: "ينتهي قريبًا",   icon: Clock,          color: "text-orange-600", borderActive: "border-orange-500", ringActive: "ring-2 ring-orange-500/30" },
    { key: "warning", label: "تحذير",           icon: CalendarCheck,  color: "text-amber-700", borderActive: "border-amber-500", ringActive: "ring-2 ring-amber-500/30" },
    { key: "ok",      label: "جيد",             icon: CheckCircle,    color: "text-brand-600", borderActive: "border-brand-500", ringActive: "ring-2 ring-brand-500/30" },
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
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl dark:text-ink-100">العناصر المتابعة</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {items.length === 0
              ? "لا توجد عناصر بعد"
              : `${items.length} عنصر في المتابعة`}
          </p>
        </div>
        <Link
          href="/add"
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 sm:px-4"
        >
          + إضافة عنصر
        </Link>
      </div>

      {/* ── Status summary cards (2-col mobile → 4-col sm+) ───── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statusCards.map(({ key, label, icon: Icon, color, borderActive, ringActive }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            aria-pressed={filter === key}
            className={`relative flex flex-col gap-1 overflow-hidden rounded-xl border p-3 text-right transition-all duration-200 sm:p-4 ${
              filter === key
                ? `bg-white ${borderActive} ${ringActive}`
                : "border-ink-200 bg-white hover:border-ink-300 hover:shadow-md active:scale-[0.97] dark:border-ink-600 dark:bg-ink-800 dark:hover:border-ink-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
              {filter === key && (
                <span className={`h-1.5 w-1.5 rounded-full ${color.replace("text", "bg")}`} aria-hidden="true" />
              )}
            </div>
            <span className="text-[11px] text-ink-500 sm:text-xs dark:text-ink-400">{label}</span>
            <span className={`text-xl font-bold sm:text-2xl ${color}`}>{counts[key as Exclude<Filter, "all">]}</span>
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
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400"
        />
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600 whitespace-nowrap transition-all hover:bg-ink-50 hover:text-ink-800 active:scale-[0.97] dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-ink-200"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            مسح الفلتر
          </button>
        )}
      </div>

      {/* ── Items list ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-ink-400 dark:text-ink-500">
          جاري التحميل...
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-white py-16 text-center dark:border-ink-700 dark:bg-ink-800">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700">
            <CheckCircle className="h-6 w-6 text-ink-400 dark:text-ink-500" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-ink-700 dark:text-ink-300">
            {items.length === 0 ? "لا توجد عناصر بعد" : "لا توجد نتائج لهذا الفلتر"}
          </p>
          {items.length === 0 && (
            <Link
              href="/add"
              className="mt-3 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              أضف أول عنصر →
            </Link>
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Mobile: card list (hidden on md+) */}
          <div className="space-y-3 md:hidden">
            {visible.map((item) => {
              const status = statusOf(item.expiryDate);
              const meta = STATUS_META[status];
              const days = diffDays(item.expiryDate);
              return (
                <SwipeableCard
                  key={item.id}
                  onDelete={() => deleteMutation.mutate(item.id)}
                  isDeleting={deleteMutation.isPending}
                >
                  <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm dark:border-ink-700 dark:bg-ink-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink-900 dark:text-ink-100">{item.product.name}</p>
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-ink-400 line-clamp-1 dark:text-ink-500">{item.notes}</p>
                        )}
                        {isAdmin && item.userEmail && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-400 dark:text-ink-500">
                            <span>👤</span>
                            <span className="truncate">{item.userEmail}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold badge-${status}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-ink-50/50 p-3 text-sm dark:bg-ink-700/50">
                      <div>
                        <p className="text-[11px] text-ink-400 dark:text-ink-500">تاريخ الانتهاء</p>
                        <p className="font-medium text-ink-700 dark:text-ink-200">{fmtDate(item.expiryDate)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-400 dark:text-ink-500">المتبقي</p>
                        <p className={`font-semibold ${meta.text}`}>{fmtDaysLabel(days)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-400 dark:text-ink-500">الكمية</p>
                        <p className="font-medium text-ink-700 dark:text-ink-200">{item.quantity}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex-1 ml-3">
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${meta.bar}`}
                            style={{
                              width: `${
                                status === "expired"
                                  ? 100
                                  : status === "soon"
                                    ? 75
                                    : status === "warning"
                                      ? 40
                                      : 10
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwipeableCard>
              );
            })}
          </div>

          {/* Desktop: table (hidden on mobile) */}
          <div className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-800 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50">
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">المنتج</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">تاريخ الانتهاء</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">المتبقي</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">الكمية</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">الحالة</th>
                    {isAdmin && (
                      <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">أضافه</th>
                    )}
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                  {visible.map((item) => {
                    const status = statusOf(item.expiryDate);
                    const meta = STATUS_META[status];
                    const days = diffDays(item.expiryDate);
                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-ink-50/80 even:bg-ink-50/30 dark:hover:bg-ink-700/50 dark:even:bg-ink-700/30"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink-900 dark:text-ink-100">{item.product.name}</div>
                          {item.notes && (
                            <div className="mt-0.5 text-xs text-ink-400 line-clamp-1 dark:text-ink-500">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-700 dark:text-ink-300">{fmtDate(item.expiryDate)}</td>
                        <td className={`px-4 py-3 font-semibold ${meta.text}`}>
                          {fmtDaysLabel(days)}
                        </td>
                        <td className="px-4 py-3 text-ink-700 dark:text-ink-300">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold badge-${status}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-xs text-ink-500 dark:text-ink-400 max-w-[140px]">
                            <span className="truncate block" title={item.userEmail ?? ""}>
                              {item.userEmail ?? "—"}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Progress bar */}
                            <div className="w-16">
                              <div className="progress-track">
                                <div
                                  className={`progress-fill ${meta.bar}`}
                                  style={{
                                    width: `${
                                      status === "expired"
                                        ? 100
                                        : status === "soon"
                                          ? 75
                                          : status === "warning"
                                            ? 40
                                            : 10
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={deleteMutation.isPending}
                              aria-label={`حذف ${item.product.name}`}
                              className="invisible rounded-lg p-1.5 text-ink-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:visible group-hover:opacity-100 disabled:opacity-50 dark:text-ink-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

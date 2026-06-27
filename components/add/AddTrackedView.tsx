"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, X, Package } from "lucide-react";

import { listProducts, createTracked } from "@/lib/api-client";

export default function AddTrackedView() {
  const router = useRouter();
  const qc = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    barcode: string;
  } | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 50 }),
    enabled: search.length >= 1,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createMutation = useMutation({
    mutationFn: () =>
      createTracked({
        productId: selectedProduct!.id,
        expiryDate,
        quantity: parseInt(quantity) || 1,
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracked"] });
      toast.success("تمت الإضافة بنجاح");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message || "فشلت الإضافة"),
  });

  const canSubmit = !!selectedProduct && !!expiryDate && !createMutation.isPending;

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">إضافة عنصر للمتابعة</h1>
        <p className="mt-1 text-sm text-ink-500">اختر منتجًا وحدد تاريخ انتهاء صلاحيته</p>
      </div>

      {/*
       * Form card:
       *   mobile  → full width, smaller padding
       *   sm+     → capped at max-w-lg, larger padding
       */}
      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:max-w-lg sm:p-6">
        <div className="space-y-5">
          {/* ── Product picker ─────────────────────────────── */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-1.5 block text-sm font-medium text-ink-900"
            >
              المنتج <span className="text-red-500" aria-hidden="true">*</span>
            </label>

            {selectedProduct ? (
              <div className="flex items-center justify-between rounded-lg border border-brand-300 bg-brand-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-brand-800">{selectedProduct.name}</p>
                    <p className="text-xs text-brand-600">{selectedProduct.barcode}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSearch("");
                  }}
                  aria-label="إلغاء اختيار المنتج"
                  className="rounded p-1 text-brand-500 transition-colors hover:text-brand-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
                  {productsLoading ? (
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600"
                      aria-label="جاري البحث"
                    />
                  ) : (
                    <Search className="h-4 w-4 text-ink-400" aria-hidden="true" />
                  )}
                </div>
                <input
                  id="product-search"
                  type="search"
                  placeholder="ابحث عن منتج بالاسم أو الباركود..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => search && setDropdownOpen(true)}
                  autoComplete="off"
                  className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pe-10 ps-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />

                {dropdownOpen && search && products && (
                  <div
                    role="listbox"
                    aria-label="نتائج البحث"
                    className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-lg"
                  >
                    {products.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-ink-500">لا توجد نتائج</div>
                    ) : (
                      products.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          aria-selected="false"
                          onClick={() => {
                            setSelectedProduct({ id: p.id, name: p.name, barcode: p.barcode });
                            setDropdownOpen(false);
                            setSearch("");
                          }}
                          className="flex w-full flex-col px-4 py-2.5 text-right transition-colors hover:bg-brand-50"
                        >
                          <span className="text-sm font-medium text-ink-900">{p.name}</span>
                          <span className="text-xs text-ink-500">{p.barcode}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Expiry date ────────────────────────────────── */}
          <div>
            <label
              htmlFor="expiry-date"
              className="mb-1.5 block text-sm font-medium text-ink-900"
            >
              تاريخ انتهاء الصلاحية{" "}
              <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* ── Quantity ───────────────────────────────────── */}
          <div>
            <label
              htmlFor="quantity"
              className="mb-1.5 block text-sm font-medium text-ink-900"
            >
              الكمية
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* ── Notes ─────────────────────────────────────── */}
          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-ink-900"
            >
              ملاحظات
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="موقع التخزين، الدُفعة، أو أي تفاصيل مفيدة..."
              rows={3}
              className="w-full resize-none rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* ── Submit ────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => { if (canSubmit) createMutation.mutate(); }}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                جاري الإضافة...
              </span>
            ) : (
              "إضافة العنصر"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package } from "lucide-react";

import { listProducts } from "@/lib/api-client";

export default function CatalogView() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 200 }),
  });

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">الكتالوج</h1>
        <p className="mt-1 text-sm text-ink-500">تصفح المنتجات المتاحة للمتابعة</p>
      </div>

      {/* ── Search — full width on mobile, capped on sm+ ───────── */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
          {isLoading ? (
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600"
              aria-label="جاري التحميل"
            />
          ) : (
            <Search className="h-4 w-4 text-ink-400" aria-hidden="true" />
          )}
        </div>
        <input
          type="search"
          placeholder="ابحث بالاسم أو الباركود..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pe-10 ps-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:max-w-sm"
        />
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {products.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-ink-300" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-700">
            {input ? "لا توجد نتائج لهذا البحث" : "لا توجد منتجات في الكتالوج بعد"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-500">{products.length} منتج</p>
          {/* 1-col → 2-col sm → 3-col lg */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-ink-900">{product.name}</h3>
                  <p className="mt-0.5 text-xs text-ink-500">
                    باركود: <span className="font-mono">{product.barcode}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-600">
                    {Number(product.price).toFixed(2)} ج.م
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

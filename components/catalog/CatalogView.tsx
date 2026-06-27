"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, X, ArrowLeft } from "lucide-react";

import { listProducts, type Product } from "@/lib/api-client";

export default function CatalogView() {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput]           = useState("");
  const [search, setSearch]         = useState("");
  const [open, setOpen]             = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [selected, setSelected]     = useState<Product | null>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  // Reset highlight when results change
  useEffect(() => { setHighlighted(-1); }, [search]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 50 }),
    enabled: search.length >= 1,
  });

  const selectProduct = useCallback((p: Product) => {
    setSelected(p);
    setInput("");
    setSearch("");
    setOpen(false);
    setHighlighted(-1);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || products.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, products.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectProduct(products[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Highlight matched text
  function highlight(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-brand-100 text-brand-800 rounded px-0.5 dark:bg-brand-800 dark:text-brand-200">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl dark:text-ink-100">الكتالوج</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">تصفح المنتجات المتاحة للمتابعة</p>
      </div>

      {/* Search with dropdown */}
      <div ref={ref} className="relative sm:max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center z-10">
          {isLoading && input ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          ) : (
            <Search className="h-4 w-4 text-ink-400" />
          )}
        </div>

        {input && (
          <button
            type="button"
            onClick={() => { setInput(""); setOpen(false); setSelected(null); inputRef.current?.focus(); }}
            className="absolute inset-y-0 end-8 flex items-center px-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 z-10"
            aria-label="مسح البحث"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          placeholder="ابحث بالاسم أو الباركود..."
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => { if (input) setOpen(true); }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pe-16 ps-4 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400"
        />

        {/* Dropdown */}
        {open && input && (
          <div
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl animate-fade-in dark:border-ink-700 dark:bg-ink-800"
          >
            {/* Result count header */}
            {!isLoading && products.length > 0 && (
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2 dark:border-ink-700">
                <span className="text-xs text-ink-400 dark:text-ink-500">
                  {products.length} نتيجة{products.length === 50 ? " (الأولى 50)" : ""}
                </span>
                <span className="text-xs text-ink-400 dark:text-ink-500">↑↓ للتنقل · Enter للاختيار</span>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                      <div className="h-8 w-8 shrink-0 rounded-md skeleton" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-2/3 skeleton" />
                        <div className="h-3 w-1/3 skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <Package className="mb-2 h-8 w-8 text-ink-300 dark:text-ink-600" />
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-300">لا توجد نتائج</p>
                  <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">جرّب بحثًا مختلفًا</p>
                </div>
              ) : (
                <div className="divide-y divide-ink-50 dark:divide-ink-700/50">
                  {products.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={highlighted === i}
                      onClick={() => selectProduct(p)}
                      onMouseEnter={() => setHighlighted(i)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors ${
                        highlighted === i
                          ? "bg-brand-50 dark:bg-brand-900/40"
                          : "hover:bg-ink-50 dark:hover:bg-ink-700/50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                        highlighted === i ? "bg-brand-100 dark:bg-brand-800" : "bg-ink-100 dark:bg-ink-700"
                      }`}>
                        <Package className={`h-4 w-4 ${highlighted === i ? "text-brand-600 dark:text-brand-400" : "text-ink-500 dark:text-ink-400"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">
                          {highlight(p.name, input)}
                        </p>
                        <p className="font-mono text-xs text-ink-400 dark:text-ink-500">
                          {highlight(p.barcode, input)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {Number(p.price).toFixed(2)} ج.م
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected product detail card */}
      {selected && (
        <div className="animate-slide-up max-w-sm rounded-xl border border-brand-200 bg-brand-50 p-4 shadow-sm dark:border-brand-700 dark:bg-brand-900/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-800">
                <Package className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-brand-900 dark:text-brand-100">{selected.name}</p>
                <p className="font-mono text-xs text-brand-600 dark:text-brand-400">{selected.barcode}</p>
                <p className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-300">
                  {Number(selected.price).toFixed(2)} ج.م
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-100 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <a
            href="/add"
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            أضف هذا المنتج للمتابعة
          </a>
        </div>
      )}

      {/* Idle state — no search yet */}
      {!input && !selected && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 py-16 text-center dark:border-ink-700">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700">
            <Search className="h-6 w-6 text-ink-300 dark:text-ink-500" />
          </div>
          <p className="text-sm font-medium text-ink-700 dark:text-ink-300">ابحث عن منتج</p>
          <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">اكتب الاسم أو الباركود في حقل البحث أعلاه</p>
        </div>
      )}
    </div>
  );
}

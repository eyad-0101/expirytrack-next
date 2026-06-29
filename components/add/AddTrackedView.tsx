"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, X, Package, ScanBarcode } from "lucide-react";

import { listProducts, createTracked, type Product } from "@/lib/api-client";
import { BarcodeScanner } from "@/components/BarcodeScanner";

export default function AddTrackedView() {
  const router = useRouter();
  const qc = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput]             = useState("");
  const [search, setSearch]           = useState("");
  const [open, setOpen]               = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expiryDate, setExpiryDate]   = useState("");
  const [quantity, setQuantity]       = useState("1");
  const [notes, setNotes]             = useState("");
  const [showScanner, setShowScanner] = useState(false); // ← new

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setHighlighted(-1);
  }

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    setSelectedProduct(p);
    setInput("");
    setSearch("");
    setOpen(false);
    setHighlighted(-1);
  }, []);

  const clearProduct = useCallback(() => {
    setSelectedProduct(null);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Barcode detected → search by barcode text ──────────────
  const handleBarcode = useCallback(async (code: string) => {
    setShowScanner(false);
    toast.loading("جاري البحث عن المنتج...", { id: "barcode-search" });
    try {
      const results = await listProducts({ search: code, limit: 5 });
      toast.dismiss("barcode-search");
      if (results.length > 0) {
        selectProduct(results[0]);
        toast.success(`تم العثور على: ${results[0].name}`);
      } else {
        // No match — pre-fill the search input so user can search manually
        setInput(code);
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
        toast.error("لم يُعثر على المنتج، يمكنك البحث يدويًا");
      }
    } catch {
      toast.dismiss("barcode-search");
      toast.error("فشل البحث، حاول مجددًا");
    }
  }, [selectProduct]);

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

  function highlight(text: string, query: string) {
    if (!query) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
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
      {/* Barcode scanner overlay */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl dark:text-ink-100">إضافة عنصر للمتابعة</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">اختر منتجًا وحدد تاريخ انتهاء صلاحيته</p>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:max-w-lg sm:p-6 dark:border-ink-700 dark:bg-ink-800">
        <div className="space-y-6">

          {/* ── Product picker ─────────────────────────────── */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200"
            >
              المنتج <span className="text-red-500 dark:text-red-400">*</span>
            </label>

            {selectedProduct ? (
              <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-700 dark:bg-brand-900/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-800">
                    <Package className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">{selectedProduct.name}</p>
                    <p className="font-mono text-xs text-brand-600 dark:text-brand-400">{selectedProduct.barcode}</p>
                    <p className="mt-0.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                      {Number(selectedProduct.price).toFixed(2)} ج.م
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearProduct}
                  aria-label="إلغاء اختيار المنتج"
                  className="rounded-lg p-1.5 text-brand-500 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                {/* ── Search input row with scan button ── */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {/* trailing icons inside input */}
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
                        onClick={() => { setInput(""); setOpen(false); inputRef.current?.focus(); }}
                        className="absolute inset-y-0 end-8 flex items-center px-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 z-10"
                        aria-label="مسح"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <input
                      ref={inputRef}
                      id="product-search"
                      type="search"
                      role="combobox"
                      aria-expanded={open}
                      aria-controls="product-search-listbox"
                      aria-autocomplete="list"
                      aria-haspopup="listbox"
                      placeholder="ابحث عن منتج بالاسم أو الباركود..."
                      value={input}
                      onChange={(e) => { setInput(e.target.value); setOpen(true); }}
                      onFocus={() => { if (input) setOpen(true); }}
                      onKeyDown={onKeyDown}
                      autoComplete="off"
                      className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pe-16 ps-4 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400"
                    />
                  </div>

                  {/* ── Scan button ── */}
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    aria-label="مسح الباركود بالكاميرا"
                    title="مسح الباركود"
                    className="flex items-center justify-center rounded-xl border border-ink-200 bg-white px-3 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400 dark:hover:border-brand-500 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
                  >
                    <ScanBarcode className="h-5 w-5" />
                  </button>
                </div>

                {/* Dropdown */}
                {open && input && (
                  <div
                    id="product-search-listbox"
                    role="listbox"
                    aria-label="نتائج البحث"
                    className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl animate-fade-in dark:border-ink-700 dark:bg-ink-800"
                  >
                    {!isLoading && products.length > 0 && (
                      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2 dark:border-ink-700">
                        <span className="text-xs text-ink-400 dark:text-ink-500">
                          {products.length} نتيجة{products.length === 50 ? " (الأولى 50)" : ""}
                        </span>
                        <span className="text-xs text-ink-400 dark:text-ink-500">↑↓ للتنقل · Enter للاختيار</span>
                      </div>
                    )}

                    <div className="max-h-60 overflow-y-auto">
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
                                <Package className={`h-4 w-4 ${highlighted === i ? "text-brand-600 dark:text-brand-400" : "text-ink-400 dark:text-ink-500"}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">
                                  {highlight(p.name, input)}
                                </p>
                                <p className="font-mono text-xs text-ink-400 dark:text-ink-500">
                                  {highlight(p.barcode, input)}
                                </p>
                              </div>
                              <span className="shrink-0 text-xs font-semibold text-brand-600 dark:text-brand-400">
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
            )}
          </div>

          {/* ── Expiry date ── */}
          <div>
            <label htmlFor="expiry-date" className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">
              تاريخ انتهاء الصلاحية <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:focus:border-brand-400"
            />
          </div>

          {/* ── Quantity ── */}
          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">
              الكمية
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:focus:border-brand-400"
            />
          </div>

          {/* ── Notes ── */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">
              ملاحظات
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="موقع التخزين، الدُفعة، أو أي تفاصيل مفيدة..."
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400"
            />
          </div>

          {/* ── Submit ── */}
          <button
            type="button"
            onClick={() => { if (canSubmit) createMutation.mutate(); }}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
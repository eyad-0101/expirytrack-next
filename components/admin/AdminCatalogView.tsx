"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, Search, ScanBarcode } from "lucide-react";

import { createProduct, deleteProduct, updateProduct, listProducts, type Product } from "@/lib/api-client";
import { BarcodeScanner } from "@/components/BarcodeScanner";

type EditState = { barcode: string; name: string; price: string };

export default function AdminCatalogView() {
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EditState>({ barcode: "", name: "", price: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditState>({ barcode: "", name: "", price: "" });
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState<"form" | "edit">("form");

  useEffect(() => {
    const t = setTimeout(() => setSearch(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 1000 }),
  });

  const handleBarcode = (code: string) => {
    setShowScanner(false);
    if (scanTarget === "form") {
      setFormData((prev) => ({ ...prev, barcode: code }));
    } else {
      setEditData((prev) => ({ ...prev, barcode: code }));
    }
    toast.success("تم مسح الباركود");
  };

  const openScanner = (target: "form" | "edit") => {
    setScanTarget(target);
    setShowScanner(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createProduct({
        barcode: formData.barcode.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setFormData({ barcode: "", name: "", price: "" });
      setShowForm(false);
      toast.success("تمت إضافة المنتج");
    },
    onError: (e: Error) => toast.error(e.message || "فشلت الإضافة"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditState }) =>
      updateProduct(id, {
        barcode: data.barcode.trim(),
        name: data.name.trim(),
        price: parseFloat(data.price),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditingId(null);
      toast.success("تم تحديث المنتج");
    },
    onError: (e: Error) => toast.error(e.message || "فشل التحديث"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم حذف المنتج");
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditData({ barcode: p.barcode, name: p.name, price: String(p.price) });
  };

  const inputClass =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:focus:border-brand-400";

  return (
    <div className="space-y-6 px-1">
      {/* Scanner overlay */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink-900 sm:text-2xl dark:text-ink-100">إدارة المنتجات</h1>
          <p className="mt-0.5 text-xs text-ink-500 sm:text-sm dark:text-ink-400">إضافة وتحديث وحذف منتجات الكتالوج</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.97] dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="hidden sm:inline">{showForm ? "إلغاء" : "منتج جديد"}</span>
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm animate-fade-in sm:max-w-lg sm:p-5 dark:border-ink-700 dark:bg-ink-800">
          <h2 className="mb-4 text-base font-semibold text-ink-900 dark:text-ink-100">إضافة منتج جديد</h2>
          <div className="space-y-4">

            {/* Barcode */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">الباركود</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className={inputClass}
                  placeholder="6900000000000"
                />
                <button
                  type="button"
                  onClick={() => openScanner("form")}
                  aria-label="مسح الباركود"
                  className="flex shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white px-3 py-2 text-ink-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400 dark:hover:border-brand-500 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
                >
                  <ScanBarcode className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="اسم المنتج"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-200">السعر (ج.م)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={inputClass}
                placeholder="0.00"
              />
            </div>

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !formData.barcode.trim() ||
                !formData.name.trim() ||
                !formData.price
              }
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
          <Search className="h-4 w-4 text-ink-400" />
        </div>
        <input
          type="text"
          placeholder="بحث بالاسم أو الباركود..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pe-10 ps-4 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-brand-400 sm:max-w-sm"
        />
      </div>

      {/* Product list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-ink-400 dark:text-ink-500">
          جاري التحميل...
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-sm text-ink-500 dark:text-ink-400">
          {input ? "لا توجد نتائج" : "لا توجد منتجات بعد"}
        </div>
      ) : (
        <>
          {/* ── Mobile: card list (hidden on sm+) ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm dark:border-ink-700 dark:bg-ink-800"
              >
                {editingId === p.id ? (
                  /* Edit mode — stacked inputs */
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">الاسم</label>
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">الباركود</label>
                      <div className="flex gap-2">
                        <input
                          value={editData.barcode}
                          onChange={(e) => setEditData({ ...editData, barcode: e.target.value })}
                          className={inputClass + " font-mono"}
                        />
                        <button
                          type="button"
                          onClick={() => openScanner("edit")}
                          aria-label="مسح الباركود"
                          className="flex shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white px-3 text-ink-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400"
                        >
                          <ScanBarcode className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">السعر (ج.م)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => updateMutation.mutate({ id: p.id, data: editData })}
                        disabled={updateMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-brand-500"
                      >
                        <Check className="h-4 w-4" />
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 py-2 text-sm text-ink-600 dark:border-ink-600 dark:text-ink-300"
                      >
                        <X className="h-4 w-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900 dark:text-ink-100">{p.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-ink-500 dark:text-ink-400">{p.barcode}</p>
                      <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-400">
                        {Number(p.price).toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded-lg p-2 text-ink-400 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-500 dark:hover:bg-brand-900/50 dark:hover:text-brand-400"
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`حذف "${p.name}"؟`)) deleteMutation.mutate(p.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:text-ink-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Desktop: table (hidden on mobile) ── */}
          <div className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm sm:block dark:border-ink-700 dark:bg-ink-800">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50">
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">الاسم</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">الباركود</th>
                    <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">السعر (ج.م)</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-ink-50/80 even:bg-ink-50/30 dark:hover:bg-ink-700/50 dark:even:bg-ink-700/30"
                    >
                      {editingId === p.id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <input
                                value={editData.barcode}
                                onChange={(e) => setEditData({ ...editData, barcode: e.target.value })}
                                className={inputClass + " font-mono"}
                              />
                              <button
                                type="button"
                                onClick={() => openScanner("edit")}
                                aria-label="مسح الباركود"
                                className="flex shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white px-2 text-ink-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400"
                              >
                                <ScanBarcode className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editData.price}
                              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateMutation.mutate({ id: p.id, data: editData })}
                                disabled={updateMutation.isPending}
                                className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/50"
                                title="حفظ"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-700"
                                title="إلغاء"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-100">{p.name}</td>
                          <td className="px-4 py-3 font-mono text-ink-700 dark:text-ink-300">{p.barcode}</td>
                          <td className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">{Number(p.price).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <div className="invisible flex items-center gap-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                              <button
                                onClick={() => startEdit(p)}
                                className="rounded-lg p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-500 dark:hover:bg-brand-900/50 dark:hover:text-brand-400"
                                title="تعديل"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`حذف "${p.name}"؟`)) deleteMutation.mutate(p.id);
                                }}
                                disabled={deleteMutation.isPending}
                                className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:text-ink-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { listProducts, createTracked } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function AddTrackedView() {
  const router = useRouter();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const { data: products } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createTracked({
        productId: selectedProduct!,
        expiryDate,
        quantity: parseInt(quantity),
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracked"] });
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !expiryDate) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">متابعة عنصر جديد</h1>
        <p className="text-ink-500 mt-2">أضف منتجاً جديداً للمتابعة</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-6 p-6 rounded-lg border border-ink-200 bg-white"
      >
        {/* Product selection */}
        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">المنتج</label>
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
          />

          {search && products && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-ink-200 rounded-lg">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSelectedProduct(product.id);
                    setSearch("");
                  }}
                  className="w-full text-right px-4 py-2 hover:bg-brand-50 transition-colors"
                >
                  <div className="font-medium text-ink-900">{product.name}</div>
                  <div className="text-sm text-ink-500">{product.barcode}</div>
                </button>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="mt-2 p-3 bg-brand-50 rounded-lg text-brand-700">
              تم الاختيار: {products?.find((p) => p.id === selectedProduct)?.name}
            </div>
          )}
        </div>

        {/* Expiry date */}
        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">تاريخ انتهاء الصلاحية</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">الكمية</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف أي ملاحظات..."
            className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={!selectedProduct || !expiryDate || createMutation.isPending}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white"
        >
          {createMutation.isPending ? "جاري الإضافة..." : "إضافة العنصر"}
        </Button>
      </form>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProduct, deleteProduct, listProducts } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function AdminCatalogView() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ barcode: "", name: "", price: "" });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts({ limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProduct({
        barcode: formData.barcode,
        name: formData.name,
        price: parseFloat(formData.price),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setFormData({ barcode: "", name: "", price: "" });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">إدارة المنتجات</h1>
        <p className="text-ink-500 mt-2">إضافة وتحرير وحذف المنتجات</p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 hover:bg-brand-700 text-white"
        >
          {showForm ? "إلغاء" : "إضافة منتج جديد"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="max-w-lg space-y-4 p-6 rounded-lg border border-ink-200 bg-white"
        >
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1">الباركود</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-1">السعر</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
          >
            {createMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
          </Button>
        </form>
      )}

      <div className="p-6 rounded-lg border border-ink-200 bg-white">
        <h2 className="text-xl font-bold text-ink-900 mb-4">المنتجات</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">الباركود</th>
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">الاسم</th>
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">السعر</th>
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b border-ink-200 hover:bg-ink-50">
                  <td className="px-4 py-3 text-sm text-ink-900">{product.barcode}</td>
                  <td className="px-4 py-3 text-sm text-ink-900">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-ink-900">{product.price} ر.ي</td>
                  <td className="px-4 py-3 text-sm">
                    <Button
                      onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listProducts } from "@/lib/api-client";

export default function CatalogView() {

  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ["products", search],
    queryFn: () => listProducts({ search, limit: 100 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">الكتالوج</h1>
        <p className="text-ink-500 mt-2">تصفح المنتجات المتاحة</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900"
        />
      </div>

      <div className="p-6 rounded-lg border border-ink-200 bg-white">
        <h2 className="text-xl font-bold text-ink-900 mb-4">المنتجات</h2>
        {products && products.length === 0 ? (
          <p className="text-ink-500">لا توجد منتجات</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products?.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-lg border border-ink-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-ink-900">{product.name}</h3>
                <p className="text-sm text-ink-500 mt-1">الباركود: {product.barcode}</p>
                <p className="text-sm text-brand-600 font-semibold mt-2">{product.price} ر.ي</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


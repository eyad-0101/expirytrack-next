"use client";

export default function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">لوحة التحكم</h1>
        <p className="text-ink-500 mt-2">تتبع العناصر المنتهية والتحذيرات</p>
      </div>

      {/* Status cards placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-lg border border-ink-200 bg-white">
          <div className="text-sm font-medium text-ink-500">منتهي الصلاحية</div>
          <div className="text-2xl font-bold text-red-600 mt-2">0</div>
        </div>
        <div className="p-6 rounded-lg border border-ink-200 bg-white">
          <div className="text-sm font-medium text-ink-500">ينتهي قريباً</div>
          <div className="text-2xl font-bold text-orange-600 mt-2">0</div>
        </div>
        <div className="p-6 rounded-lg border border-ink-200 bg-white">
          <div className="text-sm font-medium text-ink-500">تحذير</div>
          <div className="text-2xl font-bold text-amber-700 mt-2">0</div>
        </div>
        <div className="p-6 rounded-lg border border-ink-200 bg-white">
          <div className="text-sm font-medium text-ink-500">جيد</div>
          <div className="text-2xl font-bold text-brand-600 mt-2">0</div>
        </div>
      </div>

      {/* Table placeholder */}
      <div className="p-6 rounded-lg border border-ink-200 bg-white">
        <h2 className="text-xl font-bold text-ink-900 mb-4">العناصر المتابعة</h2>
        <p className="text-ink-500">سيتم عرض جدول العناصر هنا...</p>
      </div>
    </div>
  );
}


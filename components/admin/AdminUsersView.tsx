"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X, ShieldCheck, UserRound } from "lucide-react";

import { deleteUser, listUsers, updateUser } from "@/lib/api-client";

export default function AdminUsersView() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<"user" | "admin">("user");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: "admin" | "user" }) =>
      updateUser(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
      toast.success("تم تحديث دور المستخدم");
    },
    onError: () => toast.error("فشل التحديث"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم حذف المستخدم");
    },
    onError: () => toast.error("فشل الحذف"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm text-ink-500">
          {users.length === 0 ? "لا يوجد مستخدمون" : `${users.length} مستخدم مسجّل`}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-ink-400">
            جاري التحميل...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-500">لا يوجد مستخدمون بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink-700">المستخدم</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">الدور</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-ink-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                          {user.role === "admin" ? (
                            <ShieldCheck className="h-4 w-4 text-brand-600" />
                          ) : (
                            <UserRound className="h-4 w-4 text-ink-500" />
                          )}
                        </div>
                        <span className="text-ink-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as "user" | "admin")}
                          className="rounded border border-ink-200 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                        >
                          <option value="user">مستخدم</option>
                          <option value="admin">مشرف</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-brand-100 text-brand-700"
                              : "bg-ink-100 text-ink-700"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <><ShieldCheck className="h-3 w-3" /> مشرف</>
                          ) : (
                            "مستخدم"
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateMutation.mutate({ id: user.id, role: editRole })}
                            disabled={updateMutation.isPending}
                            className="rounded p-1.5 text-brand-600 hover:bg-brand-50"
                            title="حفظ"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded p-1.5 text-ink-500 hover:bg-ink-100"
                            title="إلغاء"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="invisible flex items-center gap-1 group-hover:visible">
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setEditRole(user.role as "user" | "admin");
                            }}
                            className="rounded p-1.5 text-ink-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            title="تغيير الدور"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`حذف ${user.email}؟`)) deleteMutation.mutate(user.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

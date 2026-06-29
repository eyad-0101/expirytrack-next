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
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl dark:text-ink-100">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {users.length === 0 ? "لا يوجد مستخدمون" : `${users.length} مستخدم مسجّل`}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-ink-400 dark:text-ink-500">جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700">
              <UserRound className="h-6 w-6 text-ink-400 dark:text-ink-500" />
            </div>
            <p className="text-sm font-medium text-ink-700 dark:text-ink-300">لا يوجد مستخدمون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50">
                  <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">المستخدم</th>
                  <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">اسم المستخدم</th>
                  <th className="px-4 py-3 font-semibold text-ink-700 dark:text-ink-300">الدور</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                {users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-ink-50/80 even:bg-ink-50/30 dark:hover:bg-ink-700/50 dark:even:bg-ink-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-white">
                          <div className={`flex h-full w-full items-center justify-center rounded-full ${
                            user.role === "admin" ? "bg-brand-100 dark:bg-brand-900" : "bg-ink-100 dark:bg-ink-700"
                          }`}>
                            {user.role === "admin" ? (
                              <ShieldCheck className="h-4 w-4 text-brand-600" />
                            ) : (
                              <UserRound className="h-4 w-4 text-ink-500" />
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-ink-900 dark:text-ink-100">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                      {user.username ? (
                        <span className="font-mono text-sm">@{user.username}</span>
                      ) : (
                        <span className="text-xs text-ink-400 dark:text-ink-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as "user" | "admin")}
                          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:focus:border-brand-400"
                        >
                          <option value="user">مستخدم</option>
                          <option value="admin">مشرف</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-brand-100 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:ring-brand-700"
                              : "bg-ink-100 text-ink-700 ring-1 ring-ink-200 dark:bg-ink-700 dark:text-ink-300 dark:ring-ink-600"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <><ShieldCheck className="h-3 w-3" /> مشرف</>
                          ) : (
                            <><UserRound className="h-3 w-3" /> مستخدم</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateMutation.mutate({ id: user.id, role: editRole })}
                            disabled={updateMutation.isPending}                              className="rounded-lg p-1.5 text-brand-600 transition-all hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/50 dark:hover:text-brand-300"
                              title="حفظ"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}                              className="rounded-lg p-1.5 text-ink-500 transition-all hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-700"
                              title="إلغاء"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="invisible flex items-center gap-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setEditRole(user.role as "user" | "admin");
                            }}                              className="rounded-lg p-1.5 text-ink-400 transition-all hover:bg-brand-50 hover:text-brand-600 dark:text-ink-500 dark:hover:bg-brand-900/50 dark:hover:text-brand-400"
                              title="تغيير الدور"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`حذف ${user.email}؟`)) deleteMutation.mutate(user.id);
                            }}
                            disabled={deleteMutation.isPending}                              className="rounded-lg p-1.5 text-ink-400 transition-all hover:bg-red-50 hover:text-red-600 dark:text-ink-500 dark:hover:bg-red-950 dark:hover:text-red-400"
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

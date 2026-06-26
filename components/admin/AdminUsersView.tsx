"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteUser, listUsers, updateUser } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function AdminUsersView() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      updateUser(id, { role: role as "admin" | "user" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">إدارة المستخدمين</h1>
        <p className="text-ink-500 mt-2">إدارة أدوار المستخدمين</p>
      </div>

      <div className="p-6 rounded-lg border border-ink-200 bg-white">
        <h2 className="text-xl font-bold text-ink-900 mb-4">المستخدمون</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">البريد الإلكتروني</th>
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">الدور</th>
                <th className="px-4 py-2 text-sm font-semibold text-ink-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b border-ink-200 hover:bg-ink-50">
                  <td className="px-4 py-3 text-sm text-ink-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="px-2 py-1 rounded border border-ink-200"
                      >
                        <option value="user">مستخدم</option>
                        <option value="admin">مشرف</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-ink-100 text-ink-700"
                        }`}
                      >
                        {user.role === "admin" ? "مشرف" : "مستخدم"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm space-x-2">
                    {editingId === user.id ? (
                      <>
                        <Button
                          onClick={() =>
                            updateMutation.mutate({ id: user.id, role: editRole })
                          }
                          disabled={updateMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          حفظ
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          إلغاء
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            setEditingId(user.id);
                            setEditRole(user.role);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-brand-600"
                        >
                          تحرير
                        </Button>
                        <Button
                          onClick={() => deleteMutation.mutate(user.id)}
                          disabled={deleteMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          حذف
                        </Button>
                      </>
                    )}
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


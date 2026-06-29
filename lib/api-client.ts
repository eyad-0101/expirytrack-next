"use client";

// Typed wrappers around fetch for use with TanStack Query
const BASE = "";   // same origin; Next.js App Router routes are on /api

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Products ----
export type Product = { id: number; barcode: string; name: string; price: number };
export const listProducts = (params?: { search?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.limit)  qs.set("limit", String(params.limit));
  return apiFetch<Product[]>(`/api/products${qs.size ? `?${qs}` : ""}`);
};
export const createProduct   = (data: Omit<Product, "id">) =>
  apiFetch<Product>("/api/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct   = (id: number, data: Partial<Omit<Product, "id">>) =>
  apiFetch<Product>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteProduct   = (id: number) =>
  apiFetch<void>(`/api/products/${id}`, { method: "DELETE" });

// ---- Tracked ----
export type TrackedItem = {
  id: number; clerkUserId: string | null; productId: number;
  expiryDate: string; quantity: number; notes: string;
  userEmail?: string;
  userUsername?: string;
  product: Product;
};
export const listTracked     = () => apiFetch<TrackedItem[]>("/api/tracked");
export const createTracked   = (data: { productId: number; expiryDate: string; quantity: number; notes?: string }) =>
  apiFetch<TrackedItem>("/api/tracked", { method: "POST", body: JSON.stringify(data) });
export const updateTracked   = (id: number, data: Partial<{ productId: number; expiryDate: string; quantity: number; notes: string }>) =>
  apiFetch<TrackedItem>(`/api/tracked/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteTracked   = (id: number) =>
  apiFetch<void>(`/api/tracked/${id}`, { method: "DELETE" });

// ---- Users ----
export type DbUser = { id: number; email: string; role: string; clerkUserId: string | null; username: string | null };
export const getMe           = () => apiFetch<{ id: number; email: string; role: string; username: string | null }>("/api/me");
export const listUsers       = () => apiFetch<DbUser[]>("/api/users");
export const updateUser      = (id: number, data: { email?: string; role?: string }) =>
  apiFetch<DbUser>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteUser      = (id: number) =>
  apiFetch<void>(`/api/users/${id}`, { method: "DELETE" });

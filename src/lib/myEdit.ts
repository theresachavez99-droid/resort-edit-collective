import { useCallback, useEffect, useState } from "react";

/**
 * My Edit — the user's personal Resort Edit library.
 *
 * Two stores, both local-only for Phase 1:
 *   - LOOKS_KEY     editorial looks (the primary save object)
 *   - PRODUCTS_KEY  individual products (secondary)
 *
 * Every component reads/writes through the helpers below; no component
 * touches `localStorage` directly. When we move to authenticated storage
 * later, only this file changes.
 */

const LOOKS_KEY = "resort-edit:my-edit:looks";
const PRODUCTS_KEY = "resort-edit:my-edit:products";
const LEGACY_PRODUCTS_KEY = "resort-edit:saved"; // ids only, pre-MyEdit
const EVENT = "resort-edit:my-edit-changed";

export type SavedLook = {
  /** Stable key — usually the canonical URL */
  id: string;
  destination: string;
  activity: string;
  collection?: string;
  title: string;
  description?: string;
  image?: string;
  url: string;
  savedAt: number;
};

export type SavedProduct = {
  id: string;
  brand: string;
  name: string;
  retailer?: string;
  url?: string;
  image?: string;
  price?: string;
  category?: string;
  savedAt: number;
};

type AnalyticsEvent =
  | "save_look"
  | "unsave_look"
  | "view_my_edit"
  | "view_saved_look"
  | "shop_this_look_from_my_edit"
  | "save_product"
  | "unsave_product"
  | "click_saved_product";

function emit(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("resort-edit:analytics", {
        detail: { event, ...payload, timestamp: Date.now() },
      }),
    );
    const w = window as unknown as { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...payload, timestamp: Date.now() });
    }
  } catch {
    /* analytics is best-effort */
  }
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore quota errors */
  }
}

/* ----------------------------- Looks API ----------------------------- */

export function getSavedLooks(): SavedLook[] {
  const arr = readJSON<SavedLook[]>(LOOKS_KEY, []);
  return Array.isArray(arr) ? arr : [];
}

export function isLookSaved(id: string): boolean {
  return getSavedLooks().some((l) => l.id === id);
}

export function saveLook(look: Omit<SavedLook, "savedAt">, source?: string) {
  const cur = getSavedLooks();
  if (cur.some((l) => l.id === look.id)) return;
  const next: SavedLook[] = [{ ...look, savedAt: Date.now() }, ...cur];
  writeJSON(LOOKS_KEY, next);
  emit("save_look", {
    look_id: look.id,
    destination: look.destination,
    activity: look.activity,
    source,
  });
}

export function removeLook(id: string, source?: string) {
  const cur = getSavedLooks();
  const target = cur.find((l) => l.id === id);
  if (!target) return;
  writeJSON(
    LOOKS_KEY,
    cur.filter((l) => l.id !== id),
  );
  emit("unsave_look", {
    look_id: id,
    destination: target.destination,
    activity: target.activity,
    source,
  });
}

export function toggleLook(look: Omit<SavedLook, "savedAt">, source?: string) {
  if (isLookSaved(look.id)) removeLook(look.id, source);
  else saveLook(look, source);
}

/* --------------------------- Products API ---------------------------- */

function migrateLegacyProducts(): SavedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_PRODUCTS_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return [];
    return ids.flatMap((id: unknown): SavedProduct[] => {
      if (typeof id !== "string") return [];
      const [brand, name] = id.split("|");
      if (!brand || !name) return [];
      return [{ id, brand, name, savedAt: Date.now() }];
    });
  } catch {
    return [];
  }
}

export function getSavedProducts(): SavedProduct[] {
  const arr = readJSON<SavedProduct[] | null>(PRODUCTS_KEY, null);
  if (arr && Array.isArray(arr)) return arr;
  // Legacy migration — only once.
  const migrated = migrateLegacyProducts();
  if (migrated.length > 0) writeJSON(PRODUCTS_KEY, migrated);
  return migrated;
}

export function isProductSaved(id: string): boolean {
  return getSavedProducts().some((p) => p.id === id);
}

export function saveProduct(p: Omit<SavedProduct, "savedAt">, source?: string) {
  const cur = getSavedProducts();
  if (cur.some((x) => x.id === p.id)) return;
  writeJSON(PRODUCTS_KEY, [{ ...p, savedAt: Date.now() }, ...cur]);
  emit("save_product", { product_id: p.id, brand: p.brand, source });
}

export function removeProduct(id: string, source?: string) {
  const cur = getSavedProducts();
  const target = cur.find((p) => p.id === id);
  if (!target) return;
  writeJSON(
    PRODUCTS_KEY,
    cur.filter((p) => p.id !== id),
  );
  emit("unsave_product", { product_id: id, brand: target.brand, source });
}

export function toggleProduct(p: Omit<SavedProduct, "savedAt">, source?: string) {
  if (isProductSaved(p.id)) removeProduct(p.id, source);
  else saveProduct(p, source);
}

/* ----------------------------- Analytics ----------------------------- */

export function trackMyEditEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  emit(event, payload);
}

/* ------------------------------ Hooks -------------------------------- */

export function useMyEdit() {
  const [looks, setLooks] = useState<SavedLook[]>(() => getSavedLooks());
  const [products, setProducts] = useState<SavedProduct[]>(() => getSavedProducts());

  useEffect(() => {
    const refresh = () => {
      setLooks(getSavedLooks());
      setProducts(getSavedProducts());
    };
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    looks,
    products,
    count: looks.length + products.length,
    isLookSaved: useCallback((id: string) => looks.some((l) => l.id === id), [looks]),
    isProductSaved: useCallback((id: string) => products.some((p) => p.id === id), [products]),
  };
}
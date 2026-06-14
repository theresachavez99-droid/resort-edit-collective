import { useEffect, useState, useCallback } from "react";

/**
 * Lightweight "Saved" store — browser localStorage only, no login.
 * Items are keyed by a stable id (e.g. `${brand}|${item}`).
 * Components subscribe via a custom event broadcast on every change.
 */

const KEY = "resort-edit:saved";
const EVENT = "resort-edit:saved-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore quota errors */
  }
}

export function savedKey(brand: string, item: string): string {
  return `${brand}|${item}`;
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>(() => read());

  useEffect(() => {
    const refresh = () => setIds(read());
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    write(next);
  }, []);

  return { ids, count: ids.length, has, toggle };
}
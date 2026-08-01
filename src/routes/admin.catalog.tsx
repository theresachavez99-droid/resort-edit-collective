import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductVaultPanel } from "@/components/admin/ProductVaultPanel";
import { InventoryHealthPanel } from "@/components/admin/InventoryHealthPanel";

/**
 * /admin/catalog — the single inventory surface.
 *
 * Absorbs the former /admin/product-vault and /admin/inventory-health routes
 * as tabs: one product library, one health view over the same rows.
 */
export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Studio (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CatalogPage,
});

type Tab = "products" | "health";

function CatalogPage() {
  const [tab, setTab] = useState<Tab>("products");
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Studio
          </p>
          <h1 className="font-serif text-3xl">Catalog</h1>
        </div>
        <Link to="/admin" className="text-sm text-stone-500 underline">
          ← Studio
        </Link>
      </header>

      <nav className="flex gap-6 border-b border-stone-200">
        {([["products", "Product Library"], ["health", "Inventory Health"]] as Array<[Tab, string]>).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-2 text-[0.7rem] tracking-[0.24em] uppercase ${
                tab === key ? "border-b-2 border-ink text-ink" : "text-stone-500"
              }`}
            >
              {label}
            </button>
          ),
        )}
      </nav>

      {tab === "products" ? <ProductVaultPanel /> : <InventoryHealthPanel />}
    </main>
  );
}

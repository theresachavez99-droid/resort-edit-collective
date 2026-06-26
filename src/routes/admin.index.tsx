import { createFileRoute, Link } from "@tanstack/react-router";

/**
 * Founder admin hub.
 *
 * Information architecture (editorial production era):
 *   Primary workflow:  Review Queue → Look Studio → Product Library
 *   Maintenance:       Inventory Health
 *   Advanced / system: Product Vault, Image Repair, Founder Learning,
 *                      Stylist Engine, Brand Performance, Brands,
 *                      Editorial Library, Destination Moments,
 *                      Day Images, Subscribers, Yacht Day Pilot,
 *                      Editorial Collections.
 *
 * No backend functionality is removed. Routes still exist and remain
 * reachable; this page just hides development utilities from the
 * everyday founder flow.
 */
export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHub,
});

type NavItem = {
  label: string;
  to: string;
  description: string;
};

const PRIMARY: NavItem[] = [
  {
    label: "Review Queue",
    to: "/admin/editorial-review-queue",
    description:
      "Review newly created looks. Approve or reject. Final editorial QA before publishing.",
  },
  {
    label: "Look Studio",
    to: "/admin/look-studio",
    description:
      "Edit looks, replace products, update editorial copy, swap images, final styling.",
  },
  {
    label: "Product Library",
    to: "/admin/product-library",
    description:
      "Browse approved products and reuse them across looks. Avoid duplicate product creation.",
  },
];

const MAINTENANCE: NavItem[] = [
  {
    label: "Inventory Health",
    to: "/admin/inventory-health",
    description:
      "Sold out products, broken affiliate links, missing thumbnails, inventory issues.",
  },
];

const ADVANCED: NavItem[] = [
  {
    label: "Product Vault",
    to: "/admin/product-vault",
    description: "Raw imported affiliate inventory and staging products.",
  },
  {
    label: "Image Repair",
    to: "/admin/image-repair-queue",
    description: "Troubleshoot broken or missing product imagery.",
  },
  {
    label: "Founder Learning",
    to: "/admin/founder-learning",
    description: "Internal AI training tool. Not part of the everyday publishing workflow.",
  },
  {
    label: "Stylist Engine",
    to: "/admin/stylist-engine",
    description: "Editorial generation pipeline (dry run, founder review, production).",
  },
  {
    label: "Editorial Collections",
    to: "/admin/collections",
    description: "Internal review of stylist-engine output, pre-approval.",
  },
  {
    label: "Editorial Library",
    to: "/admin/editorial-library",
    description: "Reference imagery and editorial DNA.",
  },
  {
    label: "Destination Moments",
    to: "/admin/destination-moments",
    description: "Destination + moment configuration.",
  },
  {
    label: "Day Images",
    to: "/admin/day-images",
    description: "Per-day hero imagery management.",
  },
  {
    label: "Brands",
    to: "/admin/brands",
    description: "Brand registry, affinity, and curation tags.",
  },
  {
    label: "Brand Performance",
    to: "/admin/brand-performance",
    description: "Sourcing performance and brand ROI diagnostics.",
  },
  {
    label: "Yacht Day Pilot",
    to: "/admin/yacht-day-pilot",
    description: "Legacy hardened sourcing pilot.",
  },
  {
    label: "Subscribers",
    to: "/admin/subscribers",
    description: "Newsletter list management.",
  },
];

function AdminHub() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      <header className="space-y-2">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          Founder · Internal Only
        </p>
        <h1 className="font-serif text-3xl">Resort Edit Admin</h1>
        <p className="text-stone-600 text-sm max-w-xl">
          Editorial production workflow: Review Queue → Look Studio → Product Library → Publish.
        </p>
      </header>

      <Section title="Workflow" items={PRIMARY} emphasis />
      <Section title="Maintenance" items={MAINTENANCE} />
      <Section title="Advanced" items={ADVANCED} muted />
    </main>
  );
}

function Section({
  title,
  items,
  emphasis,
  muted,
}: {
  title: string;
  items: NavItem[];
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
        {title}
      </h2>
      <ul
        className={
          emphasis
            ? "grid gap-3 sm:grid-cols-3"
            : muted
              ? "grid gap-2 sm:grid-cols-2"
              : "grid gap-3"
        }
      >
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={
                emphasis
                  ? "block border border-ink bg-ink text-ivory p-4 hover:bg-ink/90 transition"
                  : muted
                    ? "block border border-stone-200 p-3 hover:border-stone-400 transition text-stone-700"
                    : "block border border-stone-300 p-4 hover:border-stone-500 transition"
              }
            >
              <div
                className={
                  emphasis
                    ? "text-sm tracking-[0.2em] uppercase"
                    : "text-sm font-medium"
                }
              >
                {item.label}
              </div>
              <div
                className={
                  emphasis
                    ? "text-[0.7rem] text-ivory/75 mt-1 leading-relaxed normal-case tracking-normal"
                    : "text-xs text-stone-500 mt-1 leading-relaxed"
                }
              >
                {item.description}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

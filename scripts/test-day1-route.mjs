import { readFileSync } from "node:fs";

const ROUTE = "/destinations/portofino/day-1-yacht-harbour-aperitivo";

const files = {
  home: readFileSync("src/routes/index.tsx", "utf8"),
  parentRoute: readFileSync("src/routes/destinations.tsx", "utf8"),
  dayRoute: readFileSync("src/routes/destinations.portofino.day-1-yacht-harbour-aperitivo.tsx", "utf8"),
};

const assertions = [
  [
    files.dayRoute.includes(`createFileRoute(\n  "${ROUTE}",\n)`),
    `Day 1 page route exists at ${ROUTE}`,
  ],
  [
    files.parentRoute.includes("<Outlet />") && files.parentRoute.includes(`from: "${ROUTE}"`),
    "Destinations parent route renders the Day 1 child route instead of swallowing it",
  ],
  [files.home.includes(`const DAY_1_FULL_EDIT_ROUTE = "${ROUTE}" as const;`), "Homepage has the canonical Day 1 route constant"],
  [files.home.includes("to={d.href}"), "Day card wrapper uses the day href"],
  [files.home.includes("data-route-card={d.n === \"1\" ? DAY_1_FULL_EDIT_ROUTE : undefined}"), "Card container is wired to Day 1 route"],
  [files.home.includes("data-route-image={d.n === \"1\" ? DAY_1_FULL_EDIT_ROUTE : undefined}"), "Hero image is wired to Day 1 route"],
  [files.home.includes("data-route-cta={d.n === \"1\" ? DAY_1_FULL_EDIT_ROUTE : undefined}"), "CTA text is wired to Day 1 route"],
  [files.home.includes("data-route-arrow={DAY_1_FULL_EDIT_ROUTE}"), "CTA arrow is wired to Day 1 route"],
  [files.home.includes("console.log(\"Opening Day 1 route:\", DAY_1_FULL_EDIT_ROUTE)"), "CTA click emits the Day 1 routing debug log"],
  [!files.home.includes('to="/destinations"') && !files.home.includes('href="/destinations"'), "Homepage has no direct /destinations target"],
];

const failures = assertions.filter(([passed]) => !passed).map(([, label]) => label);

if (failures.length > 0) {
  console.error("Day 1 route test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Day 1 route test passed: all Yacht Day card targets resolve to ${ROUTE}`);
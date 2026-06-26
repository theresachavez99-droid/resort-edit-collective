import { readFileSync, existsSync } from "node:fs";

// Day 1 retired — Yacht Day now lives at /portofino/yacht-day.
const NEW_ROUTE = "/portofino/yacht-day";
const LEGACY_DAY_ROUTES = [
  "src/routes/portofino.day-1.tsx",
  "src/routes/portofino.day-2.tsx",
  "src/routes/portofino.day-3.tsx",
  "src/routes/portofino.day-4.tsx",
  "src/routes/portofino.day-5.tsx",
];

const assertions = [
  [
    existsSync("src/routes/portofino.$moment.tsx"),
    "Canonical moment route file exists",
  ],
  ...LEGACY_DAY_ROUTES.map((f) => {
    const src = existsSync(f) ? readFileSync(f, "utf8") : "";
    return [
      src.includes("redirect(") && src.includes("/portofino/$moment"),
      `${f} is a redirect stub to /portofino/$moment`,
    ];
  }),
  [
    !existsSync("src/components/PortofinoDayPage.tsx"),
    "Legacy PortofinoDayPage.tsx has been removed",
  ],
  [
    readFileSync("public/_redirects", "utf8").includes("/portofino/day-1"),
    "_redirects covers legacy /portofino/day-* URLs",
  ],
];

const failures = assertions.filter(([ok]) => !ok).map(([, label]) => label);

if (failures.length > 0) {
  console.error("Moment route migration test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Moment route migration test passed: Yacht Day → ${NEW_ROUTE}`);

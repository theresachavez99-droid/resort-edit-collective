import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const form = readFileSync("src/components/NewsletterForm.tsx", "utf8");
const server = readFileSync("src/lib/subscribers.functions.ts", "utf8");

describe("newsletter capture — client form", () => {
  test("validates the address before calling the server", () => {
    expect(form).toContain("EMAIL_RE");
    expect(form).toContain("Please enter a valid email address.");
  });

  test("normalizes to lowercase so no duplicate contacts are created", () => {
    expect(form).toContain("raw.trim().toLowerCase()");
  });

  test("bounds the wait so a stalled request cannot look dead", () => {
    expect(form).toContain("withTimeout");
    expect(form).toContain("That took too long. Please try again.");
  });

  test("announces submitting, success and error states accessibly", () => {
    expect(form).toContain('aria-busy={isLoading}');
    expect(form).toContain('role="status"');
    expect(form).toContain('role="alert"');
    expect(form).toContain("Saving…");
  });

  test("confirms only on a successful server result", () => {
    expect(form).toContain("if (res.ok) {");
    expect(form).toContain("You're on the list.");
  });

  test("never tells a subscriber to check their inbox for an immediate email", () => {
    expect(form.toLowerCase()).not.toContain("check your inbox");
    expect(form.toLowerCase()).not.toContain("confirmation email");
  });
});

describe("newsletter capture — server function", () => {
  test("fails closed when the lookup errors", () => {
    expect(server).toContain("if (existingRes.error)");
    expect(server).toContain("return { ok: false, error: GENERIC_ERROR }");
  });

  test("does not claim success when reactivation fails", () => {
    expect(server).toContain("if (reactivate.error || !reactivate.data)");
  });

  test("treats a concurrent duplicate insert as success", () => {
    expect(server).toContain('insert.error.code === "23505"');
  });

  test("confirms persistence before returning ok", () => {
    expect(server).toContain('.select("id")');
    expect(server).toContain("if (!insert.data)");
  });

  test("records consent time and source", () => {
    expect(server).toContain("consent_at: nowIso");
    expect(server).toContain("consent_source");
  });

  test("never leaks backend error text to the public caller", () => {
    expect(server).toContain("const GENERIC_ERROR");
    expect(server).not.toContain("error: existingRes.error.message");
    expect(server).not.toContain("error: insert.error.message");
  });

  test("reports delivery honestly while no provider is configured", () => {
    expect(server).toContain("export const DELIVERY_CONFIGURED = false");
    expect(server).toContain("blocked_no_provider");
    expect(server).toContain("getNewsletterDeliveryStatus");
  });
});

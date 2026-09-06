import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy-rights")({
  head: () => ({
    meta: [
      { title: "Your Privacy Choices | Resort Edit" },
      {
        name: "description",
        content:
          "What Resort Edit stores about you, how service providers process technical data, and how to unsubscribe, request a copy of your information, or ask us to delete it.",
      },
      { property: "og:title", content: "Your Privacy Choices | Resort Edit" },
      {
        property: "og:description",
        content: "What we store, how it is used, and how to unsubscribe or request deletion.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/privacy-rights") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy-rights") }],
  }),
  component: PrivacyRightsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl md:text-3xl tracking-wide text-ink">{title}</h2>
      <div className="mt-3 h-px w-12 bg-gold" />
      <div className="mt-5 space-y-4 font-serif text-base md:text-lg leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  );
}

function PrivacyRightsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Legal</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">
        Your Privacy Choices
      </h1>
      <div className="mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 font-serif italic text-ink/70">Last updated: September 6, 2026</p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        The short version: the personal information we hold about readers is a newsletter address
        you chose to give us and any message you send us. Saved looks stay in your own browser, and
        our service providers process ordinary technical request data to run the site.
      </p>

      <Section title="What we store about you">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Your email address</strong>, only if you subscribed to The Next Edit, together
            with the date you subscribed and the page you subscribed from.
          </li>
          <li>
            <strong>Anything you email us</strong> at hello@resortedit.com, kept in our mailbox as
            correspondence.
          </li>
        </ul>
        <p>
          Separately, our hosting, content-delivery and database providers process technical request
          data — IP address, browser user agent, page requested and timestamp — to serve pages and
          keep the site secure.
        </p>
      </Section>

      <Section title="What stays on your own device">
        <p>
          Looks you save with the heart icon are stored in your browser's own local storage. They
          are never sent to us, so we cannot see them, and clearing your browser data removes them.
        </p>
      </Section>

      <Section title="Advertising and tracking">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            We do not run advertising here, and our published pages carry no advertising or
            audience-analytics tag that we control.
          </li>
          <li>
            We do not place advertising or profiling cookies of our own. Our hosting platform may run
            its own operational scripts, and the non-public preview environment we use while editing
            includes that platform's instrumentation script.
          </li>
          <li>We do not sell or rent newsletter subscriber lists.</li>
          <li>We do not ask you to create an account to read or shop.</li>
        </ul>
        <p>
          Because we operate no optional advertising or profiling tracking of our own today, there is
          no consent banner or opt-out toggle here. If that changes, this page changes with it, and
          any optional tracking will be off until you agree to it.
        </p>
      </Section>

      <Section title="When you leave our site">
        <p>
          Retailer and operator links open that company's own website, where their cookies, tracking
          and privacy policy apply, not ours. Some retailer links may earn us a commission — see our{" "}
          <Link to="/affiliate-disclosure" className="text-gold hover:underline">
            Affiliate Disclosure
          </Link>
          .
        </p>
        <p>
          Our hosting provider processes ordinary web-server request logs, as any website host does,
          to serve pages and keep the site secure.
        </p>
      </Section>

      <Section title="Unsubscribing">
        <p>
          Email us at{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">
            hello@resortedit.com
          </a>{" "}
          from the address you subscribed with and we will remove it. Once newsletter sending
          begins, every email will also carry a one-click unsubscribe link.
        </p>
      </Section>

      <Section title="Access, correction and deletion">
        <p>
          Write to{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">
            hello@resortedit.com
          </a>{" "}
          and tell us what you would like: a copy of what we hold, a correction, or deletion.
          We use the email address you write from to locate your record, and will only ask for
          further detail if we cannot identify it or need to confirm the request is genuine.
        </p>
        <p>
          If you are in the EEA, the UK, California, or another place with similar laws, these are
          the rights those laws give you, and you may also complain to your local data protection
          authority. We handle every request the same way regardless of where you live.
        </p>
      </Section>

      <Section title="More detail">
        <p>
          Our full{" "}
          <Link to="/privacy-policy" className="text-gold hover:underline">
            Privacy Policy
          </Link>{" "}
          covers retention, legal bases and third parties. To reach a person, use{" "}
          <Link to="/contact" className="text-gold hover:underline">
            Contact
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}

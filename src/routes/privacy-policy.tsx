import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "What Resort Edit collects — only a newsletter email address — what we do not track, how retailer links work, and how to access, correct or delete your information.",
      },
      {
        property: "og:title",
        content: "Privacy Policy | Resort Edit | Dressed for the destination",
      },
      {
        property: "og:description",
        content: "What Resort Edit collects, what we do not track, and the choices you have.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/privacy-policy") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy-policy") }],
  }),
  component: PrivacyPolicyPage,
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

function PrivacyPolicyPage() {
  const updated = "September 6, 2026";
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Legal</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">
        Privacy Policy
      </h1>
      <div className="mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 font-serif italic text-ink/70">Last updated: {updated}</p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        Resort Edit ("Resort Edit," "we," "us," or "our") is an independent editorial publication at
        resortedit.com. This policy describes what we actually do today — not what a publication of
        this kind might do. It is written to be accurate rather than broad, and we update it when
        our practices change.
      </p>

      <Section title="Information We Collect">
        <p>We keep this deliberately small:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Your email address</strong>, when you subscribe to The Next Edit. We store it
            with the date of your signup and the page it came from, so we know which edit you
            subscribed to.
          </li>
          <li>
            <strong>Anything you send us by email</strong> at hello@resortedit.com, which stays in
            our mailbox as ordinary correspondence.
          </li>
          <li>
            <strong>Standard web-server request logs</strong> kept by our hosting provider to
            deliver pages and protect the site — the same logs any website host records.
          </li>
        </ul>
        <p>
          We do not ask you to create an account, and we do not collect payment information, because
          nothing is sold on this site.
        </p>
      </Section>

      <Section title="What We Do Not Collect or Do">
        <ul className="list-disc pl-6 space-y-2">
          <li>We do not load advertising or analytics trackers on this site.</li>
          <li>We do not set advertising cookies or build reader profiles.</li>
          <li>We do not sell, rent or share personal information.</li>
          <li>We do not buy email lists or add anyone who did not subscribe.</li>
        </ul>
        <p>
          Because there is no optional tracking running, there is no cookie banner and no tracking
          opt-out to operate. If we ever add optional tracking, it will be off until you agree to it
          and this policy will say so first.
        </p>
      </Section>

      <Section title="Saved Looks Stay in Your Browser">
        <p>
          When you save a look, it is stored in your own browser's local storage. It is never sent
          to us — we cannot see your saved looks — and clearing your browser data removes them.
        </p>
      </Section>

      <Section title="Newsletter">
        <p>
          Subscribing stores your address so we can send curated editorial features, destination
          guides and shoppable edits. We are still setting up our sending service, so subscribing
          today records your consent rather than triggering an immediate email — you will not
          receive a confirmation message yet.
        </p>
        <p>
          You can ask to be removed at any time by emailing us, and once sending begins every email
          will also carry an unsubscribe link. We do not sell or rent subscriber lists.
        </p>
      </Section>

      <Section title="Retailer & Affiliate Links">
        <p>
          Some retailer links on this site may earn Resort Edit a commission if you buy something,
          at no additional cost to you. Many of our links earn nothing at all, and we do not claim
          membership of any affiliate network that has not accepted us.
        </p>
        <p>
          When you follow a link off this site, that company's own cookies, tracking and privacy
          policy apply — not ours — and any commission tracking happens on their side, not through
          code we run here. Editorial selections are made independently of commissions. Full detail
          is in our{" "}
          <Link to="/affiliate-disclosure" className="text-gold hover:underline">
            Affiliate Disclosure
          </Link>
          .
        </p>
      </Section>

      <Section title="Third Parties We Rely On">
        <p>We keep our suppliers to the minimum needed to publish:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Our website hosting and content delivery provider</li>
          <li>The hosted database service that stores newsletter signups</li>
          <li>Our email provider, for the mailbox at hello@resortedit.com</li>
        </ul>
        <p>
          Each receives only what it needs to perform its function and is bound by its own privacy
          terms. Retailers, hotels and tour operators we link to are independent companies; they
          receive nothing about you from us.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>You can ask us to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Tell you what we hold about you, or send you a copy of it</li>
          <li>Correct it</li>
          <li>Delete it, or unsubscribe you from the newsletter</li>
          <li>Stop processing it</li>
        </ul>
        <p>
          Email{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">
            hello@resortedit.com
          </a>{" "}
          from the address concerned and we will act on it. Practical detail is on our{" "}
          <Link to="/privacy-rights" className="text-gold hover:underline">
            Privacy Choices
          </Link>{" "}
          page.
        </p>
      </Section>

      <Section title="If You Are in the EEA or UK">
        <p>
          We process your email address on the basis of your consent, which you can withdraw at any
          time, and keep server logs on the basis of our legitimate interest in running a secure
          site. You may also complain to your local data protection authority. Our suppliers may
          process data outside your country under the safeguards in their own terms.
        </p>
      </Section>

      <Section title="If You Are in California">
        <p>
          You may ask what personal information we hold, request a copy, and request deletion.
          Resort Edit does not sell personal information and does not share it for cross-context
          behavioural advertising, so there is nothing for a "Do Not Sell or Share" opt-out to
          switch off. We will not treat you differently for making a request.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Subscriber addresses are kept until you unsubscribe or ask us to delete them. Emails you
          send us are kept as long as needed to deal with the matter. Server logs are retained for a
          short period by our host for security and diagnostics.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          Resort Edit is intended for an adult audience and is not directed to children under 16. We
          do not knowingly collect personal information from children.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We update this policy when our practices change, and revise the "Last updated" date above.
          Material changes will also be noted on the site.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, requests or corrections can be sent to{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">
            hello@resortedit.com
          </a>{" "}
          or through our{" "}
          <Link to="/contact" className="text-gold hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </Section>
    </div>
  );
}

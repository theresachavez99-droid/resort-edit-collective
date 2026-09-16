import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "What Resort Edit collects, how correspondence is handled, how service providers process technical data, how our aggregate outbound link counts work, and how to access, correct or delete your information.",
      },
      {
        property: "og:title",
        content: "Privacy Policy | Resort Edit | Dressed for the destination",
      },
      {
        property: "og:description",
        content: "What Resort Edit collects, how it is used, and the choices you have.",
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
  const updated = "September 16, 2026";
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
        resortedit.com. This policy describes our current practices and is updated when they
        change.
      </p>

      <Section title="Information We Collect">
        <p>The information we handle falls into these categories:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Anything you send us by email</strong> at hello@resortedit.com, which stays in
            our mailbox as ordinary correspondence.
          </li>
          <li>
            <strong>Technical request data</strong> — such as IP address, browser user agent,
            requested page and timestamp — processed by our hosting, content-delivery and database
            providers to serve pages, keep the site available and protect it against abuse. This is
            standard for any hosted website, and we do not use it to identify individual readers.
          </li>
        </ul>
        <p>
          There is currently no signup form, no newsletter form and no reader account on this site,
          and we do not collect payment information, because nothing is sold here.
        </p>
        <p>
          We still hold email addresses collected by an earlier version of this site, when it offered
          a signup form. Those records are not used to send anything, and you can ask us to delete
          yours at any time.
        </p>
      </Section>

      <Section title="Advertising, Analytics and Cookies">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            We do not run advertising on this site, and we do not place advertising or profiling
            cookies of our own.
          </li>
          <li>
            Our published pages do not include an advertising or audience-analytics tag that we
            control. Our hosting platform may run its own operational scripts for delivery,
            security and diagnostics, and non-public preview environments used while we edit the
            site include that platform's editing and instrumentation script.
          </li>
          <li>We do not buy, sell or rent email lists.</li>
        </ul>
        <p>
          Because we currently operate no optional advertising or profiling tracking of our own,
          there is no consent banner or tracking opt-out on this site. If we add optional tracking,
          it will be off until you agree to it and this policy will be updated first.
        </p>
      </Section>

      <Section title="How We Count Outbound Link Clicks">
        <p>
          When you use one of our hotel, restaurant, experience or shopping links, we add 1 to a
          daily total so we can see which recommendations are useful. Each total records only the
          date, a short internal name for the link, the section of the page it sat in, and the count.
        </p>
        <p>
          That counter stores no name, email address, IP address, device identifier or account, sets
          no cookie of its own, and cannot be traced back to you or to an individual visit. It also
          does not tell us whether you bought anything — sales information, if any, would come from
          the merchant's own reporting, not from this site.
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
          <li>The hosted database service behind the site, including our daily click counts</li>
          <li>Our email provider, for the mailbox at hello@resortedit.com</li>
        </ul>
        <p>
          Each receives only what it needs to perform its function and is bound by its own privacy
          terms and security obligations, and may process data outside your country under the
          safeguards in those terms. Brands, hotels and tour operators we link to are independent
          companies: we do not send them your email address or correspondence, though when you
          follow a link your own browser provides them with ordinary technical request data.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>You can ask us to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Tell you what we hold about you, or send you a copy of it</li>
          <li>Correct it</li>
          <li>Delete it, including any email address held from the earlier signup form</li>
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
          time, and technical request data is processed on the basis of our legitimate interest in
          running a secure, available site. You may also complain to your local data protection authority. Our suppliers may
          process data outside your country under the safeguards in their own terms.
        </p>
      </Section>

      <Section title="If You Are in California">
        <p>
          You may ask what personal information we hold, request a copy, and request deletion.
          Resort Edit does not sell personal information, and we do not operate cross-context
          behavioural advertising on this site, so there is currently nothing for a "Do Not Sell or
          Share" opt-out to switch off. We will not treat you differently for making a request.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Subscriber addresses are kept until you unsubscribe or ask us to delete them. Emails you
          send us are kept as long as needed to deal with the matter. Technical request data is
          retained by our hosting, content-delivery and database providers under their own retention
          schedules for operation and security.
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

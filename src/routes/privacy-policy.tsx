import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Resort Edit | Dressed for the destination" },
      { name: "description", content: "How Resort Edit collects, uses, and protects your information, including newsletter signups, affiliate links, cookies, and your rights under GDPR and CCPA." },
      { property: "og:title", content: "Privacy Policy | Resort Edit | Dressed for the destination" },
      { property: "og:description", content: "How Resort Edit collects, uses, and protects your information." },
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
  const updated = "May 31, 2026";
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Legal</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">Privacy Policy</h1>
      <div className="mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 font-serif italic text-ink/70">Last updated: {updated}</p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        Resort Edit ("Resort Edit," "we," "us," or "our") respects your privacy. This Privacy Policy explains what information we collect when you visit resortedit.com, how we use it, and the choices you have. By using the site, you agree to the practices described here.
      </p>

      <Section title="Information We Collect">
        <p>We collect limited information necessary to operate the site and deliver our editorial content:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Information you provide:</strong> your email address when you subscribe to The Next Edit, and any details you send us by email.</li>
          <li><strong>Information collected automatically:</strong> device, browser, referring page, pages visited, and approximate location derived from your IP address.</li>
          <li><strong>Information from partners:</strong> aggregated reporting from affiliate networks and analytics providers about clicks and conversions originating from Resort Edit.</li>
        </ul>
      </Section>

      <Section title="Newsletter & Email Collection">
        <p>
          When you subscribe to our newsletter, we use your email address to send curated editorial features, destination guides, and shoppable edits. You can unsubscribe at any time using the link in any email, and your address will be removed from active mailing lists.
        </p>
        <p>We do not sell or rent newsletter subscriber lists to third parties.</p>
      </Section>

      <Section title="Affiliate Links & Commissions">
        <p>
          Resort Edit participates in affiliate marketing programs, including but not limited to RewardStyle / LTK, ShopMy, Skimlinks, Amazon Associates, and direct retailer partnerships. When you click an affiliate link and make a purchase, we may earn a commission at no additional cost to you.
        </p>
        <p>
          Editorial selections are made independently. Commissions help fund the publication but do not influence what we choose to feature.
        </p>
      </Section>

      <Section title="Cookies & Analytics">
        <p>
          We and our partners use cookies, pixels, and similar technologies to remember preferences, measure traffic, and attribute affiliate clicks. This may include first-party analytics cookies and third-party tags from affiliate networks.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling cookies may affect how parts of the site function, including affiliate link tracking.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>We rely on trusted third parties to operate Resort Edit. Categories include:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email and newsletter delivery providers</li>
          <li>Web hosting and content delivery networks</li>
          <li>Analytics platforms</li>
          <li>Affiliate networks and retailer partners</li>
          <li>Social platforms (such as Instagram) when you interact with embedded content</li>
        </ul>
        <p>These providers receive only the information needed to perform their services and are bound by their own privacy policies.</p>
      </Section>

      <Section title="Your Rights">
        <p>Depending on where you live, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access, correct, or delete personal information we hold about you</li>
          <li>Withdraw consent or unsubscribe from marketing communications</li>
          <li>Object to or restrict certain processing of your information</li>
          <li>Request a portable copy of information you provided</li>
        </ul>
        <p>To exercise these rights, contact us at the email below.</p>
      </Section>

      <Section title="GDPR (European Economic Area & UK)">
        <p>
          If you are located in the EEA or UK, we process your personal data on the basis of your consent (newsletter subscriptions), our legitimate interests (operating and improving the site, measuring affiliate performance), or to comply with legal obligations. You have the right to lodge a complaint with your local data protection authority.
        </p>
      </Section>

      <Section title="CCPA (California Residents)">
        <p>
          California residents have the right to know what personal information we collect, to request deletion, and to opt out of the "sale" or "sharing" of personal information as defined by the CCPA/CPRA. Resort Edit does not sell personal information for monetary value. To submit a request, contact us using the details below.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain personal information only for as long as needed for the purposes described in this policy, to comply with legal obligations, resolve disputes, and enforce agreements. Newsletter subscriber data is kept until you unsubscribe or request deletion.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>Resort Edit is intended for an adult audience and is not directed to children under 16. We do not knowingly collect personal information from children.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date above and, where appropriate, by notice on the site.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, requests, or concerns about this Privacy Policy can be sent to{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">hello@resortedit.com</a>.
        </p>
      </Section>
    </div>
  );
}
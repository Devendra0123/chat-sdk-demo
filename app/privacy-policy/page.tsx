import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: April 13, 2026
            </p>

            <Section title="1. Introduction">
              <p>
                Welcome to our Automation System ("we", "our", "us"). We are
                committed to protecting your privacy and ensuring that your
                personal data is handled securely and responsibly.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Personal Information:</strong> Name, email address,
                  phone number, business details.
                </li>
                <li>
                  <strong>Usage Data:</strong> Messages, automation logs, device
                  info, IP address.
                </li>
                <li>
                  <strong>Third-Party Data:</strong> Data from integrations like
                  WhatsApp (messages, metadata, identifiers).
                </li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide and operate automation services</li>
                <li>Improve system performance</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </Section>

            <Section title="4. Data Sharing">
              <p>We do not sell your personal data.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Service providers (hosting, analytics)</li>
                <li>Integrated platforms (e.g., WhatsApp API)</li>
                <li>Legal requirements</li>
              </ul>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain your data only as long as necessary to provide services
                and comply with legal obligations.
              </p>
            </Section>

            <Section title="6. Data Security">
              <p>
                We use industry-standard measures such as encryption, secure APIs,
                and access control to protect your data.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your data</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent</li>
              </ul>
            </Section>

            <Section title="8. Third-Party Services">
              <p>
                Our system integrates with third-party services like WhatsApp.
                Their privacy policies apply separately.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                Our services are not intended for children under 13. We do not
                knowingly collect such data.
              </p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy. Changes will be reflected on
                this page.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                Email:{" "}
                <a
                  href="mailto:support@yourdomain.com"
                  className="text-primary underline"
                >
                  support@yourdomain.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://yourdomain.com"
                  className="text-primary underline"
                >
                  https://yourdomain.com
                </a>
              </p>
            </Section>

            <Section title="12. Consent">
              <p>
                By using our services, you agree to this Privacy Policy.
              </p>
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}
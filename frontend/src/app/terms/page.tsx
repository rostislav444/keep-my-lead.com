import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Keep My Lead",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1A1210] text-[#F5F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[#8a8a7a] hover:text-white mb-8 inline-block">&larr; Back to home</Link>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[#8a8a7a] mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#c5c5b5]">
          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Keep My Lead (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">2. Description of Service</h2>
            <p>Keep My Lead is an AI-powered platform that automates Instagram direct message responses and comment interactions for businesses. The Service connects to your Instagram account via the official Meta API to send and receive messages on your behalf.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">3. Account Requirements</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old to use the Service</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must have a valid Instagram Business or Creator account</li>
              <li>You must have the authority to connect the Instagram account(s) you use with our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Send spam, unsolicited messages, or bulk messaging</li>
              <li>Violate Instagram&apos;s Terms of Use or Community Guidelines</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Distribute illegal, harmful, or deceptive content</li>
              <li>Impersonate other individuals or entities</li>
              <li>Attempt to reverse-engineer or exploit the Service</li>
              <li>Use the Service for any illegal purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">5. AI-Generated Responses</h2>
            <p>The Service uses artificial intelligence to generate responses. While we strive for accuracy, AI-generated content may occasionally contain errors or inappropriate responses. You are ultimately responsible for all messages sent through your Instagram account and should monitor conversations regularly. You can take over any conversation manually at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">6. Pricing</h2>
            <p>The Service is currently in early access. Pricing details, including any usage-based fees, will be announced before the Service transitions to a paid model. You will be notified at least 30 days in advance and will not be charged without explicit consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">7. Your Content and Data</h2>
            <p className="mb-3">You retain ownership of all content you provide to the Service, including your product catalog, business information, and conversation data. You grant us a limited license to use this content solely to provide the Service.</p>
            <p>We process Instagram messages and data in accordance with our <Link href="/privacy" className="text-[#A0C9CB] hover:underline">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">8. Service Availability</h2>
            <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We are not liable for any downtime caused by Meta/Instagram API changes, maintenance, or force majeure events.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Keep My Lead shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to lost profits, lost leads, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">10. Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms, abuse the Service, or fail to pay subscription fees. Upon termination, your right to use the Service ceases immediately. You may request export of your data within 30 days of termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 14 days before taking effect. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2"><strong className="text-[#F5F5F0]">Email:</strong> support@keep-my-lead.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

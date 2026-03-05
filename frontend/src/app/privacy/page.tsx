import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Keep My Lead",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1A1210] text-[#F5F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-[#8a8a7a] hover:text-white mb-8 inline-block">&larr; Back to home</Link>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#8a8a7a] mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#c5c5b5]">
          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">1. Introduction</h2>
            <p>Keep My Lead (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the keep-my-lead.com website and the Keep My Lead platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">2. Information We Collect</h2>
            <p className="mb-3"><strong className="text-[#F5F5F0]">Account Information:</strong> When you register, we collect your name, email address, and password.</p>
            <p className="mb-3"><strong className="text-[#F5F5F0]">Instagram Data:</strong> When you connect your Instagram account, we receive your Instagram user ID, username, and an access token. We use this to send and receive messages on your behalf.</p>
            <p className="mb-3"><strong className="text-[#F5F5F0]">Conversation Data:</strong> We process messages received through Instagram DMs and comments to provide automated responses. This includes sender information, message content, and timestamps.</p>
            <p><strong className="text-[#F5F5F0]">Usage Data:</strong> We collect information about how you interact with our platform, including pages visited, features used, and performance metrics.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain our service, including automated Instagram messaging</li>
              <li>To process and manage your account</li>
              <li>To send lead notifications to your configured channels (e.g., Telegram)</li>
              <li>To improve our AI-powered conversation engine</li>
              <li>To communicate with you about your account and service updates</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">4. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-[#F5F5F0]">Meta/Instagram:</strong> To send and receive messages through the Instagram API</li>
              <li><strong className="text-[#F5F5F0]">Anthropic:</strong> Message content is processed by Claude AI to generate responses. No personal data is retained by Anthropic beyond the API request.</li>
              <li><strong className="text-[#F5F5F0]">Service providers:</strong> Hosting, analytics, and infrastructure providers that help us operate the platform</li>
              <li><strong className="text-[#F5F5F0]">Legal requirements:</strong> When required by law, regulation, or legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Conversation data is retained for up to 12 months. When you delete your account, we remove your personal data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted storage of access tokens, and regular security reviews. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Disconnect your Instagram account at any time</li>
              <li>Export your data in a portable format</li>
              <li>Object to processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">8. Instagram Data Deletion</h2>
            <p>You can request deletion of your Instagram data by removing the Keep My Lead app from your Instagram settings, or by contacting us directly. We will delete all associated data and provide a confirmation code.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">9. Cookies</h2>
            <p>We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">10. Children&apos;s Privacy</h2>
            <p>Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-3">12. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2"><strong className="text-[#F5F5F0]">Email:</strong> privacy@keep-my-lead.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

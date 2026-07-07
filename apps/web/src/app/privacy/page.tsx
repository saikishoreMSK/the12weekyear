import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · The 12 Week Year",
  description: "How The 12 Week Year collects, uses, and stores your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mt-1 text-xs">Last updated: 2026</p>

      <div className="mt-6 space-y-4 text-sm leading-6">
        <p>
          The 12 Week Year (&quot;the app&quot;) helps you plan quarters, track habits, and review
          your progress. This policy explains what we collect and how we use it.
        </p>

        <Section title="What we collect">
          Account details you provide: your name, email address, and timezone. Content you create:
          quarters, weekly goals, habits, habit completions, and weekly reviews.
        </Section>

        <Section title="How your data is used and stored">
          Your data is used only to provide the app&apos;s features to you. It is stored in our
          PostgreSQL database (hosted on Supabase) and served by our API (hosted on Render).
          Passwords are stored only as salted hashes — we never see your password. We use Resend
          solely to send verification and password-reset codes to your email.
        </Section>

        <Section title="What we do NOT do">
          We do not sell your data, show ads, or use third-party advertising or tracking. We do not
          share your data with third parties except the infrastructure providers above needed to run
          the service.
        </Section>

        <Section title="On-device data">
          The mobile app stores a copy of your data on your device so it works offline and opens
          quickly. This stays on your device and is cleared when you sign out or uninstall the app.
        </Section>

        <Section title="Data retention and deletion">
          Your data is kept while your account is active. You can request deletion of your account and
          associated data at any time by contacting us.
        </Section>

        <Section title="Children">
          The app is not directed to children under 13, and we do not knowingly collect their data.
        </Section>

        <Section title="Changes">
          We may update this policy; material changes will be reflected here with a new date.
        </Section>

        <Section title="Contact">
          Questions or deletion requests: support@the12weekyear.zentlify.com
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mt-2 text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · The 12 Week Year",
  description: "The terms for using The 12 Week Year.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground mt-1 text-xs">Last updated: 2026</p>

      <div className="mt-6 space-y-4 text-sm leading-6">
        <p>By creating an account and using The 12 Week Year, you agree to these terms.</p>

        <Section title="The service">
          The app lets you plan calendar quarters, set weekly goals, track daily habits, and write
          weekly reviews. We may add, change, or remove features over time.
        </Section>

        <Section title="Your account">
          You are responsible for keeping your login credentials secure and for the activity under
          your account. Provide accurate information when registering.
        </Section>

        <Section title="Acceptable use">
          Use the app only for lawful, personal goal-tracking. Don&apos;t attempt to disrupt, reverse
          engineer, or gain unauthorized access to the service or other users&apos; data.
        </Section>

        <Section title="Your content">
          Your goals, habits, and reviews are yours. You grant us only the permission needed to store
          and display them back to you as part of running the app.
        </Section>

        <Section title="No warranty">
          The app is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t
          guarantee it will be uninterrupted or error-free, and it is not a substitute for
          professional advice.
        </Section>

        <Section title="Limitation of liability">
          To the extent permitted by law, we are not liable for any indirect or consequential damages
          arising from your use of the app.
        </Section>

        <Section title="Termination">
          You may stop using the app and delete your account at any time. We may suspend accounts that
          violate these terms.
        </Section>

        <Section title="Contact">Questions about these terms: support@the12weekyear.zentlify.com</Section>
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

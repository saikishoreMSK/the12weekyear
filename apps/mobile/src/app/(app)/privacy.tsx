import { Text, View } from "react-native";

import { Screen } from "@/components/screen";

function H({ children }: { children: string }) {
  return <Text className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-50">{children}</Text>;
}
function P({ children }: { children: string }) {
  return <Text className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{children}</Text>;
}

export default function PrivacyScreen() {
  return (
    <Screen>
      <Text className="text-xs text-neutral-400">Last updated: 2026</Text>
      <P>
        Quarterly (&quot;the app&quot;) helps you plan quarters, track habits, and review your
        progress. This policy explains what we collect and how we use it.
      </P>

      <H>What we collect</H>
      <P>
        Account details you provide: your name, email address, and timezone. Content you create:
        quarters, weekly goals, habits, habit completions, and weekly reviews.
      </P>

      <H>How your data is used and stored</H>
      <P>
        Your data is used only to provide the app&apos;s features to you. It is stored in our
        PostgreSQL database (hosted on Supabase) and served by our API (hosted on Render). Passwords
        are stored only as salted hashes — we never see your password. We use Resend solely to send
        verification and password-reset codes to your email.
      </P>

      <H>What we do NOT do</H>
      <P>
        We do not sell your data, show ads, or use third-party advertising or tracking. We do not
        share your data with third parties except the infrastructure providers above needed to run
        the service.
      </P>

      <H>On-device data</H>
      <P>
        The app stores a copy of your data on your device so it works offline and opens quickly. This
        stays on your device and is cleared when you sign out or uninstall the app.
      </P>

      <H>Data retention and deletion</H>
      <P>
        Your data is kept while your account is active. You can request deletion of your account and
        associated data at any time by contacting us.
      </P>

      <H>Children</H>
      <P>The app is not directed to children under 13, and we do not knowingly collect their data.</P>

      <H>Changes</H>
      <P>We may update this policy; material changes will be reflected here with a new date.</P>

      <H>Contact</H>
      <P>Questions or deletion requests: support@the12weekyear.zentlify.com</P>
    </Screen>
  );
}

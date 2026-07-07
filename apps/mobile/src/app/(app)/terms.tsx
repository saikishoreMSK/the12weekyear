import { Text } from "react-native";

import { Screen } from "@/components/screen";

function H({ children }: { children: string }) {
  return <Text className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-50">{children}</Text>;
}
function P({ children }: { children: string }) {
  return <Text className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{children}</Text>;
}

export default function TermsScreen() {
  return (
    <Screen>
      <Text className="text-xs text-neutral-400">Last updated: 2026</Text>
      <P>By creating an account and using The 12 Week Year, you agree to these terms.</P>

      <H>The service</H>
      <P>
        The app lets you plan calendar quarters, set weekly goals, track daily habits, and write
        weekly reviews. We may add, change, or remove features over time.
      </P>

      <H>Your account</H>
      <P>
        You are responsible for keeping your login credentials secure and for the activity under your
        account. Provide accurate information when registering.
      </P>

      <H>Acceptable use</H>
      <P>
        Use the app only for lawful, personal goal-tracking. Don&apos;t attempt to disrupt, reverse
        engineer, or gain unauthorized access to the service or other users&apos; data.
      </P>

      <H>Your content</H>
      <P>
        Your goals, habits, and reviews are yours. You grant us only the permission needed to store
        and display them back to you as part of running the app.
      </P>

      <H>No warranty</H>
      <P>
        The app is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t guarantee
        it will be uninterrupted or error-free, and it is not a substitute for professional advice.
      </P>

      <H>Limitation of liability</H>
      <P>
        To the extent permitted by law, we are not liable for any indirect or consequential damages
        arising from your use of the app.
      </P>

      <H>Termination</H>
      <P>
        You may stop using the app and delete your account at any time. We may suspend accounts that
        violate these terms.
      </P>

      <H>Contact</H>
      <P>Questions about these terms: support@the12weekyear.zentlify.com</P>
    </Screen>
  );
}

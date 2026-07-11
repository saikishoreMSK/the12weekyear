import { Text } from "react-native";

import { Screen } from "@/components/screen";

function H({ children }: { children: string }) {
  return <Text className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-50">{children}</Text>;
}
function P({ children }: { children: string }) {
  return <Text className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{children}</Text>;
}

export default function HowToUseScreen() {
  return (
    <Screen>
      <P>
        Quarterly turns your year into four focused 12-week cycles — so you plan, execute, and see
        progress every week instead of drifting for months.
      </P>

      <H>Dashboard</H>
      <P>Your whole year at a glance — all four quarters and their scores. Tap one to plan or open it.</P>

      <H>Quarter</H>
      <P>Set an objective for the 12 weeks, add one focused goal per week, and watch your quarter score.</P>

      <H>Week</H>
      <P>Zoom into this week — tick off your weekly goal and see how each habit is going.</P>

      <H>Habits</H>
      <P>Check off your daily habits. The day fills green as you complete them, and your streak grows.</P>

      <H>Analytics</H>
      <P>Your streaks, a completion heatmap, and your best and worst days of the week.</P>

      <H>Your account</H>
      <P>
        Use everything with no account — your data stays on your device. Sign up from Profile any time
        to back it up and sync across your devices.
      </P>
    </Screen>
  );
}

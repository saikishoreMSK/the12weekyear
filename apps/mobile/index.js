// App entry. Registers the Android widget task handler (no-op on other platforms via the
// register.ts / register.android.ts split) before handing off to Expo Router.
import "./src/features/widgets/register";
import "expo-router/entry";

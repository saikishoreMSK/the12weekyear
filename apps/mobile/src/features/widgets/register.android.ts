import { registerWidgetTaskHandler } from "react-native-android-widget";

import { widgetTaskHandler } from "./task-handler";

// Register the headless widget renderer (Android only). Imported once from the app entry.
registerWidgetTaskHandler(widgetTaskHandler);

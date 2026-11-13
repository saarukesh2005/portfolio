import { financials } from "@/content/financials";
import { gallery } from "@/content/gallery";

/**
 * Apps whose content file is still empty. They are kept out of the dock,
 * Launchpad, Spotlight, the desktop and the terminal's `open` command, and
 * come back on their own once their data is filled in.
 *
 * Research is deliberately NOT in here. Hiding it meant a visitor who read
 * "equity research" in the bio went looking and found nothing at all, which
 * reads as "he does not do this". It stays visible and says what is coming.
 *
 * This lives in its own module because the app registry imports every app
 * component, so an app importing the registry back would be a cycle.
 */
export const HIDDEN_APPS: ReadonlySet<string> = new Set<string>([
  ...(financials === null ? ["numbers"] : []),
  ...(gallery.length === 0 ? ["photos"] : []),
]);

import { financials } from "@/content/financials";
import { gallery } from "@/content/gallery";
import { publishedResearch } from "@/content/research";

/**
 * Apps whose content file is still empty. They are kept out of the dock,
 * Launchpad, Spotlight, the desktop and the terminal's `open` command, and
 * come back on their own once their data is filled in.
 *
 * This lives in its own module because the app registry imports every app
 * component, so an app importing the registry back would be a cycle.
 */
export const HIDDEN_APPS: ReadonlySet<string> = new Set<string>([
  ...(financials === null ? ["numbers"] : []),
  ...(gallery.length === 0 ? ["photos"] : []),
  ...(publishedResearch().length === 0 ? ["research"] : []),
]);

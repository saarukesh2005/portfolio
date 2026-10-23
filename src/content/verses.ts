/**
 * ─────────────────────────────────────────────────────────────
 *  Verses for the Stickies note on the desktop.
 *
 *  Text is the World English Bible, which is public domain —
 *  NIV and ESV are copyrighted and restrict how much may be
 *  quoted on a public site, so they are deliberately not used.
 *  Every verse here was fetched from a WEB source rather than
 *  typed from memory.
 *
 *  Add or remove freely; the note picks one per day and the
 *  shuffle button walks the list.
 * ─────────────────────────────────────────────────────────────
 */

export type VerseTheme = "strength" | "courage" | "release" | "forgive";

export const VERSE_THEMES: Record<VerseTheme, string> = {
  strength: "Strength",
  courage: "Do not fear",
  release: "Leave it to God",
  forgive: "Forgiveness",
};

export type Verse = {
  theme: VerseTheme;
  ref: string;
  text: string;
  /** quoted from part of the verse, so the note shows a leading ellipsis */
  partial?: boolean;
};

export const verses: Verse[] = [
  { theme: "strength", ref: "Nehemiah 8:10", text: "Don’t be grieved, for the joy of Yahweh is your strength.", partial: true },
  { theme: "strength", ref: "Isaiah 40:31", text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint." },
  { theme: "strength", ref: "Philippians 4:13", text: "I can do all things through Christ, who strengthens me." },
  { theme: "strength", ref: "2 Corinthians 12:9", text: "My grace is sufficient for you, for my power is made perfect in weakness.", partial: true },
  { theme: "strength", ref: "Psalms 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { theme: "strength", ref: "Isaiah 41:10", text: "Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness." },
  { theme: "courage", ref: "Joshua 1:9", text: "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for Yahweh your God is with you wherever you go.”" },
  { theme: "courage", ref: "Deuteronomy 31:6", text: "Be strong and courageous. Don’t be afraid or scared of them; for Yahweh your God himself is who goes with you. He will not fail you nor forsake you.”" },
  { theme: "courage", ref: "Psalms 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me." },
  { theme: "courage", ref: "Isaiah 43:2", text: "When you pass through the waters, I will be with you; and through the rivers, they will not overflow you. When you walk through the fire, you will not be burned, and flame will not scorch you." },
  { theme: "courage", ref: "Psalms 27:1", text: "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?" },
  { theme: "courage", ref: "2 Timothy 1:7", text: "For God didn’t give us a spirit of fear, but of power, love, and self-control." },
  { theme: "release", ref: "Romans 12:19", text: "Don’t seek revenge yourselves, beloved, but give place to God’s wrath. For it is written, “Vengeance belongs to me; I will repay, says the Lord.”" },
  { theme: "release", ref: "Proverbs 20:22", text: "Don’t say, “I will pay back evil.” Wait for Yahweh, and he will save you." },
  { theme: "release", ref: "1 Peter 3:9", text: "not rendering evil for evil, or insult for insult; but instead blessing; knowing that to this were you called, that you may inherit a blessing." },
  { theme: "release", ref: "Leviticus 19:18", text: "You shall not take vengeance, nor bear any grudge against the children of your people; but you shall love your neighbor as yourself. I am Yahweh." },
  { theme: "release", ref: "Proverbs 24:29", text: "Don’t say, “I will do to him as he has done to me; I will render to the man according to his work.”" },
  { theme: "forgive", ref: "Matthew 6:14", text: "For if you forgive men their trespasses, your heavenly Father will also forgive you." },
  { theme: "forgive", ref: "Colossians 3:13", text: "bearing with one another, and forgiving each other, if any man has a complaint against any; even as Christ forgave you, so you also do." },
  { theme: "forgive", ref: "Ephesians 4:32", text: "And be kind to one another, tender hearted, forgiving each other, just as God also in Christ forgave you." },
  { theme: "forgive", ref: "Matthew 18:21-22", text: "Then Peter came and said to him, “Lord, how often shall my brother sin against me, and I forgive him? Until seven times?” Jesus said to him, “I don’t tell you until seven times, but, until seventy times seven." },
  { theme: "forgive", ref: "Luke 6:37", text: "Don’t judge, and you won’t be judged. Don’t condemn, and you won’t be condemned. Set free, and you will be set free." },
];

/**
 * The same verse for the whole day, rotating with the date, so a repeat
 * visit in the afternoon does not show something different from the
 * morning. Must be called after mount — a prerendered page would
 * otherwise bake in the build date and mismatch on hydration.
 */
export function verseOfTheDay(now: Date = new Date()): number {
  const days = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000
  );
  return ((days % verses.length) + verses.length) % verses.length;
}

/** Domain terminology. Rupee laws are never auto-translated. */

export type Term = {
  id: string;
  en: string;
  as: string;
  hi: string;
  law: boolean;
};

export const TERMS: Term[] = [
  { id: "cell", en: "cell", as: "কোষ", hi: "कोशिका", law: false },
  { id: "lot", en: "lot", as: "লট", hi: "लॉट", law: false },
  { id: "farmgate", en: "farmgate", as: "ফার্মগেট", hi: "फार्मगेट", law: false },
  { id: "remaining", en: "remaining grams", as: "অৱশিষ্ট গ্ৰাম", hi: "शेष ग्राम", law: true },
  { id: "journal", en: "journal", as: "জার্নেল", hi: "जर्नल", law: true },
  { id: "firewall", en: "AI cannot write rupees", as: "AI cannot write rupees", hi: "AI cannot write rupees", law: true },
  { id: "clerk", en: "clerk", as: "ক্লার্ক", hi: "क्लर्क", law: false },
  { id: "cover", en: "cover", as: "ক'ভাৰ", hi: "कवर", law: false },
];

export function neverTranslate(id: string): boolean {
  return TERMS.find((t) => t.id === id)?.law === true;
}

export function term(id: string, locale: "en" | "as" | "hi"): string {
  const t = TERMS.find((x) => x.id === id);
  if (!t) return id;
  if (t.law && locale !== "en") return t.en;
  return t[locale];
}

import type { CalendarLang } from "./myanmarCalendar";

export type UiText = {
  appName: string;
  eraKicker: string;
  sasanaLabel: string;
  monthLabel: string;
  dayLabel: string;
  yearUnit: string;
  prevMonthAria: string;
  nextMonthAria: string;
  monthAria: string;
  languageGroupAria: string;
  htmlLang: string;
};

/** App chrome strings; Mon is the primary UI language. */
export const uiText: Record<CalendarLang, UiText> = {
  mon: {
    appName: "ကြက္ကဒိန်မန်",
    eraKicker: "သက္ကရာဇ်ဍုၚ်",
    sasanaLabel: "သက္ကရာဇ် သာသနာ",
    monthLabel: "ဂိတု",
    dayLabel: "တ္ၚဲ",
    yearUnit: "သၞာံ",
    prevMonthAria: "ဂိတုပြင်",
    nextMonthAria: "ဂိတုဂတ",
    monthAria: "ဂိတု",
    languageGroupAria: "Language",
    htmlLang: "mnw",
  },
  my: {
    appName: "မြန်မာပြက္ခဒိန်",
    eraKicker: "သက္ကရာဇ်",
    sasanaLabel: "သာသနာနှစ်",
    monthLabel: "လ",
    dayLabel: "နေ့",
    yearUnit: "နှစ်",
    prevMonthAria: "ယခင်လ",
    nextMonthAria: "နောက်လ",
    monthAria: "လ",
    languageGroupAria: "Language",
    htmlLang: "my",
  },
};

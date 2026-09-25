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
  publicHolidayLabel: string;
  monCulturalLabel: string;
  religiousLabel: string;
  observanceLabel: string;
  officialSourceLabel: string;
  calculatedSourceLabel: string;
  calendarLegendAria: string;
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
    publicHolidayLabel: "တ္ၚဲကၟာတ်ရုၚ်",
    monCulturalLabel: "အခိုက်ကၞာမန်",
    religiousLabel: "သ္ဘၚ်အခိုက်ကၞာ",
    observanceLabel: "တ္ၚဲတၟေၚ်",
    officialSourceLabel: "စရၚ်သ္ပဒတန်",
    calculatedSourceLabel: "တော်ဆဂၠာဲလဝ်",
    calendarLegendAria: "တဆိပ်ဒဒှ်တ္ၚဲ",
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
    publicHolidayLabel: "အများပြည်သူ ရုံးပိတ်ရက်",
    monCulturalLabel: "မွန်ယဉ်ကျေးမှုနေ့",
    religiousLabel: "ဘာသာရေးနှင့် ပွဲတော်",
    observanceLabel: "အထိမ်းအမှတ်နေ့",
    officialSourceLabel: "တရားဝင်စာရင်း",
    calculatedSourceLabel: "ပြက္ခဒိန်တွက်ချက်မှု",
    calendarLegendAria: "ပြက္ခဒိန် အမှတ်အသားများ",
    htmlLang: "my",
  },
};

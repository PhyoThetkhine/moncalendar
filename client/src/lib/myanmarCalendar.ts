/**
 * Editorial Ledger design support: a compact Gregorian-to-Myanmar calendar
 * conversion module used by the clean bilingual day views.
 */

export type MoonPhase = "Waxing" | "Full moon" | "Waning" | "New moon";

/** UI language: Mon is the primary language, Myanmar (Burmese) the secondary. */
export type CalendarLang = "mon" | "my";

export type MyanmarDate = {
  yearType: number;
  year: number;
  monthNumber: number;
  month: string;
  day: number;
  phase: MoonPhase;
  fortnightDay: number;
  sabbath: "Sabbath" | "Sabbath eve" | null;
};

const monthNames: Record<number, string> = {
  0: "First Waso",
  1: "Tagu",
  2: "Kason",
  3: "Nayon",
  4: "Waso",
  5: "Wagaung",
  6: "Tawthalin",
  7: "Thadingyut",
  8: "Tazaungmon",
  9: "Nadaw",
  10: "Pyatho",
  11: "Tabodwe",
  12: "Tabaung",
  13: "Late Tagu",
  14: "Late Kason",
};

function westernToJdn(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function binarySearchOne(value: number, items: number[]) {
  let low = 0;
  let high = items.length - 1;
  while (high >= low) {
    const mid = Math.floor((low + high) / 2);
    if (items[mid] > value) high = mid - 1;
    else if (items[mid] < value) low = mid + 1;
    else return mid;
  }
  return -1;
}

function binarySearchTwo(value: number, items: number[][]) {
  let low = 0;
  let high = items.length - 1;
  while (high >= low) {
    const mid = Math.floor((low + high) / 2);
    if (items[mid][0] > value) high = mid - 1;
    else if (items[mid][0] < value) low = mid + 1;
    else return mid;
  }
  return -1;
}

function yearConstants(my: number) {
  let era: number;
  let watatOffset: number;
  let numberOfMonths: number;
  let fullMoonExceptions: number[][];
  let watatExceptions: number[];

  if (my >= 1312) {
    era = 3;
    watatOffset = -0.5;
    numberOfMonths = 8;
    fullMoonExceptions = [[1377, 1]];
    watatExceptions = [1344, 1345];
  } else if (my >= 1217) {
    era = 2;
    watatOffset = -1;
    numberOfMonths = 4;
    fullMoonExceptions = [[1234, 1], [1261, -1]];
    watatExceptions = [1263, 1264];
  } else if (my >= 1100) {
    era = 1.3;
    watatOffset = -0.85;
    numberOfMonths = -1;
    fullMoonExceptions = [[1120, 1], [1126, -1], [1150, 1], [1172, -1], [1207, 1]];
    watatExceptions = [1201, 1202];
  } else if (my >= 798) {
    era = 1.2;
    watatOffset = -1.1;
    numberOfMonths = -1;
    fullMoonExceptions = [[813, -1], [849, -1], [851, -1], [854, -1], [927, -1], [933, -1], [936, -1], [938, -1], [949, -1], [952, -1], [963, -1], [968, -1], [1039, -1]];
    watatExceptions = [];
  } else {
    era = 1.1;
    watatOffset = -1.1;
    numberOfMonths = -1;
    fullMoonExceptions = [[205, 1], [246, 1], [471, 1], [572, -1], [651, 1], [653, 2], [656, 1], [672, 1], [729, 1], [767, -1]];
    watatExceptions = [];
  }

  const fullMoonIndex = binarySearchTwo(my, fullMoonExceptions);
  if (fullMoonIndex >= 0) watatOffset += fullMoonExceptions[fullMoonIndex][1];

  return {
    era,
    watatOffset,
    numberOfMonths,
    watatException: binarySearchOne(my, watatExceptions) >= 0 ? 1 : 0,
  };
}

function calcWatat(my: number) {
  const solarYear = 1577917828 / 4320000;
  const lunarMonth = 1577917828 / 53433336;
  const epoch = 1954168.050623;
  const constants = yearConstants(my);
  const threshold = (solarYear / 12 - lunarMonth) * (12 - constants.numberOfMonths);
  let excessDays = (solarYear * (my + 3739)) % lunarMonth;
  if (excessDays < threshold) excessDays += lunarMonth;
  const fullMoon = Math.round(solarYear * my + epoch - excessDays + 4.5 * lunarMonth + constants.watatOffset);
  let watat = 0;
  if (constants.era >= 2) {
    if (excessDays >= lunarMonth - (solarYear / 12 - lunarMonth) * constants.numberOfMonths) watat = 1;
  } else {
    watat = Math.floor((((my * 7 + 2) % 19 + 19) % 19) / 12);
  }
  return { fullMoon, watat: watat ^ constants.watatException };
}

function calcMyanmarYear(my: number) {
  let yearsBack = 0;
  let prior = calcWatat(my - 1);
  const current = calcWatat(my);
  while (prior.watat === 0 && yearsBack < 2) {
    yearsBack += 1;
    prior = calcWatat(my - yearsBack - 1);
  }
  let yearType = current.watat;
  let fullMoon = 0;
  if (yearType) {
    const dayDifference = (current.fullMoon - prior.fullMoon) % 354;
    yearType = Math.floor(dayDifference / 31) + 1;
    fullMoon = current.fullMoon;
  } else {
    fullMoon = prior.fullMoon + 354 * (yearsBack + 1);
  }
  return { yearType, firstTagu: prior.fullMoon + 354 * (yearsBack + 1) - 102, fullMoon };
}

export function getMyanmarDate(date: Date): MyanmarDate {
  const jdn = westernToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const solarYear = 1577917828 / 4320000;
  const epoch = 1954168.050623;
  const my = Math.floor((jdn - 0.5 - epoch) / solarYear);
  const yearInfo = calcMyanmarYear(my);
  let dayCount = jdn - yearInfo.firstTagu + 1;
  const bigWatat = Math.floor(yearInfo.yearType / 2);
  const commonYear = Math.floor(1 / (yearInfo.yearType + 1));
  const yearLength = 354 + (1 - commonYear) * 30 + bigWatat;
  const lateMonth = Math.floor((dayCount - 1) / yearLength);
  dayCount -= lateMonth * yearLength;
  const adjustment = Math.floor((dayCount + 423) / 512);
  let month = Math.floor((dayCount - bigWatat * adjustment + commonYear * adjustment * 30 + 29.26) / 29.544);
  const shiftA = Math.floor((month + 12) / 16);
  const shiftB = Math.floor((month + 11) / 16);
  const day = dayCount - Math.floor(29.544 * month - 29.26) - bigWatat * shiftA + commonYear * shiftB * 30;
  month += shiftB * 3 - shiftA * 4 + 12 * lateMonth;
  const monthLength = 30 - (month % 2) + (month === 3 ? Math.floor(yearInfo.yearType / 2) : 0);
  const phaseIndex = Math.floor((day + 1) / 16) + Math.floor(day / 16) + Math.floor(day / monthLength);
  const phase: MoonPhase[] = ["Waxing", "Full moon", "Waning", "New moon"];
  const fortnightDay = day - 15 * Math.floor(day / 16);
  const sabbathDays = [8, 15, 23, monthLength];
  const sabbathEves = [7, 14, 22, monthLength - 1];

  return {
    yearType: yearInfo.yearType,
    year: my,
    monthNumber: month,
    month: monthNames[month] ?? "Myanmar month",
    day,
    phase: phase[phaseIndex],
    fortnightDay,
    sabbath: sabbathDays.includes(day) ? "Sabbath" : sabbathEves.includes(day) ? "Sabbath eve" : null,
  };
}

export function formatMyanmarDate(value: MyanmarDate) {
  const dayLabel = value.phase === "Full moon" || value.phase === "New moon" ? value.phase : `${value.phase} ${value.fortnightDay}`;
  return `${dayLabel} of ${value.month}`;
}

/**
 * Localized catalogs. Mon strings are transcribed from the supplied calendar
 * source; Myanmar (Burmese) strings come from the same source's translation
 * table (ceMmTranslate, index 1).
 */
type Localized<T> = Record<CalendarLang, T>;

const lunarMonthNames: Localized<Record<number, string>> = {
  mon: {
    0: "ဂိတုပ-ဒ္ဂိုန်",
    1: "ဂိတုစဲ",
    2: "ဂိတုပသာ်",
    3: "ဂိတုဇှေ်",
    4: "ဂိတုဒ္ဂိုန်",
    5: "ဂိတုခ္ဍဲသဳ",
    6: "ဂိတုဘတ်",
    7: "ဂိတုဝှ်",
    8: "ဂိတုက္ထိုန်",
    9: "ဂိတုမြေက္ကသဵု",
    10: "ဂိတုပှော်",
    11: "ဂိတုမာ်",
    12: "ဂိတုဖဝ်ရဂိုန်",
    13: "ဂိတုစဲ",
    14: "ဂိတုပသာ်",
  },
  my: {
    0: "ပထမ ဝါဆို",
    1: "တန်ခူး",
    2: "ကဆုန်",
    3: "နယုန်",
    4: "ဝါဆို",
    5: "ဝါခေါင်",
    6: "တော်သလင်း",
    7: "သီတင်းကျွတ်",
    8: "တန်ဆောင်မုန်း",
    9: "နတ်တော်",
    10: "ပြာသို",
    11: "တပို့တွဲ",
    12: "တပေါင်း",
    13: "ဒုတိယ တန်ခူး",
    14: "ဒုတိယ ကဆုန်",
  },
};

const weekdayNames: Localized<string[]> = {
  mon: ["တ္ၚဲအဒိုတ်", "တ္ၚဲစန်", "တ္ၚဲအင္ၚာ", "တ္ၚဲဗုဒ္ဓဝါ", "တ္ၚဲဗြဴဗတိ", "တ္ၚဲသိုက်", "တ္ၚဲသ္ၚိသဝ်"],
  my: ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"],
};

/** Compact labels for the calendar grid header. */
export const weekdayGridLabels: Localized<string[]> = {
  mon: ["အဒိုတ်", "စန်", "အင္ၚာ", "ဗုဒ္ဓဝါ", "ဗြဴဗတိ", "သိုက်", "သ္ၚိသဝ်"],
  my: ["တနွေး", "တလား", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"],
};

const gregorianMonths: Localized<string[]> = {
  mon: ["ဂျာန်နျူအာရဳ", "ဝှေဝ်ဗျူအာရဳ", "မာတ်ချ်", "ဨပြေယ်လ်", "မေ", "ဂျုန်", "ဂျူလာၚ်", "အဝ်ဂါတ်", "သိတ်ထီဗာ", "အံက်ထဝ်ဗာ", "နဝ်ဝါမ်ဗာ", "ဒီဇြေန်ဗာ"],
  my: ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"],
};

const phaseNames: Localized<Record<MoonPhase, string>> = {
  mon: { Waxing: "မံက်", "Full moon": "ပေၚ်", Waning: "စွေက်", "New moon": "အိုတ်" },
  my: { Waxing: "လဆန်း", "Full moon": "ပြည့်", Waning: "လဆုတ်", "New moon": "လကွယ်" },
};

const monDigits = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

/** Both languages share the Myanmar-block numerals. */
export function toMonNumerals(value: number | string) {
  return String(value).replace(/\d/g, (digit) => monDigits[Number(digit)]);
}

export function getMonWeekday(date: Date, lang: CalendarLang = "mon") {
  return weekdayNames[lang][date.getDay()];
}

export function getMonGregorianMonth(month: number, lang: CalendarLang = "mon") {
  return gregorianMonths[lang][month];
}

export function getMonMonth(value: MyanmarDate, lang: CalendarLang = "mon") {
  const prefix = value.yearType && value.monthNumber === 4 ? (lang === "my" ? "ဒုတိယ " : "ဒု") : "";
  return `${prefix}${lunarMonthNames[lang][value.monthNumber] ?? value.month}`;
}

export function getMonPhase(value: MyanmarDate, lang: CalendarLang = "mon") {
  return phaseNames[lang][value.phase];
}

export function formatMonDate(value: MyanmarDate, lang: CalendarLang = "mon") {
  const phase = getMonPhase(value, lang);
  const day = value.phase === "Waxing" || value.phase === "Waning" ? ` ${toMonNumerals(value.fortnightDay)}` : "";
  return `${getMonMonth(value, lang)} ${phase}${day}`;
}

export function formatMonGregorianDate(date: Date, lang: CalendarLang = "mon") {
  return `${getMonGregorianMonth(date.getMonth(), lang)} ${toMonNumerals(date.getDate())}၊ ${toMonNumerals(date.getFullYear())}`;
}

type MonCulturalEventRule = {
  id: string;
  name: Localized<string>;
  matches: (date: Date, value: MyanmarDate) => boolean;
};

/**
 * Source-backed Mon cultural date rules transcribed from ceMmDateTime.js in
 * the supplied ZIP. These are evaluated for each selected calendar day.
 */
const monCulturalEventRules: MonCulturalEventRule[] = [
  {
    id: "mon-youth-day",
    name: { mon: "တ္ၚဲသၟတ်မန်", my: "မွန်လူငယ်နေ့" },
    matches: (date) => date.getFullYear() >= 2017 && date.getMonth() === 11 && date.getDate() === 28,
  },
  {
    id: "mon-national-day",
    name: { mon: "တ္ၚဲကောန်ဂကူမန်", my: "မွန်အမျိုးသားနေ့" },
    matches: (_date, value) => value.year >= 1309 && value.monthNumber === 11 && value.day === 16,
  },
];

export function getMonCulturalEvents(date: Date, value: MyanmarDate, lang: CalendarLang = "mon") {
  return monCulturalEventRules.filter((event) => event.matches(date, value)).map((event) => event.name[lang]);
}

/**
 * Mon holidays ported from cal_holiday() and cal_holiday2() in ceMmDateTime.js
 * (https://conkyi.github.io/moncalendar/), using that source's official
 * Mon translations (ITVilla / Mikau Nyan).
 */
const THINGYAN_SOLAR_YEAR = 1577917828.0 / 4320000.0; // Mean solar year (365.2587565)
const THINGYAN_ME_ORIGIN = 1954168.050623; // Beginning of 0 ME
const THINGYAN_BEGIN_YEAR = 1100; // Start of Thingyan era
const THIRD_ERA = 1312;
const holidayNames: Record<string, Localized<string>> = {
  "new-year": { mon: "တ္ၚဲလှာဲသၞာံ", my: "မြန်မာနှစ်သစ်ကူး" },
  "new-year-jan": { mon: "တ္ၚဲလှာဲသၞာံ", my: "နှစ်သစ်ကူး" },
  "thingyan-akyo": { mon: "တ္ၚဲအတး ဒစး", my: "သင်္ကြန်အကြို" },
  "thingyan-akya": { mon: "တ္ၚဲအတး စှေ်", my: "သင်္ကြန်အကျ" },
  "thingyan-akyat": { mon: "တ္ၚဲအတး ကြာပ်", my: "သင်္ကြန်အကြတ်" },
  "thingyan-atat": { mon: "တ္ၚဲအတး တိုန်", my: "သင်္ကြန်အတက်" },
  "office-holiday": { mon: "တ္ၚဲမာတ်ရုင်", my: "ရုံးပိတ်ရက်" },
  independence: { mon: "တ္ၚဲသၠးပွး", my: "လွတ်လပ်ရေးနေ့" },
  "union-day": { mon: "တ္ၚဲကၟိန်ဍုၚ်", my: "ပြည်ထောင်စုနေ့" },
  "peasants-day": { mon: "တ္ၚဲသၟာဗ္ၚ", my: "တောင်သူလယ်သမားနေ့" },
  "resistance-day": { mon: "တ္ၚဲပၠန်ဂတးဗၟာ", my: "တော်လှန်ရေးနေ့" },
  "labour-day": { mon: "တ္ၚဲသၟာကမၠောန်", my: "အလုပ်သမားနေ့" },
  "martyrs-day": { mon: "တ္ၚဲအာဇာနဲ", my: "အာဇာနည်နေ့" },
  christmas: { mon: "တ္ၚဲခရေဿမာတ်", my: "ခရစ္စမတ်နေ့" },
  "aung-san-birthday": { mon: "တ္ၚဲသၟိၚ်ဗၟာ အံၚ်သာန်ဒှ်မၞိဟ်", my: "ဗိုလ်ချုပ်မွေးနေ့" },
  valentines: { mon: "တ္ၚဲဝုတ်ဗၠာဲ", my: "ချစ်သူများနေ့" },
  "april-fools": { mon: "တ္ၚဲသ္ပပရအ်", my: "April Fools" },
  "earth-day": { mon: "တ္ၚဲဂၠးကဝ်", my: "ကမ္ဘာမြေနေ့" },
  "red-cross-day": { mon: "တ္ၚဲဇိုၚ်ခ္ဍာ်ဍာဲ", my: "ကြက်ခြေနီနေ့" },
  "teachers-day": { mon: "တ္ၚဲကမ္ဘာ့အစာဂမၠိုင်", my: "ကမ္ဘာ့ဆရာများနေ့" },
  "un-day": { mon: "တ္ၚဲကုလသမ္မဂ္ဂ", my: "ကုလသမ္မဂ္ဂနေ့" },
  halloween: { mon: "တ္ၚဲဟေဝ်လဝ်ဝိန်", my: "ဟောလိုဝင်း" },
  easter: { mon: "တ္ၚဲထမြောက်ရာနေ့", my: "ထမြောက်ရာနေ့" },
  "good-friday": { mon: "တ္ၚဲသ္ၚိသဝ်ဇၞော်", my: "သောကြာနေ့ကြီး" },
  vesak: { mon: "တ္ၚဲသ္ဘၚ်ဖဍာ်ဇြဲ", my: "ကဆုန်လပြည့်နေ့" },
  "dhammacakka-day": { mon: "တ္ၚဲတွံဓဝ်ဓမ္မစက်", my: "ဓမ္မစကြာနေ့" },
  "lent-end": { mon: "တ္ၚဲအဘိဓရ်", my: "မီးထွန်းပွဲ" },
  tazaungdaing: { mon: "တ္ၚဲသ္ဘၚ်ပူဇဴပၟတ်ပၞာၚ်", my: "တန်ဆောင်တိုင်ပွဲ" },
  "national-day": { mon: "တ္ၚဲကောန်ဂကူ", my: "အမျိုးသားနေ့" },
  "karen-new-year": { mon: "တ္ၚဲကရေၚ်လှာဲသၞာံ", my: "ကရင်နှစ်သစ်ကူးနေ့" },
  "tabaung-pwe": { mon: "သ္ဘၚ်ဖဝ်ရဂိုန်", my: "တပေါင်းလပြည့်ပွဲ" },
  "shan-new-year": { mon: "တ္ၚဲသေံလှာဲသၞာံ", my: "ရှမ်းနှစ်သစ်ကူးနေ့" },
  "authors-day": { mon: "တ္ၚဲပြိုင်လိခ်", my: "စာဆိုတော်နေ့" },
  "mahathamaya-day": { mon: "တ္ၚဲမဟာသမယ", my: "မဟာသမယနေ့" },
  "garudhamma-day": { mon: "တ္ၚဲဂရုဓမ္မ", my: "ဂရုဓမ္မနေ့" },
  "mothers-day": { mon: "တ္ၚဲမိအံက်", my: "အမေများနေ့" },
  "fathers-day": { mon: "တ္ၚဲမအံက်", my: "အဖေများနေ့" },
  "metta-day": { mon: "တ္ၚဲမေတ္တာ", my: "မေတ္တာအခါတော်နေ့" },
  "taungpyone-pwe": { mon: "သ္ဘၚ်တောၚ်ပြုန်း", my: "တောင်ပြုန်းပွဲ" },
  "yadanagu-pwe": { mon: "သ္ဘၚ်ရတနာဂူ", my: "ရတနာဂူပွဲ" },
  "mon-revolution": { mon: "တ္ၚဲပၠန်ဂတးမန်", my: "မွန်တော်လှန်ရေးနေ့" },
  "mon-state-day": { mon: "တ္ၚဲဍုၚ်မန်", my: "မွန်ပြည်နယ်နေ့" },
};

function gregorianJDN(date: Date) {
  return westernToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function thingyanBounds(totalYear: number) {
  const atatTime = THINGYAN_SOLAR_YEAR * totalYear + THINGYAN_ME_ORIGIN; // Atat time
  const akyaTime = totalYear >= THIRD_ERA ? atatTime - 2.169918982 : atatTime - 2.1675; // Akya time
  return { akya: Math.round(akyaTime), atat: Math.round(atatTime) };
}

/** Date of Easter using the "Meeus/Jones/Butcher" algorithm, as JDN. */
function easterJDN(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const q = h + l - 7 * m + 114;
  const n = Math.floor(q / 31);
  return westernToJdn(year, n, (q % 31) + 1);
}

const isFullMoon = (value: MyanmarDate) => value.phase === "Full moon";

export function getMonHolidays(date: Date, value: MyanmarDate, lang: CalendarLang = "mon"): string[] {
  const ids: string[] = [];
  const jdn = gregorianJDN(date);
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const my = value.year;
  const mm = value.monthNumber;
  const md = value.day;

  // Thingyan (တ္ၚဲအတး) and Myanmar New Year
  if ((my + Math.floor(mm / 13)) >= THINGYAN_BEGIN_YEAR) {
    const { akya, atat } = thingyanBounds(my + Math.floor(mm / 13));
    if (jdn === atat + 1) ids.push("new-year");
    else if (jdn === atat) ids.push("thingyan-atat");
    else if (jdn > akya && jdn < atat) ids.push("thingyan-akyat");
    else if (jdn === akya) ids.push("thingyan-akya");
    else if (jdn === akya - 1) ids.push("thingyan-akyo");
    if (
      (my + Math.floor(mm / 13)) >= 1369 &&
      (my + Math.floor(mm / 13)) < 1379 &&
      (jdn === akya - 2 || (jdn >= atat + 2 && jdn <= akya + 7))
    )
      ids.push("office-holiday");
  }

  // Fixed Gregorian public holidays
  if (gm === 1 && gd === 1) ids.push("new-year-jan");
  else if (gy >= 1948 && gm === 1 && gd === 4) ids.push("independence");
  else if (gy >= 1947 && gm === 2 && gd === 12) ids.push("union-day");
  else if (gy >= 1958 && gm === 3 && gd === 2) ids.push("peasants-day");
  else if (gy >= 1945 && gm === 3 && gd === 27) ids.push("resistance-day");
  else if (gy >= 1923 && gm === 5 && gd === 1) ids.push("labour-day");
  else if (gy >= 1947 && gm === 7 && gd === 19) ids.push("martyrs-day");
  else if (gy >= 1752 && gm === 12 && gd === 25) ids.push("christmas");
  else if ((gy === 2017 && gm === 12 && gd === 30) || (gy >= 2017 && gm === 12 && gd === 31)) ids.push("office-holiday");
  if (gy >= 2017 && gm === 1 && gd === 2) ids.push("office-holiday"); // Day after New Year's (gazetted)

  if (gy >= 1915 && gm === 2 && gd === 13) ids.push("aung-san-birthday");
  if (gy >= 1969 && gm === 2 && gd === 14) ids.push("valentines");
  if (gy >= 1974 && gm === 3 && gd === 19) ids.push("mon-state-day"); // Mon State established
  if (gy >= 1392 && gm === 4 && gd === 1) ids.push("april-fools");
  if (gy >= 1970 && gm === 4 && gd === 22) ids.push("earth-day");
  if (gy >= 1948 && gm === 5 && gd === 8) ids.push("red-cross-day");
  if (gy >= 1994 && gm === 10 && gd === 5) ids.push("teachers-day");
  if (gy >= 1947 && gm === 10 && gd === 24) ids.push("un-day");
  if (gy >= 1753 && gm === 10 && gd === 31) ids.push("halloween");

  const doe = easterJDN(gy);
  if (gy >= 1876 && jdn === doe) ids.push("easter");
  else if (gy >= 1876 && jdn === doe - 2) ids.push("good-friday");

  // Holidays on the Myanmar calendar (mp===1 → full moon).
  // Office closures around Thadingyut/Tazaungdaing follow the modern gazette
  // pattern: the day(s) AFTER the full moon.
  if (mm === 2 && isFullMoon(value)) ids.push("vesak"); // Vesak
  else if (mm === 4 && isFullMoon(value)) ids.push("dhammacakka-day"); // Start of Buddhist Lent
  else if (mm === 7 && isFullMoon(value)) ids.push("lent-end"); // End of Buddhist Lent
  else if (my >= 1379 && mm === 7 && (md === 16 || md === 17)) ids.push("office-holiday");
  else if (mm === 8 && isFullMoon(value)) ids.push("tazaungdaing"); // Tazaungdaing
  else if (my >= 1379 && mm === 8 && md === 16) ids.push("office-holiday");
  else if (my >= 1282 && mm === 8 && md === 25) ids.push("national-day"); // National Day (Tazaungmone 10th waning)
  else if (mm === 10 && md === 1) ids.push("karen-new-year"); // Karen New Year
  else if (mm === 12 && isFullMoon(value)) ids.push("tabaung-pwe"); // Tabaung Pwe

  // Mon Revolution Day – the revolt began on the Wagaung full moon of 1310 ME
  // (19 August 1948); commemorated on every Wagaung full moon since.
  if (mm === 5 && isFullMoon(value) && my >= 1310) ids.push("mon-revolution");

  // Other observances on the Myanmar calendar
  if (mm === 9 && md === 1) {
    ids.push("shan-new-year"); // Shan New Year
    if (my >= 1306) ids.push("authors-day"); // Authors' Day
  }
  if (mm === 3 && isFullMoon(value)) ids.push("mahathamaya-day");
  else if (mm === 6 && isFullMoon(value)) ids.push("garudhamma-day");
  else if (my >= 1356 && mm === 10 && isFullMoon(value)) ids.push("mothers-day");
  else if (my >= 1370 && mm === 12 && isFullMoon(value)) ids.push("fathers-day");
  else if (mm === 5 && isFullMoon(value)) ids.push("metta-day");
  else if (mm === 5 && md === 10) ids.push("taungpyone-pwe");
  else if (mm === 5 && md === 23) ids.push("yadanagu-pwe");

  return ids.map((id) => holidayNames[id][lang]);
}

/** Mon names transcribed from the source; Myanmar names from its translation table. */
const statusNames: Record<CalendarLang, Record<string, string>> = {
  mon: {
    sabbathEve: "တ္ၚဲတိၚ်",
    sabbath: "တ္ၚဲသဳ",
    yatyaza: "တ္ၚဲရာဇာ",
    pyathada: "တ္ၚဲပြာဗ္ဗဒါ",
    thamanyo: "တ္ၚဲကိုန်ဟုံဗြမ်",
    amyeittasote: "တ္ၚဲကိုန်အမြိုတ်",
    warameittugyi: "တ္ၚဲကိုန်ဝါရမိတ္တုဇၞော်",
    warameittunge: "တ္ၚဲကိုန်ဝါရမိတ္တုဍောတ်",
    yatpote: "တ္ၚဲကိုန်လီုလာ်",
    thamaphyu: "တ္ၚဲကိုန်လေၚ်ဒိုက်",
    nagapor: "တ္ၚဲနာ်မံက်",
    yatyotema: "တ္ၚဲကိုန်ယုတ်မာ",
    mahayatkyan: "တ္ၚဲကိုန်ဟွံခိုဟ်",
    shanyat: "တ္ၚဲဒတန်",
  },
  my: {
    sabbathEve: "အဖိတ်",
    sabbath: "ဥပုသ်",
    yatyaza: "ရက်ရာဇာ",
    pyathada: "ပြဿဒါး",
    thamanyo: "သမားညို",
    amyeittasote: "အမြိတ္တစုတ်",
    warameittugyi: "ဝါရမိတ္တုကြီး",
    warameittunge: "ဝါရမိတ္တုငယ်",
    yatpote: "ရက်ပုပ်",
    thamaphyu: "သမားဖြူ",
    nagapor: "နဂါးပေါ်",
    yatyotema: "ရက်ယုတ်မာ",
    mahayatkyan: "မဟာရက်ကြမ်း",
    shanyat: "ရှမ်းရက်",
  },
};

function sourceWeekday(date: Date) {
  // The supplied calendar numbers weekdays as Saturday=0, Sunday=1, ... Friday=6.
  return (date.getDay() + 1) % 7;
}

function fortnightDay(value: MyanmarDate) {
  return value.day - 15 * Math.floor(value.day / 16);
}

function statusMonth(month: number) {
  const lateMonth = Math.floor(month / 13);
  let normalized = (month % 13) + lateMonth;
  if (normalized <= 0) normalized = 4;
  return normalized;
}

function monthLength(value: MyanmarDate) {
  return 30 - (value.monthNumber % 2) + (value.monthNumber === 3 ? Math.floor(value.yearType / 2) : 0);
}

/**
 * Full daily Mon status catalog calculated from the supplied source's
 * cal_sabbath, cal_yatyaza, cal_pyathada, and cal_astro algorithms.
 */
export function getMonDailyStatuses(date: Date, value: MyanmarDate, lang: CalendarLang = "mon") {
  const labels: string[] = [];
  const L = statusNames[lang];
  const md = value.day;
  const mm = value.monthNumber;
  const wd = sourceWeekday(date);
  const mf = fortnightDay(value);
  const mml = monthLength(value);

  if ([8, 15, 23, mml].includes(md)) labels.push(L.sabbath);
  else if ([7, 14, 22, mml - 1].includes(md)) labels.push(L.sabbathEve);

  const monthModFour = mm % 4;
  const yatyazaWeekdayOne = Math.floor(monthModFour / 2) + 4;
  const yatyazaWeekdayTwo = ((1 - Math.floor(monthModFour / 2)) + (monthModFour % 2)) * (1 + 2 * (monthModFour % 2));
  if (wd === yatyazaWeekdayOne || wd === yatyazaWeekdayTwo) labels.push(L.yatyaza);

  const pyathadaWeekdays = [1, 3, 3, 0, 2, 1, 2];
  if (monthModFour === 0 && wd === 4) labels.push(L.pyathada);
  else if (monthModFour === pyathadaWeekdays[wd]) labels.push(L.pyathada);

  const normalizedMonth = statusMonth(mm);
  const thamanyoMonth = normalizedMonth - 1 - Math.floor(normalizedMonth / 9);
  const thamanyoWeekday = (thamanyoMonth * 2 - Math.floor(thamanyoMonth / 8)) % 7;
  if (((wd + 7 - thamanyoWeekday) % 7) <= 1) labels.push(L.thamanyo);

  const amyeittasoteWeekdays = [5, 8, 3, 7, 2, 4, 1];
  if (mf === amyeittasoteWeekdays[wd]) labels.push(L.amyeittasote);

  const warameittugyiWeekdays = [7, 1, 4, 8, 9, 6, 3];
  if (mf === warameittugyiWeekdays[wd]) labels.push(L.warameittugyi);

  if (12 - mf === (wd + 6) % 7) labels.push(L.warameittunge);

  const yatpoteWeekdays = [8, 1, 4, 6, 9, 8, 7];
  if (mf === yatpoteWeekdays[wd]) labels.push(L.yatpote);

  const thamaphyuWeekdays = [1, 2, 6, 6, 5, 6, 7];
  const thamaphyuSecondary = [0, 1, 0, 0, 0, 3, 3];
  if (mf === thamaphyuWeekdays[wd] || mf === thamaphyuSecondary[wd] || (mf === 4 && wd === 5)) labels.push(L.thamaphyu);

  const nagaporWeekdays = [26, 21, 2, 10, 18, 2, 21];
  const nagaporSecondary = [17, 19, 1, 0, 9, 0, 0];
  if (md === nagaporWeekdays[wd] || md === nagaporSecondary[wd] || (md === 2 && wd === 1) || ([12, 4, 18].includes(md) && wd === 2)) labels.push(L.nagapor);

  const yatyotemaMonth = (normalizedMonth % 2 ? normalizedMonth : (normalizedMonth + 9) % 12);
  if (mf === ((yatyotemaMonth + 4) % 12) + 1) labels.push(L.yatyotema);

  if (mf === (Math.floor((normalizedMonth % 12) / 2) + 4) % 6 + 1) labels.push(L.mahayatkyan);

  const shanyatDays = [8, 8, 2, 2, 9, 3, 3, 5, 1, 4, 7, 4];
  if (mf === shanyatDays[normalizedMonth - 1]) labels.push(L.shanyat);

  return labels;
}

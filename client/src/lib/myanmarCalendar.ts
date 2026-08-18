/**
 * Editorial Ledger design support: a compact Gregorian-to-Myanmar calendar
 * conversion module used by the clean bilingual day views.
 */

export type MoonPhase = "Waxing" | "Full moon" | "Waning" | "New moon";

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

/** Mon-language catalog transcribed from the supplied calendar source. */
const monMonthNames: Record<number, string> = {
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
};

const monWeekdays = ["တ္ၚဲအဒိုတ်", "တ္ၚဲစန်", "တ္ၚဲအင္ၚာ", "တ္ၚဲဗုဒ္ဓဝါ", "တ္ၚဲဗြဴဗတိ", "တ္ၚဲသိုက်", "တ္ၚဲသ္ၚိသဝ်"];
const monGregorianMonths = ["ဂျာန်နျူအာရဳ", "ဝှေဝ်ဗျူအာရဳ", "မာတ်ချ်", "ဨပြေယ်လ်", "မေ", "ဂျုန်", "ဂျူလာၚ်", "အဝ်ဂါတ်", "သိတ်ထီဗာ", "အံက်ထဝ်ဗာ", "နဝ်ဝါမ်ဗာ", "ဒီဇြေန်ဗာ"];
const monPhaseNames: Record<MoonPhase, string> = { Waxing: "မံက်", "Full moon": "ပေၚ်", Waning: "စွေက်", "New moon": "အိုတ်" };
const monDigits = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

export function toMonNumerals(value: number | string) {
  return String(value).replace(/\d/g, (digit) => monDigits[Number(digit)]);
}

export function getMonWeekday(date: Date) {
  return monWeekdays[date.getDay()];
}

export function getMonGregorianMonth(month: number) {
  return monGregorianMonths[month];
}

export function getMonMonth(value: MyanmarDate) {
  const prefix = value.yearType && value.monthNumber === 4 ? "ဒု" : "";
  return `${prefix}${monMonthNames[value.monthNumber] ?? value.month}`;
}

export function getMonPhase(value: MyanmarDate) {
  return monPhaseNames[value.phase];
}

export function formatMonDate(value: MyanmarDate) {
  const phase = getMonPhase(value);
  const day = value.phase === "Waxing" || value.phase === "Waning" ? ` ${toMonNumerals(value.fortnightDay)}` : "";
  return `${getMonMonth(value)} ${phase}${day}`;
}

export function formatMonGregorianDate(date: Date) {
  return `${getMonGregorianMonth(date.getMonth())} ${toMonNumerals(date.getDate())}၊ ${toMonNumerals(date.getFullYear())}`;
}

type MonCulturalEventRule = {
  id: string;
  name: string;
  matches: (date: Date, value: MyanmarDate) => boolean;
};

/**
 * Source-backed Mon cultural date rules transcribed from ceMmDateTime.js in
 * the supplied ZIP. These are evaluated for each selected calendar day.
 */
const monCulturalEventRules: MonCulturalEventRule[] = [
  {
    id: "mon-youth-day",
    name: "တ္ၚဲသၟတ်မန်",
    matches: (date) => date.getFullYear() >= 2017 && date.getMonth() === 11 && date.getDate() === 28,
  },
  {
    id: "mon-national-day",
    name: "တ္ၚဲကောန်ဂကူမန်",
    matches: (_date, value) => value.year >= 1309 && value.monthNumber === 11 && value.day === 16,
  },
];

export function getMonCulturalEvents(date: Date, value: MyanmarDate) {
  return monCulturalEventRules.filter((event) => event.matches(date, value)).map((event) => event.name);
}

const monStatusLabels = {
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
} as const;

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
export function getMonDailyStatuses(date: Date, value: MyanmarDate) {
  const labels: string[] = [];
  const md = value.day;
  const mm = value.monthNumber;
  const wd = sourceWeekday(date);
  const mf = fortnightDay(value);
  const mml = monthLength(value);

  if ([8, 15, 23, mml].includes(md)) labels.push(monStatusLabels.sabbath);
  else if ([7, 14, 22, mml - 1].includes(md)) labels.push(monStatusLabels.sabbathEve);

  const monthModFour = mm % 4;
  const yatyazaWeekdayOne = Math.floor(monthModFour / 2) + 4;
  const yatyazaWeekdayTwo = ((1 - Math.floor(monthModFour / 2)) + (monthModFour % 2)) * (1 + 2 * (monthModFour % 2));
  if (wd === yatyazaWeekdayOne || wd === yatyazaWeekdayTwo) labels.push(monStatusLabels.yatyaza);

  const pyathadaWeekdays = [1, 3, 3, 0, 2, 1, 2];
  if (monthModFour === 0 && wd === 4) labels.push(monStatusLabels.pyathada);
  else if (monthModFour === pyathadaWeekdays[wd]) labels.push(monStatusLabels.pyathada);

  const normalizedMonth = statusMonth(mm);
  const thamanyoMonth = normalizedMonth - 1 - Math.floor(normalizedMonth / 9);
  const thamanyoWeekday = (thamanyoMonth * 2 - Math.floor(thamanyoMonth / 8)) % 7;
  if (((wd + 7 - thamanyoWeekday) % 7) <= 1) labels.push(monStatusLabels.thamanyo);

  const amyeittasoteWeekdays = [5, 8, 3, 7, 2, 4, 1];
  if (mf === amyeittasoteWeekdays[wd]) labels.push(monStatusLabels.amyeittasote);

  const warameittugyiWeekdays = [7, 1, 4, 8, 9, 6, 3];
  if (mf === warameittugyiWeekdays[wd]) labels.push(monStatusLabels.warameittugyi);

  if (12 - mf === (wd + 6) % 7) labels.push(monStatusLabels.warameittunge);

  const yatpoteWeekdays = [8, 1, 4, 6, 9, 8, 7];
  if (mf === yatpoteWeekdays[wd]) labels.push(monStatusLabels.yatpote);

  const thamaphyuWeekdays = [1, 2, 6, 6, 5, 6, 7];
  const thamaphyuSecondary = [0, 1, 0, 0, 0, 3, 3];
  if (mf === thamaphyuWeekdays[wd] || mf === thamaphyuSecondary[wd] || (mf === 4 && wd === 5)) labels.push(monStatusLabels.thamaphyu);

  const nagaporWeekdays = [26, 21, 2, 10, 18, 2, 21];
  const nagaporSecondary = [17, 19, 1, 0, 9, 0, 0];
  if (md === nagaporWeekdays[wd] || md === nagaporSecondary[wd] || (md === 2 && wd === 1) || ([12, 4, 18].includes(md) && wd === 2)) labels.push(monStatusLabels.nagapor);

  const yatyotemaMonth = (normalizedMonth % 2 ? normalizedMonth : (normalizedMonth + 9) % 12);
  if (mf === ((yatyotemaMonth + 4) % 12) + 1) labels.push(monStatusLabels.yatyotema);

  if (mf === (Math.floor((normalizedMonth % 12) / 2) + 4) % 6 + 1) labels.push(monStatusLabels.mahayatkyan);

  const shanyatDays = [8, 8, 2, 2, 9, 3, 3, 5, 1, 4, 7, 4];
  if (mf === shanyatDays[normalizedMonth - 1]) labels.push(monStatusLabels.shanyat);

  return labels;
}

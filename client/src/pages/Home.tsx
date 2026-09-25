/**
 * Simple Mon Calendar design: a visibly spacious desktop day ledger with a
 * familiar calendar grid, compact Mon masthead, and neutral project credit.
 */
import {
  formatMonDate,
  formatMonGregorianDate,
  getCalendarEvents,
  getMonDailyStatuses,
  getMonGregorianMonth,
  getMonMonth,
  getMonPhase,
  getMonWeekday,
  getMyanmarDate,
  toMonNumerals,
  weekdayGridLabels,
  type CalendarEventKind,
  type CalendarLang,
} from "@/lib/myanmarCalendar";
import { uiText } from "@/lib/uiText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Moon, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const today = new Date();
today.setHours(12, 0, 0, 0);

type MonthView = { year: number; month: number };

function makeDate(year: number, month: number, day: number) {
  return new Date(year, month, day, 12, 0, 0, 0);
}

function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function phaseGlyph(phase: string) {
  if (phase === "Full moon") return "●";
  if (phase === "New moon") return "○";
  if (phase === "Waxing") return "◐";
  return "◑";
}

export default function Home() {
  const [lang, setLang] = useState<CalendarLang>(() =>
    localStorage.getItem("calendar-lang") === "my" ? "my" : "mon"
  );
  const [view, setView] = useState<MonthView>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [yearInput, setYearInput] = useState(() =>
    toMonNumerals(today.getFullYear())
  );
  const t = uiText[lang];

  useEffect(() => {
    localStorage.setItem("calendar-lang", lang);
    document.title = t.appName;
    document.documentElement.lang = t.htmlLang;
  }, [lang, t]);

  useEffect(() => {
    setYearInput(toMonNumerals(view.year));
  }, [view.year]);

  const handleYearSubmit = () => {
    const parsedStr = String(yearInput).replace(/[\u1040-\u1049]/g, match =>
      String(match.charCodeAt(0) - 0x1040)
    );
    let parsedYear = parseInt(parsedStr, 10);
    if (!isNaN(parsedYear) && parsedYear > 1000 && parsedYear < 3000) {
      setView(prev => ({ ...prev, year: parsedYear }));
      setYearInput(toMonNumerals(parsedYear));
    } else {
      setYearInput(toMonNumerals(view.year));
    }
  };
  const selectedMyanmar = useMemo(
    () => getMyanmarDate(selectedDate),
    [selectedDate]
  );
  const selectedEvents = useMemo(
    () => getCalendarEvents(selectedDate, selectedMyanmar, lang),
    [selectedDate, selectedMyanmar, lang]
  );
  const selectedStatuses = useMemo(
    () => getMonDailyStatuses(selectedDate, selectedMyanmar, lang),
    [selectedDate, selectedMyanmar, lang]
  );
  const weekdayTitles = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        getMonWeekday(new Date(2024, 8, 1 + index), lang)
      ),
    [lang]
  );
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 17 }, (_, index) => today.getFullYear() - 8 + index),
    []
  );
  const calendarCells = useMemo(() => {
    const startOffset = makeDate(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - startOffset + 1;
      return day > 0 && day <= daysInMonth
        ? makeDate(view.year, view.month, day)
        : null;
    });
  }, [view]);

  const changeMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1, 12);
    setView({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedDate(next);
  };

  const returnToToday = () => {
    setView({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDate(today);
  };

  const eventKindLabel = (kind: CalendarEventKind) => {
    if (kind === "public-holiday") return t.publicHolidayLabel;
    if (kind === "mon-cultural") return t.monCulturalLabel;
    if (kind === "religious") return t.religiousLabel;
    return t.observanceLabel;
  };

  const eventSourceLabel = (source: string) => {
    if (source === "calculated") return t.calculatedSourceLabel;
    const year = source.match(/\d{4}$/)?.[0];
    return year
      ? `${toMonNumerals(year)} ${t.officialSourceLabel}`
      : t.officialSourceLabel;
  };

  return (
    <div className="simple-calendar-app">
      <header className="app-header">
        <a className="app-brand" href="#calendar" aria-label={t.appName}>
          <img src="/image/image.png" alt="" />
          <span>{t.appName}</span>
        </a>

        <div className="header-actions">
          <div
            className="lang-toggle"
            role="group"
            aria-label={t.languageGroupAria}
          >
            <button
              className={lang === "mon" ? "active" : ""}
              onClick={() => setLang("mon")}
            >
              မန်
            </button>
            <button
              className={lang === "my" ? "active" : ""}
              onClick={() => setLang("my")}
            >
              မြန်မာ
            </button>
          </div>
          <button className="today-button" onClick={returnToToday}>
            <RotateCcw size={14} />
            <span>{formatMonGregorianDate(today, lang)}</span>
          </button>
        </div>
      </header>

      <main className="calendar-page" id="calendar">
        <section className="calendar-topbar" aria-labelledby="calendar-heading">
          <div>
            <p className="section-kicker">{t.eraKicker}</p>
            <h1 id="calendar-heading">
              {getMonGregorianMonth(view.month, lang)}{" "}
              <span>{toMonNumerals(view.year)}</span>
            </h1>
          </div>
          <div className="month-controls">
            <Select
              value={String(view.month)}
              onValueChange={val => setView({ ...view, month: Number(val) })}
            >
              <SelectTrigger
                className="month-select-trigger"
                aria-label={t.monthAria}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem value={String(index)} key={index}>
                    {getMonGregorianMonth(index, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="text"
              className="month-select-trigger year-select-trigger"
              aria-label="Year"
              value={yearInput}
              onChange={e => setYearInput(e.target.value)}
              onBlur={handleYearSubmit}
              onKeyDown={e => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              style={{
                width: "78px",
                paddingRight: "4px",
                textAlign: "center",
              }}
            />
            <div className="month-arrows" aria-label={t.monthAria}>
              <button
                aria-label={t.prevMonthAria}
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label={t.nextMonthAria}
                onClick={() => changeMonth(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        <section className="calendar-layout">
          <div className="calendar-panel">
            <div className="calendar-legend" aria-label={t.calendarLegendAria}>
              <span>
                <i className="event-marker event-marker--public-holiday" />
                {t.publicHolidayLabel}
              </span>
              <span>
                <i className="event-marker event-marker--mon-cultural" />
                {t.monCulturalLabel}
              </span>
              <span>
                <i className="event-marker event-marker--religious" />
                {t.religiousLabel}
              </span>
            </div>
            <div
              className="week-grid"
              role="grid"
              aria-label={`${getMonGregorianMonth(view.month, lang)} ${toMonNumerals(view.year)}`}
            >
              {weekdayGridLabels[lang].map((weekday, index) => (
                <div
                  className="weekday-label"
                  role="columnheader"
                  title={weekdayTitles[index]}
                  key={weekday}
                >
                  {weekday}
                </div>
              ))}
              {calendarCells.map((date, index) => {
                if (!date)
                  return (
                    <div
                      key={`empty-${index}`}
                      className="day-cell day-cell--empty"
                      aria-hidden="true"
                    />
                  );
                const myanmar = getMyanmarDate(date);
                const events = getCalendarEvents(date, myanmar, lang);
                const dailyStatuses = getMonDailyStatuses(date, myanmar, lang);
                const selected = sameDate(date, selectedDate);
                const isToday = sameDate(date, today);
                const weekend = date.getDay() === 0 || date.getDay() === 6;
                const eventKinds = Array.from(
                  new Set(events.map(event => event.kind))
                );
                const showLunarMonth =
                  myanmar.day === 1 ||
                  myanmar.phase === "Full moon" ||
                  myanmar.phase === "New moon";
                return (
                  <button
                    role="gridcell"
                    key={date.toISOString()}
                    className={`day-cell${selected ? " is-selected" : ""}${isToday ? " is-today" : ""}${weekend ? " is-weekend" : ""}${events.length ? " has-event" : ""}`}
                    onClick={() => setSelectedDate(date)}
                    aria-label={`${formatMonGregorianDate(date, lang)}၊ ${formatMonDate(myanmar, lang)}${events.length ? `၊ ${events.map(event => event.label).join("၊ ")}` : ""}`}
                  >
                    <span className="day-cell__number">
                      {toMonNumerals(date.getDate())}
                    </span>
                    <span className="day-cell__lunar">
                      {showLunarMonth && <b>{getMonMonth(myanmar, lang)} · </b>}
                      {getMonPhase(myanmar, lang)}
                      {myanmar.phase === "Waxing" || myanmar.phase === "Waning"
                        ? ` ${toMonNumerals(myanmar.fortnightDay)}`
                        : ""}
                    </span>
                    {myanmar.phase !== "Waxing" && (
                      <span className="day-cell__moon" aria-hidden="true">
                        {phaseGlyph(myanmar.phase)}
                      </span>
                    )}
                    {eventKinds.length > 0 && (
                      <span className="day-cell__events" aria-hidden="true">
                        {eventKinds.map(kind => (
                          <i
                            className={`event-marker event-marker--${kind}`}
                            key={kind}
                          />
                        ))}
                      </span>
                    )}
                    {dailyStatuses.length > 0 && (
                      <span
                        className="status-mark"
                        aria-label={dailyStatuses.join(" · ")}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="selected-panel" aria-labelledby="selected-heading">
            <div className="selected-panel__date">
              <span>{getMonWeekday(selectedDate, lang)}</span>
              <strong>{formatMonGregorianDate(selectedDate, lang)}</strong>
            </div>
            <div className="selected-number">
              {toMonNumerals(selectedDate.getDate())}
            </div>
            <dl className="selected-facts">
              <div>
                <dt>{t.eraKicker}</dt>
                <dd>
                  {toMonNumerals(selectedMyanmar.year)} {t.yearUnit}
                </dd>
              </div>
              <div>
                <dt>{t.sasanaLabel}</dt>
                <dd>
                  {toMonNumerals(selectedMyanmar.year + 1182)} {t.yearUnit}
                </dd>
              </div>
              <div>
                <dt>{t.monthLabel}</dt>
                <dd>{getMonMonth(selectedMyanmar, lang)}</dd>
              </div>
              <div>
                <dt>{t.dayLabel}</dt>
                <dd>
                  {getMonPhase(selectedMyanmar, lang)}{" "}
                  {selectedMyanmar.phase === "Waxing" ||
                  selectedMyanmar.phase === "Waning"
                    ? toMonNumerals(selectedMyanmar.fortnightDay)
                    : ""}
                </dd>
              </div>
            </dl>

            {selectedEvents.length > 0 && (
              <div className="selected-events">
                {selectedEvents.map(event => (
                  <div
                    className={`selected-event selected-event--${event.kind}`}
                    key={`${event.kind}-${event.id}`}
                  >
                    <i className={`event-marker event-marker--${event.kind}`} />
                    <span>
                      <strong>{event.label}</strong>
                      <small>
                        {eventKindLabel(event.kind)} ·{" "}
                        {eventSourceLabel(event.source)}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="status-ledger">
              {/* <span className="section-kicker">တ္ၚဲလက္ခဏာ</span> */}
              {selectedStatuses.length > 0 ? (
                <div className="status-list">
                  {selectedStatuses.map(status => (
                    <span key={status}>{status}</span>
                  ))}
                </div>
              ) : (
                <span className="status-empty">—</span>
              )}
            </div>
            <div className="selected-footer">
              <Moon size={16} />{" "}
              <span>{getMonPhase(selectedMyanmar, lang)}</span>
            </div>
          </aside>
        </section>
      </main>
      <footer className="app-footer" style={{ borderTop: "none" }}>
        <div className="footer-brand">
          <img src="/image/image.png" alt="" />
          <span>ကြက္ကဒိန်မန်</span>
        </div>
        <span className="footer-purpose">MON CALENDAR · {view.year}</span>
        <a
          className="footer-credit"
          href="https://phyothetkhine.dpdns.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          PROVIDE BY{" "}
          <span style={{ color: "#0066ff", fontWeight: "bold" }}>
            PHYO THET KHINE
          </span>
        </a>
      </footer>
    </div>
  );
}

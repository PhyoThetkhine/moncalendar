/**
 * Simple Mon Calendar design: a visibly spacious desktop day ledger with a
 * familiar calendar grid, compact Mon masthead, and neutral project credit.
 */
import {
  formatMonDate,
  formatMonGregorianDate,
  getMonCulturalEvents,
  getMonDailyStatuses,
  getMonGregorianMonth,
  getMonMonth,
  getMonPhase,
  getMonWeekday,
  getMyanmarDate,
  toMonNumerals,
} from "@/lib/myanmarCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Moon, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const monWeekdayLabels = ["အဒိုတ်", "စန်", "အင္ၚာ", "ဗုဒ္ဓဝါ", "ဗြဴဗတိ", "သိုက်", "သ္ၚိသဝ်"];
const monWeekdayTitles = ["တ္ၚဲအဒိုတ်", "တ္ၚဲစန်", "တ္ၚဲအင္ၚာ", "တ္ၚဲဗုဒ္ဓဝါ", "တ္ၚဲဗြဴဗတိ", "တ္ၚဲသိုက်", "တ္ၚဲသ္ၚိသဝ်"];
const today = new Date();
today.setHours(12, 0, 0, 0);

type MonthView = { year: number; month: number };

function makeDate(year: number, month: number, day: number) {
  return new Date(year, month, day, 12, 0, 0, 0);
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function phaseGlyph(phase: string) {
  if (phase === "Full moon") return "●";
  if (phase === "New moon") return "○";
  if (phase === "Waxing") return "◐";
  return "◑";
}

export default function Home() {
  const [view, setView] = useState<MonthView>({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(today);
  const [yearInput, setYearInput] = useState(() => toMonNumerals(today.getFullYear()));

  useEffect(() => {
    setYearInput(toMonNumerals(view.year));
  }, [view.year]);

  const handleYearSubmit = () => {
    const parsedStr = String(yearInput).replace(/[\u1040-\u1049]/g, (match) => String(match.charCodeAt(0) - 0x1040));
    let parsedYear = parseInt(parsedStr, 10);
    if (!isNaN(parsedYear) && parsedYear > 1000 && parsedYear < 3000) {
      setView((prev) => ({ ...prev, year: parsedYear }));
      setYearInput(toMonNumerals(parsedYear));
    } else {
      setYearInput(toMonNumerals(view.year));
    }
  };
  const selectedMyanmar = useMemo(() => getMyanmarDate(selectedDate), [selectedDate]);
  const selectedEvents = useMemo(() => getMonCulturalEvents(selectedDate, selectedMyanmar), [selectedDate, selectedMyanmar]);
  const selectedStatuses = useMemo(() => getMonDailyStatuses(selectedDate, selectedMyanmar), [selectedDate, selectedMyanmar]);
  const yearOptions = useMemo(() => Array.from({ length: 17 }, (_, index) => today.getFullYear() - 8 + index), []);
  const calendarCells = useMemo(() => {
    const startOffset = makeDate(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - startOffset + 1;
      return day > 0 && day <= daysInMonth ? makeDate(view.year, view.month, day) : null;
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

  return (
    <div className="simple-calendar-app">
      <header className="app-header">
        <a className="app-brand" href="#calendar" aria-label="ကြက္ကဒိန်မန်">
          <img src="/image/image.png" alt="" />
          <span>ကြက္ကဒိန်မန်</span>
        </a>

        <button className="today-button" onClick={returnToToday}><RotateCcw size={14} /><span>{formatMonGregorianDate(today)}</span></button>
      </header>

      <main className="calendar-page" id="calendar">
        <section className="calendar-topbar" aria-labelledby="calendar-heading">
          <div>
            <p className="section-kicker">သက္ကရာဇ်ဍုၚ်</p>
            <h1 id="calendar-heading">{getMonGregorianMonth(view.month)} <span>{toMonNumerals(view.year)}</span></h1>
          </div>
          <div className="month-controls">
            <Select value={String(view.month)} onValueChange={(val) => setView({ ...view, month: Number(val) })}>
              <SelectTrigger className="month-select-trigger" aria-label="ဂိတု">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem value={String(index)} key={index}>{getMonGregorianMonth(index)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input 
              type="text" 
              className="month-select-trigger year-select-trigger" 
              aria-label="Year"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              onBlur={handleYearSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              style={{ width: '78px', paddingRight: '4px', textAlign: 'center' }}
            />
            <div className="month-arrows" aria-label="ဂိတုပလေဝ်">
              <button aria-label="ဂိတုပြင်" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
              <button aria-label="ဂိတုဂတ" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
        </section>

        <section className="calendar-layout">
          <div className="calendar-panel">
            <div className="week-grid" role="grid" aria-label={`${getMonGregorianMonth(view.month)} ${toMonNumerals(view.year)}`}>
              {monWeekdayLabels.map((weekday, index) => <div className="weekday-label" role="columnheader" title={monWeekdayTitles[index]} key={weekday}>{weekday}</div>)}
              {calendarCells.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="day-cell day-cell--empty" aria-hidden="true" />;
                const myanmar = getMyanmarDate(date);
                const events = getMonCulturalEvents(date, myanmar);
                const dailyStatuses = getMonDailyStatuses(date, myanmar);
                const selected = sameDate(date, selectedDate);
                const isToday = sameDate(date, today);
                const weekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <button
                    role="gridcell"
                    key={date.toISOString()}
                    className={`day-cell${selected ? " is-selected" : ""}${isToday ? " is-today" : ""}${weekend ? " is-weekend" : ""}${events.length ? " has-event" : ""}`}
                    onClick={() => setSelectedDate(date)}
                    aria-label={`${formatMonGregorianDate(date)}၊ ${formatMonDate(myanmar)}`}
                  >
                    <span className="day-cell__number">{toMonNumerals(date.getDate())}</span>
                    <span className="day-cell__lunar">{getMonPhase(myanmar)}{myanmar.phase === "Waxing" || myanmar.phase === "Waning" ? ` ${toMonNumerals(myanmar.fortnightDay)}` : ""}</span>
                    {myanmar.phase !== "Waxing" && <span className="day-cell__moon" aria-hidden="true">{phaseGlyph(myanmar.phase)}</span>}
                    {events.length > 0 && <span className="event-dot" aria-label={events[0]} />}
                    {dailyStatuses.length > 0 && <span className="status-mark" aria-label={dailyStatuses.join(" · ")} />}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="selected-panel" aria-labelledby="selected-heading">
            <div className="selected-panel__date"><span>{getMonWeekday(selectedDate)}</span><strong>{formatMonGregorianDate(selectedDate)}</strong></div>
            <div className="selected-number">{toMonNumerals(selectedDate.getDate())}</div>
            <dl className="selected-facts">
              <div><dt>သက္ကရာဇ်ဍုၚ်</dt><dd>{toMonNumerals(selectedMyanmar.year)} သၞာံ</dd></div>
              <div><dt>သက္ကရာဇ် သာသနာ</dt><dd>{toMonNumerals(selectedMyanmar.year + 1182)} သၞာံ</dd></div>
              <div><dt>ဂိတု</dt><dd>{getMonMonth(selectedMyanmar)}</dd></div>
              <div><dt>တ္ၚဲ</dt><dd>{getMonPhase(selectedMyanmar)} {selectedMyanmar.phase === "Waxing" || selectedMyanmar.phase === "Waning" ? toMonNumerals(selectedMyanmar.fortnightDay) : ""}</dd></div>
            </dl>

            {selectedEvents.length > 0 && <div className="selected-event"><span className="event-dot" /><strong>{selectedEvents.join(" · ")}</strong></div>}
            <div className="status-ledger">
              {/* <span className="section-kicker">တ္ၚဲလက္ခဏာ</span> */}
              {selectedStatuses.length > 0 ? (
                <div className="status-list">{selectedStatuses.map((status) => <span key={status}>{status}</span>)}</div>
              ) : <span className="status-empty">—</span>}
            </div>
            <div className="selected-footer"><Moon size={16} /> <span>{getMonPhase(selectedMyanmar)}</span></div>
          </aside>
        </section>
      </main>
      <footer className="app-footer">
        <div className="footer-brand"><img src="/image/image.png" alt="" /><span>ကြက္ကဒိန်မန်</span></div>
        <span className="footer-purpose">MON CALENDAR · 2026</span>
        <Link className="footer-credit" href="/about">PROVIDE BY PHYO THET KHINE</Link>
      </footer>
    </div>
  );
}

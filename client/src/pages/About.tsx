/**
 * Mon Calendar About page: a Mon-first almanac ledger that lets calendar
 * terms and source-backed status data lead, with English only as context.
 */
import { ArrowLeft, CalendarDays, CircleDot, Moon, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="about-app">
      <header className="app-header about-header">
        <Link className="app-brand" href="/">
          <img src="/manus-storage/mon-calendar-mark_871d93b2.png" alt="" />
          <span>သက္ကရာဇ်ဍုၚ်</span>
        </Link>
        <div className="header-center"><span className="header-date"><CalendarDays size={16} /> Mon Calendar Project</span></div>
        <Link className="today-button about-back" href="/"><ArrowLeft size={14} /><span>သက္ကရာဇ်ဍုၚ်</span></Link>
      </header>

      <main className="about-page">
        <section className="about-hero">
          <div className="about-title-block">
            <p className="section-kicker">သက္ကရာဇ်ဍုၚ် · ဂိတု · တ္ၚဲ · သၞာံ</p>
            <h1>သက္ကရာဇ်ဍုၚ်<br /><span>ဂိတု · တ္ၚဲ · သၞာံ</span></h1>
            <p className="about-lead">Mon Calendar Project is a practical Mon-language calendar interface for lunar dates, source terms, cultural dates, and daily status information.</p>
          </div>
          <div className="about-ledger-art" aria-label="ဂိတု လက္ခဏာ">
            <div className="ledger-art__head"><img src="/manus-storage/mon-calendar-mark_871d93b2.png" alt="" /><span>ဂိတု လက္ခဏာ</span></div>
            <div className="ledger-art__phases"><div><i>◐</i><span>မံက်</span></div><div><i>●</i><span>ပေၚ်</span></div><div><i>◑</i><span>စွေက်</span></div><div><i>○</i><span>အိုတ်</span></div></div>
            <div className="ledger-art__rules"><span>သက္ကရာဇ်ဍုၚ်</span><b /><span>တ္ၚဲလက္ခဏာ</span><b /><span>တ္ၚဲမန်</span></div>
          </div>
        </section>

        <section className="about-intro" aria-labelledby="project-heading">
          <div className="about-label"><span>၀၁</span><p>သက္ကရာဇ်ဍုၚ်</p></div>
          <div className="about-copy"><h2 id="project-heading">ဂိတု · တ္ၚဲ · သၞာံ</h2><p>Mon Calendar Project presents a familiar month view while keeping Mon language visible in the places that matter: month names, weekdays, lunar phases, Myanmar Era dates, and calculated daily-status information. The goal is practical daily use without turning Mon language into a secondary label.</p></div>
        </section>

        <section className="about-grid" aria-label="Mon Calendar Project information">
          <article className="about-card about-card--dark"><Moon size={25} strokeWidth={1.4} /><h3>ဂိတု · တ္ၚဲ · သၞာံ</h3><p>The calendar joins Gregorian navigation with source-backed Myanmar lunar calculations, then presents the result through Mon labels and numerals.</p></article>
          <article className="about-card"><CircleDot size={25} strokeWidth={1.4} /><h3>သက္ကရာဇ်ဍုၚ်</h3><p>The supplied project archive provides the Mon month names, weekday names, lunar-phase labels, and calendar-status terminology used by this interface.</p></article>
          <article className="about-card"><Sparkles size={25} strokeWidth={1.4} /><h3>တ္ၚဲလက္ခဏာ</h3><p>Each selected date can show Mon daily-status results, including <strong>တ္ၚဲတိၚ်</strong>, <strong>တ္ၚဲသဳ</strong>, <strong>တ္ၚဲရာဇာ</strong>, and <strong>တ္ၚဲပြာဗ္ဗဒါ</strong>, alongside the other source-derived status rules.</p></article>
        </section>

        <section className="about-intro about-intro--split" aria-labelledby="culture-heading">
          <div className="about-label"><span>၀၂</span><p>တ္ၚဲမန်</p></div>
          <div className="about-copy"><h2 id="culture-heading">တ္ၚဲသၟတ်မန် · တ္ၚဲကောန်ဂကူမန်</h2><p>These cultural dates appear only when their corresponding source rules match the selected day. The same approach is used for the daily lunar and astrological information displayed by the calendar.</p></div>
        </section>

        <section className="about-source" aria-labelledby="source-heading">
          <div><p className="section-kicker">သက္ကရာဇ်ဍုၚ်</p><h2 id="source-heading">ဂိတု · တ္ၚဲ · သၞာံ</h2></div>
          <div className="source-list"><p><span>သက္ကရာဇ်ဍုၚ်</span><strong>Mon language first</strong></p><p><span>ဂိတု · တ္ၚဲ</span><strong>Supplied Mon Calendar source archive</strong></p><p><span>Mon Calendar Project</span><strong>2026</strong></p></div>
        </section>
      </main>

      <footer className="app-footer about-footer">
        <div className="footer-brand"><img src="/manus-storage/mon-calendar-mark_871d93b2.png" alt="" /><span>သက္ကရာဇ်ဍုၚ်</span></div>
        <span className="footer-purpose">Mon Calendar Project</span>
        <Link className="footer-credit" href="/">RETURN TO CALENDAR</Link>
      </footer>
    </div>
  );
}

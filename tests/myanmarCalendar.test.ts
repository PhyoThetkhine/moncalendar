import assert from "node:assert/strict";
import test from "node:test";

import {
  getCalendarEvents,
  getMyanmarDate,
} from "../client/src/lib/myanmarCalendar.ts";

function civilDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

test("matches canonical Myanmar calendar vectors for 1388 ME", () => {
  const vectors = [
    ["2026-04-30", 1388, 2, 15, "Full moon"],
    ["2026-07-29", 1388, 4, 15, "Full moon"],
    ["2026-10-26", 1388, 7, 15, "Full moon"],
    ["2026-11-24", 1388, 8, 15, "Full moon"],
  ] as const;

  for (const [date, year, month, day, phase] of vectors) {
    const actual = getMyanmarDate(civilDate(date));
    assert.deepEqual(
      {
        year: actual.year,
        month: actual.monthNumber,
        day: actual.day,
        phase: actual.phase,
      },
      { year, month, day, phase },
      date
    );
  }
});

test("marks date-specific 2026 public holidays as official", () => {
  const dates = [
    "2026-01-02",
    "2026-02-13",
    "2026-02-16",
    "2026-04-11",
    "2026-04-30",
    "2026-10-25",
    "2026-10-27",
    "2026-11-23",
    "2026-12-04",
  ];

  for (const value of dates) {
    const date = civilDate(value);
    const events = getCalendarEvents(date, getMyanmarDate(date), "my");
    assert.ok(
      events.some(
        event =>
          event.kind === "public-holiday" && event.source === "official-2026"
      ),
      `${value} should include an official public holiday`
    );
  }
});

test("does not confuse Nayon full moon with the official Kason holiday", () => {
  const kason = civilDate("2026-04-30");
  const nayon = civilDate("2026-05-30");
  const kasonEvents = getCalendarEvents(kason, getMyanmarDate(kason), "my");
  const nayonEvents = getCalendarEvents(nayon, getMyanmarDate(nayon), "my");

  assert.ok(
    kasonEvents.some(
      event => event.id === "vesak" && event.source === "official-2026"
    )
  );
  assert.ok(
    nayonEvents.some(
      event => event.id === "mahathamaya-day" && event.kind === "religious"
    )
  );
  assert.ok(!nayonEvents.some(event => event.kind === "public-holiday"));
});

test("uses the released 2027 schedule, including bridge holidays", () => {
  const representativeDates = [
    "2027-01-08",
    "2027-02-07",
    "2027-03-01",
    "2027-03-22",
    "2027-04-12",
    "2027-04-20",
    "2027-05-21",
    "2027-10-16",
    "2027-11-22",
    "2027-12-27",
  ];

  for (const value of representativeDates) {
    const date = civilDate(value);
    const events = getCalendarEvents(date, getMyanmarDate(date), "my");
    assert.ok(
      events.some(
        event =>
          event.kind === "public-holiday" && event.source === "official-2027"
      ),
      `${value} should include a released 2027 public holiday`
    );
  }

  const officialDates = Array.from(
    { length: 365 },
    (_, offset) => new Date(2027, 0, offset + 1, 12)
  ).filter(date =>
    getCalendarEvents(date, getMyanmarDate(date), "my").some(
      event => event.source === "official-2027"
    )
  );
  assert.equal(officialDates.length, 32);
});

test("official annual schedules suppress obsolete calculated closure days", () => {
  for (const value of ["2027-04-21", "2027-11-12"]) {
    const date = civilDate(value);
    const events = getCalendarEvents(date, getMyanmarDate(date), "my");
    assert.ok(
      !events.some(event => event.kind === "public-holiday"),
      `${value} should not be marked as a 2027 government closure`
    );
  }
});

test("calculated multi-day festival closures surround the lunar full moon", () => {
  const year = 2028;
  const dates = Array.from(
    { length: 366 },
    (_, offset) => new Date(year, 0, offset + 1, 12)
  );
  const fullMoon = dates.find(date => {
    const myanmar = getMyanmarDate(date);
    return myanmar.monthNumber === 7 && myanmar.phase === "Full moon";
  });

  assert.ok(fullMoon, "expected a Thadingyut full moon");
  for (const delta of [-1, 1]) {
    const date = new Date(
      fullMoon.getFullYear(),
      fullMoon.getMonth(),
      fullMoon.getDate() + delta,
      12
    );
    const events = getCalendarEvents(date, getMyanmarDate(date), "my");
    assert.ok(
      events.some(event => event.id === "office-holiday"),
      `${date.toDateString()} should be a closure`
    );
  }
});

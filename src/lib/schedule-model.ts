export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
};

/** A recurring weekly class transcribed from the student's academic agenda. */
export type ClassEvent = {
  id: string;
  title: string;
  weekday: Weekday;
  /** "HH:MM", 24h */
  start: string;
  /** "HH:MM", 24h */
  end: string;
  location?: string;
  professor?: string;
  notes?: string;
};

/** Response contract of POST /api/agenda/analyze. */
export type AnalyzeAgendaResponse =
  | { events: Omit<ClassEvent, 'id'>[]; warnings: string[] }
  | { error: string };

export function todayWeekday(date = new Date()): Weekday {
  // Date#getDay: 0 = Sunday … 6 = Saturday
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

export function sortEvents(events: ClassEvent[]) {
  return [...events].sort(
    (a, b) =>
      WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday) || a.start.localeCompare(b.start),
  );
}

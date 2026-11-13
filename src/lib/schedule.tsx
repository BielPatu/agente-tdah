import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { sortEvents, type ClassEvent, type Weekday } from './schedule-model';

export * from './schedule-model';

type ClassEventRow = {
  id: string;
  title: string;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  location: string | null;
  professor: string | null;
  notes: string | null;
};

function fromRow(row: ClassEventRow): ClassEvent {
  return {
    id: row.id,
    title: row.title,
    weekday: row.weekday,
    start: row.start_time,
    end: row.end_time,
    location: row.location ?? undefined,
    professor: row.professor ?? undefined,
    notes: row.notes ?? undefined,
  };
}

type ScheduleContextValue = {
  events: ClassEvent[];
  isSetupComplete: boolean;
  /** False until the saved schedule has been read from the database. */
  isLoaded: boolean;
  completeSetup: (events: ClassEvent[]) => Promise<void>;
  resetSetup: () => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

/** Weekly classes persisted on-device with expo-sqlite (see src/lib/db.ts). */
export function ScheduleProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await db.getAllAsync<ClassEventRow>(
          'SELECT id, title, weekday, start_time, end_time, location, professor, notes FROM class_events',
        );
        const setting = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM app_settings WHERE key = 'setup_complete'",
        );
        if (cancelled) return;
        setEvents(sortEvents(rows.map(fromRow)));
        setIsSetupComplete(setting?.value === '1');
      } catch (error) {
        console.error('[schedule] failed to load from database', error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  async function completeSetup(next: ClassEvent[]) {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM class_events');
      for (const e of next) {
        await db.runAsync(
          `INSERT INTO class_events (id, title, weekday, start_time, end_time, location, professor, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.title,
            e.weekday,
            e.start,
            e.end,
            e.location ?? null,
            e.professor ?? null,
            e.notes ?? null,
          ],
        );
      }
      await db.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('setup_complete', '1')",
      );
    });
    setEvents(sortEvents(next));
    setIsSetupComplete(true);
  }

  async function resetSetup() {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM class_events');
      await db.runAsync("DELETE FROM app_settings WHERE key = 'setup_complete'");
    });
    setEvents([]);
    setIsSetupComplete(false);
  }

  return (
    <ScheduleContext value={{ events, isSetupComplete, isLoaded, completeSetup, resetSetup }}>
      {children}
    </ScheduleContext>
  );
}

export function useSchedule() {
  const context = use(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used inside <ScheduleProvider>.');
  }
  return context;
}

import { HDate, gematriya, Locale } from "@hebcal/core";

export const formatDate = (
  date: string | Date | number | null | undefined,
): string => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (
  date: string | Date | number | null | undefined,
): string => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
/**
 * הופכת שניות למחרוזת של דקות ושניות (מיועד לנגן מוזיקה)
 * דוגמה: 125 שניות הופך ל- "02:05"
 */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || isNaN(seconds))
    return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // שימוש ב-padStart כדי להבטיח תמיד 2 ספרות
  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(remainingSeconds).padStart(2, "0");

  return `${displayMinutes}:${displaySeconds}`;
};
export const formatHebrewDate = (
  date: string | Date | number | null | undefined,
): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const hd = new HDate(d);
  const day = gematriya(hd.getDate());
  const year = gematriya(hd.getFullYear());
  // Use he-x-NoNikud to avoid nikud if preferred, or 'he' for standard.
  // Using 'he' usually includes nikud. If a clean look is desired, try 'he-x-NoNikud' if available, otherwise 'he'.
  const monthName = Locale.gettext(hd.getMonthName(), "he-x-NoNikud");

  return `${day} ${monthName} ${year}`;
};

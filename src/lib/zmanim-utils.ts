import { HDate, Location, Zmanim } from "@hebcal/core";

// פונקציית עזר: נסה לקבל מהספריה, אם לא קיים - השתמש בערך ברירת המחדל
const getSystemLocation = (name: string) => Location.lookup(name);

const LOCATIONS: Record<string, Location> = {
  // ירושלים: עדיפות לנתונים הרשמיים של Hebcal, אם לא קיים - שימוש בברירת מחדל
  Jerusalem:
    getSystemLocation("Jerusalem") ||
    new Location(
      31.778,
      35.235,
      true,
      "Asia/Jerusalem",
      "Jerusalem",
      "IL",
      undefined,
      800
    ),

  // בית שמש: קואורדינטות מעודכנות (31°42'45.5"N 34°57'53.4"E)
  BeitShemesh: new Location(
    31.71264,
    34.96483,
    true,
    "Asia/Jerusalem",
    "Beit Shemesh",
    "IL",
    undefined,
    329.19
  ),

  // צפת: קואורדינטות העיר העתיקה וגובה 900 מטר (משמעותי לזמנים)
  Safed: new Location(
    32.9658,
    35.4985,
    true,
    "Asia/Jerusalem",
    "Safed",
    "IL",
    undefined,
    900
  ),

  // אומן: קואורדינטות אזור הציון
  Uman: new Location(
    48.7484,
    30.2218,
    false,
    "Europe/Kiev",
    "Uman",
    "UA",
    undefined,
    240
  ),
};

/** מחזיר אובייקט Zmanim עבור תאריך ומיקום */

export function getZmanimForDate(date: Date, locationName: string) {
  const location = LOCATIONS[locationName] || LOCATIONS["Jerusalem"];
  const hdate = new HDate(date);

  // שימוש ב-3 פרמטרים כנדרש ע"י הספריה: מיקום, תאריך, והאם להשתמש בגובה (true)
  return new Zmanim(location, hdate, true);
}

/** מחזיר מנחה דינמית לפי דקות לפני השקיעה */
export function getMinchaBeforeSunset(
  zmanim: Zmanim,
  minutesBefore: number
): Date | null {
  const sunset = zmanim.sunset();
  if (!sunset) return null;
  return new Date(sunset.getTime() - minutesBefore * 60_000);
}

/** פורמט שעה נוח להצגה */
export function formatTime(date?: Date | null): string {
  if (!date) return "-";
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

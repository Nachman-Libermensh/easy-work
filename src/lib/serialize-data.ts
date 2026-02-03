/**
 * פונקציית עזר להכנת נתונים מהשרת לקליינט.
 * היא עוברת על האובייקט בצורה רקורסיבית וממירה רק שדות Decimal למספרים,
 * תוך שמירה על תאריכים (Dates) ואובייקטים פשוטים.
 * נוצר בעיקר עבור פעולות שרת שמעבירות מידע לקומפוננטות לקוח
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  // טיפול במערכים
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  // טיפול באובייקטים
  if (typeof data === "object") {
    // אם זה אובייקט מסוג Date, החזר אותו כמות שהוא (Next.js תומך ב-Date ב-Server Actions)
    if (data instanceof Date) return data as unknown as T;

    // בדיקה אם האובייקט הוא Decimal (לפי המבנה של Prisma/Decimal.js)
    if (
      (data as any).constructor?.name === "Decimal" ||
      (data as any).d !== undefined
    ) {
      return Number(data) as unknown as T;
    }

    // מעבר רקורסיבי על כל המפתחות באובייקט
    const entries = Object.entries(data).map(([key, value]) => [
      key,
      serializeData(value),
    ]);

    return Object.fromEntries(entries) as T;
  }

  //  typeof value === "bigint" ? value.toString() : value
  return data;
}

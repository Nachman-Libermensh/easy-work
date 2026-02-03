"use client";

import { useZmanim } from "@/src/hooks/useZmanim";
import { useState } from "react";
import { FieldSet, FieldLabel, FieldContent } from "../../ui/field";
import { ItemGroup, Item, ItemTitle, ItemDescription } from "../../ui/item";

const HEBREW_LABELS: Record<string, string> = {
  alotHashachar: "עלות השחר",
  sunrise: "הנץ החמה",
  sofZmanShma: 'סוף זמן קריאת שמע (גר"א)',
  sofZmanTfilla: 'סוף זמן תפילה (גר"א)',
  chatzot: "חצות היום",
  minchaGedola: "מנחה גדולה",
  sunset: "שקיעה",
  tzeit: "צאת הכוכבים",
  minchaDynamic: "זמן מנחה (לפני שקיעה)",
};

const CITIES = [
  { id: "Jerusalem", label: "ירושלים" },
  { id: "BeitShemesh", label: "בית שמש" },
  { id: "Safed", label: "צפת" },
  { id: "Uman", label: "אומן (אוקראינה)" },
];

export default function ZmanimTestPage() {
  const [date, setDate] = useState(new Date());
  const [minchaOffset, setMinchaOffset] = useState(30);
  const [location, setLocation] = useState("Jerusalem");

  const zmanim = useZmanim(date, location, minchaOffset);

  return (
    <div className="p-4 space-y-4 text-right" dir="rtl">
      <FieldSet>
        <FieldLabel>מיקום</FieldLabel>
        <FieldContent>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-1 rounded w-full max-w-xs"
          >
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </FieldContent>

        <FieldLabel>תאריך</FieldLabel>
        <FieldContent>
          <input
            type="date"
            value={date.toISOString().slice(0, 10)}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="border p-1 rounded w-full max-w-xs"
          />
        </FieldContent>

        <FieldLabel>מנחה (דקות לפני השקיעה)</FieldLabel>
        <FieldContent>
          <input
            type="number"
            value={minchaOffset}
            onChange={(e) => setMinchaOffset(Number(e.target.value))}
            className="border p-1 rounded w-full max-w-xs"
          />
        </FieldContent>
      </FieldSet>

      <ItemGroup>
        {Object.entries(zmanim).map(([key, time]) => (
          <Item key={key}>
            <ItemTitle>{HEBREW_LABELS[key] || key}</ItemTitle>
            <ItemDescription>{time}</ItemDescription>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}

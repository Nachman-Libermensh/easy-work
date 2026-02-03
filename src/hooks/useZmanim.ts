import { useMemo } from "react";
import { HDate, Location, Zmanim } from "@hebcal/core";
import {
  getZmanimForDate,
  getMinchaBeforeSunset,
  formatTime,
} from "../lib/zmanim-utils";
// import {
//
// } from "./zmanim-utils";

export type ZmanimResult = {
  alotHashachar: string;
  sunrise: string;
  sofZmanShma: string;
  sofZmanTfilla: string;
  chatzot: string;
  minchaGedola: string;
  sunset: string;
  tzeit: string;
  minchaDynamic: string;
};

export function useZmanim(
  date: Date,
  locationName: string,
  minchaOffsetMinutes: number = 30
): ZmanimResult {
  return useMemo(() => {
    const zmanim = getZmanimForDate(date, locationName);

    return {
      alotHashachar: formatTime(zmanim.alotHaShachar()), // Correct Halachic Dawn (16.1deg)
      sunrise: formatTime(zmanim.sunrise()), // Netz HaChama
      sofZmanShma: formatTime(zmanim.sofZmanShma()),
      sofZmanTfilla: formatTime(zmanim.sofZmanTfilla()),
      chatzot: formatTime(zmanim.chatzot()),
      minchaGedola: formatTime(zmanim.minchaGedola()),
      sunset: formatTime(zmanim.sunset()),
      tzeit: formatTime(zmanim.tzeit()),
      minchaDynamic: formatTime(
        getMinchaBeforeSunset(zmanim, minchaOffsetMinutes)
      ),
    };
  }, [date, locationName, minchaOffsetMinutes]);
}

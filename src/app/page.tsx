"use client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import ToggleTheme from "../components/ui/custom/toggle-theme";

export default function Home() {
  return (
    <Card className="mt-7 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          ברוכים הבאים לבית הכנסת &quot;ברכת הנחל - ברסלב&quot;
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 bg-transparent">
        <Image
          src="/logo.png" // Assuming the file is named something like this or keeping a placeholder until the exact path is known. The user mentioned "the file" but didn't provide a path, standardizing on a likely name.
          alt="Birkat HaNachal Synagogue"
          width={130}
          height={130}
          className="rounded-lg  object-cover"
        />
        <p className="text-center text-muted-foreground text-lg">
          מערכת לניהול גבייה, הוצאות ופרויקט הרחבת בית הכנסת
        </p>
      </CardContent>
    </Card>
  );
}

import { SignInForm } from "@/src/components/pages/auth/sign-in.form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Metadata } from "next";
import Image from "next/image"; // ייבוא רכיב התמונה

export const metadata: Metadata = {
  title: "כניסה",
  description: "כניסה למערכת",
};

export default function SignInPage() {
  return (
    <div className="container mx-auto flex h-screen w-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-white/20 dark:border-slate-800/50 shadow-xl">
        <CardHeader className="flex flex-col items-center space-y-4 text-center">
          {/* הצגת הלוגו */}
          <div className="rounded-full bg-white p-2 shadow-sm dark:bg-slate-900">
            <Image
              src="/logo.png" // נתיב יחסי לתיקיית public
              alt="לוגו ברכת הנחל"
              width={64}
              height={64}
              priority
              className="object-contain"
            />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              כניסה למערכת
            </CardTitle>
            <CardDescription>הזן את פרטיך כדי להיכנס לחשבון</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}

import { SignUpForm } from "@/src/components/pages/auth/sign-up.form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "הרשמה למערכת ניהול בית הכנסת ברכת הנחל",
};

const Page = () => {
  return (
    <div className="container mx-auto flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">הרשמה למערכת</h1>
          <p className="text-muted-foreground text-sm">
            הזן את פרטיך כדי ליצור חשבון משתמש חדש
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default Page;

import ProfilePage from "@/src/components/pages/profile";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
export const generateMetadata = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return {
      title: "פרופיל משתמש - התחברות נדרשת",
    };
  }
  return {
    title: `עריכת פרטים | ${session.user.name}`,
  };
};
const page = () => {
  return <ProfilePage />;
};
export default page;

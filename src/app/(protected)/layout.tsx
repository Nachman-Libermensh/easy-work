import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div>{children}</div>;
};
export default layout;

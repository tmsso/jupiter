import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { getSessionUser } from "@/lib/auth";

// Chrome for all signed-in views. Middleware already gates auth; this is a
// second server-side guard and mounts the shared header + footer.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader />
      {children}
      <AppFooter />
    </>
  );
}

import { PageColumn } from "@/components/layout/PageColumn";
import { Composer } from "@/components/compose/Composer";
import { getSessionUser } from "@/lib/auth";
import { getSigilSet, getTodayCount, getCharLimits } from "@/lib/queries";

export default async function ComposePage() {
  const [user, sigilOptions, today, limits] = await Promise.all([
    getSessionUser(),
    getSigilSet(),
    getTodayCount(),
    getCharLimits(),
  ]);

  return (
    <PageColumn>
      <Composer
        pseudonym={user?.pseudonym ?? ""}
        sigilOptions={sigilOptions}
        todayUsed={today.used}
        todayCap={today.cap}
        maxBody={limits.maxBody}
        maxContext={limits.maxContext}
      />
    </PageColumn>
  );
}

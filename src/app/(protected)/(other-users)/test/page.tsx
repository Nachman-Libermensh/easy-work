"use client";
import ZmanimTestPage from "@/src/components/pages/test/ZmanimTestPage";
import { EmailDisplay } from "@/src/components/ui/custom/email-display";
import { LookupDisplay } from "@/src/lib/lookups/lookup-display";
import { SelectLookup } from "@/src/lib/lookups/select-lookup";
import { useLookup } from "@/src/lib/lookups/use-lookup";
import { useState } from "react";

const Page = () => {
  const [s, sets] = useState();

  return (
    <div>
      <SelectLookup
        lookup="cities"
        value={s}
        onValueChange={(v: any) => sets(v)}
      />
      <LookupDisplay lookup="cities" value={1} />

      <EmailDisplay email="example@example.com" />
    </div>
  );
  // return <ZmanimTestPage />;
};
export default Page;

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDonorById } from "@/src/api-services/donors.service";
import { buttonVariants } from "../../../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DonorPledges } from "./donor-pledges";
import { Skeleton } from "../../../ui/skeleton";
import { LookupDisplay } from "@/src/lib/lookups/lookup-display";
import { EmailDisplay } from "@/src/components/ui/custom/email-display";

export default function DonorPage({ donorId }: { donorId: string }) {
  const { data: donor, isLoading } = useQuery({
    queryKey: ["donor", donorId],
    queryFn: () => getDonorById(donorId),
  });

  if (isLoading)
    return (
      <div className="p-4">
        <Skeleton className="h-20 w-full mb-4" />
      </div>
    );
  if (!donor) return <div className="p-4">לא נמצא תורם</div>;
  console.log("donor: ", donor);

  return (
    <div dir="rtl" className="p-4 space-y-6">
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <Link href="/donors" className={buttonVariants({ variant: "outline" })}>
          <ArrowRight className="ml-2 h-4 w-4" />
          חזרה לרשימה
        </Link>
        <div className="border-r pr-4 mr-2">
          <h1 className="text-2xl font-bold">
            {donor.firstName} {donor.lastName}
          </h1>
          <div className="text-muted-foreground flex gap-4 mt-1 text-sm">
            <EmailDisplay email={donor.email} />
            <span>{donor.phone}</span>
            <LookupDisplay lookup="cities" value={donor.cityId} />
          </div>
        </div>
      </div>

      <DonorPledges donorId={donorId} />
    </div>
  );
}

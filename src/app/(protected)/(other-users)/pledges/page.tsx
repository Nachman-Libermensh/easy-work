import React from "react";
import { getPledgesWithProgress } from "@/src/api-services/data/pledges";
import { PledgesTable } from "@/src/components/pages/pledges/pledges-table";

export default async function PledgesPage() {
  const data = await getPledgesWithProgress();

  return <PledgesTable data={data} />;
}

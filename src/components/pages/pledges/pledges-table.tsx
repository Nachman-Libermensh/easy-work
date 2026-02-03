"use client";

import DataTable from "@/src/components/ui/custom/data-table";
import { PledgeWithProgress } from "@/src/api-services/data/pledges";
import { columns } from "./columns";

interface DonationsTableProps {
  data: PledgeWithProgress[];
}

export function PledgesTable({ data }: DonationsTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          התחייבויות והוראות קבע
        </h1>
      </div>

      <DataTable
        columns={columns}
        data={data}
        status="success"
        title="רשימת התחייבויות"
        // filterColumn="donorName" - אם ה-DataTable תומך בזה
      />
    </div>
  );
}

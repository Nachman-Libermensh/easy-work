"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProjectById,
  getProjectStats,
} from "@/src/api-services/projects.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Skeleton } from "../../../ui/skeleton";
import { PledgesTab } from "./pledges-tab";

import { ExpensesTab } from "./expenses-tab";
import { DonorsTab } from "./donors-tab";
import {
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Receipt,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { DonationsTab } from "./donations-tab";

type ProjectPageProps = {
  projectId: string;
};

const ProjectPage = ({ projectId }: ProjectPageProps) => {
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: () => getProjectStats(projectId),
  });

  const statusMap: Record<string, { label: string; variant: any }> = {
    PLANNING: { label: "תכנון", variant: "secondary" },
    ACTIVE: { label: "פעיל", variant: "default" },
    COMPLETED: { label: "הושלם", variant: "success" },
    PAUSED: { label: "מושהה", variant: "destructive" },
  };

  if (projectLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-4">פרויקט לא נמצא</div>;
  }

  const status = statusMap[project.status] || statusMap.ACTIVE;
  const targetAmount = Number(project.targetAmount || 0);
  const pledgesPercentage =
    targetAmount > 0
      ? ((Number(stats?.totalPledged || 0) / targetAmount) * 100).toFixed(1)
      : "0";
  const receivedPercentage =
    targetAmount > 0
      ? ((Number(stats?.totalReceived || 0) / targetAmount) * 100).toFixed(1)
      : "0";
  const expensesPercentage =
    targetAmount > 0
      ? ((Number(stats?.totalExpenses || 0) / targetAmount) * 100).toFixed(1)
      : "0";

  return (
    <div dir="rtl" className="p-4 space-y-6">
      {/* Header & Navigation */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            <span className="text-lg leading-none pb-1">→</span>
            חזרה לרשימת הפרויקטים
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <Badge variant={status.variant} className="text-sm px-3">
                {status.label}
              </Badge>
            </div>

            {project.description && (
              <p className="text-muted-foreground text-lg">
                {project.description}
              </p>
            )}
          </div>

          {project.managerName && (
            <Card className="min-w-[240px] shadow-sm bg-muted/20 border-muted">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    אחראי פרויקט
                  </p>
                  <p className="text-sm font-semibold">{project.managerName}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Target & Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>סקירת יעד הפרויקט</CardTitle>
          <CardDescription>
            יעד: ₪{targetAmount.toLocaleString()} • יתרה: ₪
            {Number(stats?.balance || 0).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pledges vs Target */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">התחייבויות</span>
                <span className="text-muted-foreground">
                  {pledgesPercentage}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ₪{Number(stats?.totalPledged || 0).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / ₪{targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${Math.min(Number(pledgesPercentage), 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.pledgesCount} התחייבויות
              </p>
            </div>

            {/* Received vs Target */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">נתקבל בפועל</span>
                <span className="text-muted-foreground">
                  {receivedPercentage}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  ₪{Number(stats?.totalReceived || 0).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / ₪{targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(Number(receivedPercentage), 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.transactionsCount} תרומות
              </p>
            </div>

            {/* Expenses vs Target */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">הוצאות</span>
                <span className="text-muted-foreground">
                  {expensesPercentage}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-600">
                  ₪{Number(stats?.totalExpenses || 0).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  / ₪{targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{
                    width: `${Math.min(Number(expensesPercentage), 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.expensesCount} הוצאות
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pledges" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pledges">
            <FileText className="ml-2 h-4 w-4" />
            התחייבויות
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <CreditCard className="ml-2 h-4 w-4" />
            תרומות
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="ml-2 h-4 w-4" />
            הוצאות
          </TabsTrigger>
          <TabsTrigger value="donors">
            <Users className="ml-2 h-4 w-4" />
            תורמים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pledges" className="mt-4">
          <PledgesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <DonationsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ExpensesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="donors" className="mt-4">
          <DonorsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;

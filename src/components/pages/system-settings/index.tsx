"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import CountriesTab from "./countries";
import CurrenciesTab from "./currencies";
import IncomeSourcesTab from "./income-sources";

const SettingsPage = () => {
  return (
    <div className="p-4 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">הגדרות מערכת</h1>

      <Tabs defaultValue="income-sources" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 ">
          <TabsTrigger value="income-sources">מקורות הכנסה</TabsTrigger>
          <TabsTrigger value="cities">ערים</TabsTrigger>
          <TabsTrigger value="currencies">מטבעות</TabsTrigger>
        </TabsList>
        <TabsContent value="income-sources" className="mt-4">
          <IncomeSourcesTab />
        </TabsContent>
        <TabsContent value="cities" className="mt-4">
          <CountriesTab />
        </TabsContent>
        <TabsContent value="currencies" className="mt-4">
          <CurrenciesTab />
        </TabsContent>

        {/* If you want payment methods as well, add another tab */}
      </Tabs>
    </div>
  );
};
export default SettingsPage;

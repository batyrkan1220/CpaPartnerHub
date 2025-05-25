import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { TopOffers } from "@/components/dashboard/top-offers";
import { TopPartners } from "@/components/dashboard/top-partners";
import { useUser } from "@/lib/auth";

export default function Dashboard() {
  const { data } = useUser();
  const user = data?.user;
  const isAdmin = user?.role === "admin";
  const isAdvertiser = user?.role === "advertiser";
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Панель управления</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Обзор основных показателей вашей CPA платформы</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <span className="hidden sm:block">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <span className="material-icons text-neutral-500 mr-2 text-sm">file_download</span>
                Экспорт
              </Button>
            </span>
            <span className="ml-3 hidden sm:block">
              {(isAdmin || isAdvertiser) && (
                <Button size="sm" asChild>
                  <Link href="/offers/create">
                    <span className="material-icons mr-2 text-sm">add</span>
                    Новый оффер
                  </Link>
                </Button>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Обзор метрик */}
      <MetricsOverview />
      
      {/* Графики эффективности */}
      <PerformanceCharts />
      
      {/* Топ офферы и партнеры */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopOffers />
        {isAdmin && <TopPartners />}
      </div>
    </>
  );
}

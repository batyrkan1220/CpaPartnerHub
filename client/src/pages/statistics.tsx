import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import Chart from "chart.js/auto";
import { useUser } from "@/lib/auth";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";

type LeadStats = {
  total: number,
  approved: number,
  rejected: number,
  pending: number,
  conversionRate: number
};

export default function StatisticsPage() {
  const { data: userData } = useUser();
  const user = userData?.user;
  
  const [activeTab, setActiveTab] = useState("general");
  const [dateRange, setDateRange] = useState("month");
  
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const sourceChartRef = useRef<HTMLCanvasElement>(null);
  
  // Получаем общую статистику по лидам
  const { data: leadStats, isLoading } = useQuery<LeadStats>({
    queryKey: ["/api/stats/leads"],
  });
  
  // Инициализация графиков при загрузке данных
  useEffect(() => {
    let lineChart: Chart | null = null;
    let pieChart: Chart | null = null;
    let sourceChart: Chart | null = null;
    
    if (lineChartRef.current && !isLoading) {
      const ctx = lineChartRef.current.getContext("2d");
      if (ctx) {
        // Генерируем даты для последних 30 дней
        const dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 29 + i);
          return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        });
        
        // Демо-данные для графика
        const leadsData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 30);
        const conversionsData = leadsData.map(value => Math.floor(value * (0.6 + Math.random() * 0.3)));
        
        lineChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Лиды",
                data: leadsData,
                borderColor: "hsl(var(--primary))",
                backgroundColor: "hsla(var(--primary), 0.1)",
                tension: 0.3,
                fill: true,
              },
              {
                label: "Конверсии",
                data: conversionsData,
                borderColor: "hsl(var(--success))",
                backgroundColor: "hsla(var(--success), 0.1)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                },
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
            },
          },
        });
      }
    }
    
    if (pieChartRef.current && !isLoading && leadStats) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        pieChart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Подтверждено", "Отклонено", "На рассмотрении"],
            datasets: [
              {
                data: [leadStats.approved, leadStats.rejected, leadStats.pending],
                backgroundColor: [
                  "hsl(var(--success))",
                  "hsl(var(--error))",
                  "hsl(var(--warning))",
                ],
                borderWidth: 1,
                borderColor: "hsl(var(--background))",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                },
              },
            },
          },
        });
      }
    }
    
    if (sourceChartRef.current && !isLoading) {
      const ctx = sourceChartRef.current.getContext("2d");
      if (ctx) {
        sourceChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Таргет FB/VK", "Контекст", "SEO", "Тизеры", "Push", "Другое"],
            datasets: [
              {
                label: "Лиды по источникам",
                data: [35, 25, 15, 12, 8, 5],
                backgroundColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--success))",
                  "hsl(var(--chart-5))",
                  "hsl(var(--neutral-400))",
                ],
                borderWidth: 1,
                borderColor: "transparent",
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
            },
          },
        });
      }
    }
    
    return () => {
      if (lineChart) {
        lineChart.destroy();
      }
      if (pieChart) {
        pieChart.destroy();
      }
      if (sourceChart) {
        sourceChart.destroy();
      }
    };
  }, [isLoading, leadStats, activeTab]);
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Статистика</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Анализ эффективности работы CPA платформы</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" size="sm" className={dateRange === "week" ? "bg-primary/10" : ""} onClick={() => setDateRange("week")}>
              Неделя
            </Button>
            <Button variant="outline" size="sm" className={dateRange === "month" ? "bg-primary/10" : ""} onClick={() => setDateRange("month")}>
              Месяц
            </Button>
            <Button variant="outline" size="sm" className={dateRange === "quarter" ? "bg-primary/10" : ""} onClick={() => setDateRange("quarter")}>
              Квартал
            </Button>
            <Button variant="outline" size="sm" className={dateRange === "year" ? "bg-primary/10" : ""} onClick={() => setDateRange("year")}>
              Год
            </Button>
          </div>
        </div>
      </div>
      
      {/* Основные метрики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Всего лидов</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : formatNumber(leadStats?.total || 0)}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <span className="material-icons text-primary">pie_chart</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Подтверждено</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : formatNumber(leadStats?.approved || 0)}</h3>
              </div>
              <div className="bg-success/10 p-3 rounded-full">
                <span className="material-icons text-success">check_circle</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Конверсия</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? "..." : formatPercent(leadStats?.conversionRate || 0)}</h3>
              </div>
              <div className="bg-secondary/10 p-3 rounded-full">
                <span className="material-icons text-secondary">trending_up</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Доход</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(624938)}</h3>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <span className="material-icons text-accent">account_balance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Вкладки с разными видами статистики */}
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общая статистика</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
          <TabsTrigger value="offers">Офферы</TabsTrigger>
          {user?.role === "admin" && <TabsTrigger value="partners">Партнеры</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="general" className="space-y-5">
          {/* График конверсий */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика лидов и конверсий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <canvas ref={lineChartRef}></canvas>
              </div>
            </CardContent>
          </Card>
          
          {/* Круговая диаграмма статусов */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение статусов лидов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-[250px]">
                  <canvas ref={pieChartRef}></canvas>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                      <span>Подтверждено</span>
                    </div>
                    <div className="font-semibold">{isLoading ? "..." : formatNumber(leadStats?.approved || 0)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-error mr-2"></div>
                      <span>Отклонено</span>
                    </div>
                    <div className="font-semibold">{isLoading ? "..." : formatNumber(leadStats?.rejected || 0)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                      <span>На рассмотрении</span>
                    </div>
                    <div className="font-semibold">{isLoading ? "..." : formatNumber(leadStats?.pending || 0)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Лиды по источникам трафика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <canvas ref={sourceChartRef}></canvas>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offers" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Эффективность офферов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Оффер</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Лиды</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Аппрув</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">CR</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">EPC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Доход</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded bg-primary-light/10 flex items-center justify-center">
                            <span className="material-icons text-primary text-sm">local_offer</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                              Кредитная карта ВТБ
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              Финансы
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">385</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">83%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">12.4%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">₽412</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-200">
                        ₽158,350
                      </td>
                    </tr>
                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded bg-secondary-light/10 flex items-center justify-center">
                            <span className="material-icons text-secondary text-sm">local_offer</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                              Займ Быстроденьги
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              Микрозаймы
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">291</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">76%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">9.7%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">₽330</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-200">
                        ₽96,030
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {user?.role === "admin" && (
          <TabsContent value="partners" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Эффективность партнеров</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Партнер</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Лиды</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Аппрув</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Фрод</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Заработок</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                      <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                              ИС
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                Иванов Сергей
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                FB Таргет, VK Таргет
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">432</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-200">81%</div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 dark:bg-neutral-700">
                            <div className="bg-success h-1.5 rounded-full" style={{ width: "81%" }}></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-success">Низкий</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          ₽142,560
                        </td>
                      </tr>
                      <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary-light flex items-center justify-center text-white">
                              ПА
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                Петров Алексей
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                Контекст, SEO
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">376</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-200">74%</div>
                          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 dark:bg-neutral-700">
                            <div className="bg-success h-1.5 rounded-full" style={{ width: "74%" }}></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-success">Низкий</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          ₽118,240
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

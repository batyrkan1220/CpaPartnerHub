import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import { formatNumber, formatPercent } from "@/lib/utils";
import Chart from "chart.js/auto";

type FraudMetrics = {
  overallFraudRate: number;
  suspiciousPartners: number;
  flaggedLeads: number;
};

type Partner = {
  id: number;
  fullName: string;
  avatarInitials: string;
  trafficSources: string | null;
  fraudScore: number;
};

type Lead = {
  id: number;
  offerId: number;
  partnerId: number;
  status: string;
  createdAt: string;
  fraudFlags: any;
  data: any;
};

export default function AntiFraudPage() {
  const { data: userData } = useUser();
  const user = userData?.user;
  
  // Проверка прав доступа (только для админов)
  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          У вас нет прав для просмотра этой страницы
        </p>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState("overview");
  
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  
  // Получение статистики по фроду
  const { data: fraudMetrics, isLoading: isLoadingMetrics } = useQuery<FraudMetrics>({
    queryKey: ["/api/stats/fraud"],
  });
  
  // Получение списка партнеров с высоким фрод-скором
  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ["/api/users?role=partner"],
  });
  
  // Получение списка помеченных лидов
  const { data: leads, isLoading: isLoadingLeads } = useQuery<Lead[]>({
    queryKey: ["/api/leads?fraudFlags=true"],
  });
  
  // Подозрительные партнеры (с высоким фрод-скором)
  const suspiciousPartners = partners?.filter(partner => partner.fraudScore > 0.7) || [];
  
  // Подозрительные лиды
  const suspiciousLeads = leads?.filter(lead => lead.fraudFlags !== null) || [];
  
  // Инициализация графиков
  useEffect(() => {
    let lineChart: Chart | null = null;
    let pieChart: Chart | null = null;
    
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext("2d");
      if (ctx) {
        // Генерируем даты для последних 30 дней
        const dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 29 + i);
          return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        });
        
        // Демо-данные для графика фрод-активности по дням
        const fraudRateData = Array.from({ length: 30 }, () => Math.random() * 3);
        
        lineChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Фрод активность (%)",
                data: fraudRateData,
                borderColor: "hsl(var(--error))",
                backgroundColor: "hsla(var(--error), 0.1)",
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
    
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        pieChart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Таргетированная реклама", "Тизерные сети", "Push-уведомления", "Другие источники"],
            datasets: [
              {
                data: [40, 30, 20, 10],
                backgroundColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--error))",
                  "hsl(var(--warning))",
                  "hsl(var(--neutral-400))",
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
              title: {
                display: true,
                text: "Источники фрода",
                font: {
                  size: 14,
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
    };
  }, [isLoadingMetrics]);
  
  // Функция для определения уровня риска по скору
  const getFraudRiskLevel = (score: number): { text: string; color: string } => {
    if (score >= 0.7) {
      return { text: "Высокий", color: "text-error" };
    } else if (score >= 0.3) {
      return { text: "Средний", color: "text-warning" };
    } else {
      return { text: "Низкий", color: "text-success" };
    }
  };
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Анти-фрод система</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Мониторинг и анализ подозрительной активности</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <span className="material-icons mr-2 text-sm">shield</span>
              Настройки фрод-защиты
            </Button>
          </div>
        </div>
      </div>
      
      {/* Основные метрики */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Общий уровень фрода</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    formatPercent(fraudMetrics?.overallFraudRate || 0)
                  )}
                </h3>
              </div>
              <div className="bg-error/10 p-3 rounded-full">
                <span className="material-icons text-error">gpp_maybe</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Подозрительные партнеры</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    formatNumber(fraudMetrics?.suspiciousPartners || 0)
                  )}
                </h3>
              </div>
              <div className="bg-warning/10 p-3 rounded-full">
                <span className="material-icons text-warning">person_off</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Помеченные лиды</p>
                <h3 className="text-2xl font-bold mt-1">
                  {isLoadingMetrics ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    formatNumber(fraudMetrics?.flaggedLeads || 0)
                  )}
                </h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <span className="material-icons text-primary">report_problem</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Вкладки с разными видами анализа */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="partners">Подозрительные партнеры</TabsTrigger>
          <TabsTrigger value="leads">Подозрительные лиды</TabsTrigger>
          <TabsTrigger value="rules">Правила фрод-защиты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-5">
          {/* График фрод-активности */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика фрод-активности</CardTitle>
              <CardDescription>Процент подозрительных лидов по дням</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <canvas ref={lineChartRef}></canvas>
              </div>
            </CardContent>
          </Card>
          
          {/* Распределение фрода по источникам */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Источники фрода</CardTitle>
                <CardDescription>Распределение фрода по типам трафика</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <canvas ref={pieChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Типы фрод-активности</CardTitle>
                <CardDescription>Наиболее распространенные виды мошенничества</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-error mr-2"></div>
                      <span>Дублирование лидов</span>
                    </div>
                    <div className="font-semibold">45%</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 dark:bg-neutral-700">
                    <div className="bg-error h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                      <span>Недействительные данные</span>
                    </div>
                    <div className="font-semibold">30%</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 dark:bg-neutral-700">
                    <div className="bg-warning h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      <span>Подозрительная активность</span>
                    </div>
                    <div className="font-semibold">15%</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 dark:bg-neutral-700">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-neutral-400 mr-2"></div>
                      <span>Другие типы</span>
                    </div>
                    <div className="font-semibold">10%</div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 dark:bg-neutral-700">
                    <div className="bg-neutral-400 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="partners" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Партнеры с высоким фрод-скором</CardTitle>
              <CardDescription>Список партнеров с подозрительной активностью</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-5 w-36 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : suspiciousPartners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Источники трафика</TableHead>
                      <TableHead>Фрод-скор</TableHead>
                      <TableHead>Уровень риска</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousPartners.map((partner) => {
                      const riskLevel = getFraudRiskLevel(partner.fraudScore);
                      return (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-error flex items-center justify-center text-white">
                                {partner.avatarInitials}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium">{partner.fullName}</div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  ID: {partner.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{partner.trafficSources || "Не указано"}</TableCell>
                          <TableCell className="font-medium">
                            {(partner.fraudScore * 10).toFixed(1)} / 10
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`bg-${riskLevel.color.split('-')[1]}/10 ${riskLevel.color} border-${riskLevel.color.split('-')[1]}/20`}>
                              {riskLevel.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg mb-2">Подозрительные партнеры не найдены</div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    На данный момент нет партнеров с высоким фрод-скором
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Помеченные лиды</CardTitle>
              <CardDescription>Список лидов с подозрительной активностью</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : suspiciousLeads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID лида</TableHead>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Оффер</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Причина</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">#{lead.id}</TableCell>
                        <TableCell>ID: {lead.partnerId}</TableCell>
                        <TableCell>ID: {lead.offerId}</TableCell>
                        <TableCell>
                          {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-error/10 text-error border-error/20">
                            {lead.fraudFlags?.reason || "Подозрительная активность"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Проверить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg mb-2">Подозрительные лиды не найдены</div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    На данный момент нет лидов, помеченных системой фрод-защиты
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Правила фрод-защиты</CardTitle>
              <CardDescription>Настройка и управление правилами обнаружения фрода</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Дублирование лидов</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        Обнаружение повторной отправки одинаковых данных лида
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-success/10 text-success border-success/20">Активно</Badge>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Валидация данных</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        Проверка корректности и полноты введенных данных
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-success/10 text-success border-success/20">Активно</Badge>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Анализ IP-адресов</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        Обнаружение подозрительной активности с одного IP-адреса
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-success/10 text-success border-success/20">Активно</Badge>
                      <Button variant="outline" size="sm">Настроить</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 dark:border-neutral-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Анализ поведения</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        Обнаружение нетипичного поведения пользователей
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">Неактивно</Badge>
                      <Button variant="outline" size="sm">Включить</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>
                    <span className="material-icons mr-2 text-sm">add</span>
                    Добавить новое правило
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

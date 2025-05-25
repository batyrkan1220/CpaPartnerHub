import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

type Partner = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarInitials: string;
  balance: number;
  trafficSources: string | null;
  isActive: boolean;
  fraudScore: number;
};

export default function PartnersPage() {
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
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: partners, isLoading, error } = useQuery<Partner[]>({
    queryKey: ["/api/users?role=partner"],
  });
  
  // Фильтрация партнеров по поисковому запросу
  const filteredPartners = partners?.filter((partner) => 
    partner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Партнеры</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Управление партнерами платформы</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <span className="material-icons mr-2 text-sm">person_add</span>
              Добавить партнера
            </Button>
          </div>
        </div>
      </div>
      
      {/* Поиск */}
      <div className="mb-6">
        <Input
          placeholder="Поиск партнеров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md"
          icon="search"
        />
      </div>
      
      {/* Список партнеров */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {isLoading ? (
          // Скелетон загрузки
          Array(4).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-5 w-36 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center p-8">
            <div className="text-error text-lg mb-2">Ошибка при загрузке партнеров</div>
            <p className="text-neutral-600 dark:text-neutral-400">Пожалуйста, попробуйте обновить страницу</p>
          </div>
        ) : filteredPartners && filteredPartners.length > 0 ? (
          filteredPartners.map((partner) => {
            // Определение цвета для скора фрода
            let fraudScoreColor = "text-success";
            if (partner.fraudScore > 0.7) {
              fraudScoreColor = "text-error";
            } else if (partner.fraudScore > 0.3) {
              fraudScoreColor = "text-warning";
            }
            
            return (
              <Card key={partner.id} className={partner.isActive ? "" : "opacity-70"}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-lg">
                        {partner.avatarInitials}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg">{partner.fullName}</h3>
                          {!partner.isActive && (
                            <Badge variant="outline" className="ml-2 bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                              Неактивен
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{partner.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/partners/${partner.id}`}>Профиль</a>
                    </Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Баланс</p>
                      <p className="text-lg font-semibold">{formatCurrency(partner.balance)}</p>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Фрод скор</p>
                      <p className={`text-lg font-semibold ${fraudScoreColor}`}>
                        {(partner.fraudScore * 10).toFixed(1)} / 10
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">Источники трафика:</span> {partner.trafficSources || "Не указаны"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center p-8">
            <div className="text-lg mb-2">Партнеры не найдены</div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchQuery 
                ? "Попробуйте изменить параметры поиска" 
                : "На данный момент нет зарегистрированных партнеров"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

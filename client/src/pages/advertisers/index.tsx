import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/auth";

type Advertiser = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarInitials: string;
  isActive: boolean;
};

export default function AdvertisersPage() {
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
  
  const { data: advertisers, isLoading, error } = useQuery<Advertiser[]>({
    queryKey: ["/api/users?role=advertiser"],
  });
  
  // Фильтрация рекламодателей по поисковому запросу
  const filteredAdvertisers = advertisers?.filter((advertiser) => 
    advertiser.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advertiser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advertiser.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Рекламодатели</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Управление рекламодателями платформы</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <span className="material-icons mr-2 text-sm">business_center</span>
              Добавить рекламодателя
            </Button>
          </div>
        </div>
      </div>
      
      {/* Поиск */}
      <div className="mb-6">
        <Input
          placeholder="Поиск рекламодателей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md"
          icon="search"
        />
      </div>
      
      {/* Список рекламодателей */}
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
                <div className="mt-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center p-8">
            <div className="text-error text-lg mb-2">Ошибка при загрузке рекламодателей</div>
            <p className="text-neutral-600 dark:text-neutral-400">Пожалуйста, попробуйте обновить страницу</p>
          </div>
        ) : filteredAdvertisers && filteredAdvertisers.length > 0 ? (
          filteredAdvertisers.map((advertiser) => (
            <Card key={advertiser.id} className={advertiser.isActive ? "" : "opacity-70"}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-white text-lg">
                      {advertiser.avatarInitials}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-lg">{advertiser.fullName}</h3>
                        {!advertiser.isActive && (
                          <Badge variant="outline" className="ml-2 bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                            Неактивен
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{advertiser.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/advertisers/${advertiser.id}`}>Профиль</a>
                  </Button>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/offers?advertiserId=${advertiser.id}`}>
                      <span className="material-icons mr-2 text-sm">local_offer</span>
                      Офферы
                    </a>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/statistics?advertiserId=${advertiser.id}`}>
                      <span className="material-icons mr-2 text-sm">assessment</span>
                      Статистика
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-8">
            <div className="text-lg mb-2">Рекламодатели не найдены</div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchQuery 
                ? "Попробуйте изменить параметры поиска" 
                : "На данный момент нет зарегистрированных рекламодателей"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

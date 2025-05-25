import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/auth";
import { formatCurrency, getOfferCategoryName } from "@/lib/utils";

type Offer = {
  id: number;
  title: string;
  description: string;
  category: string;
  advertiserId: number;
  paymentAmount: number;
  paymentType: string;
  requirements: string | null;
  conversionRate: number | null;
  isActive: boolean;
};

export default function OffersPage() {
  const { data: userData } = useUser();
  const user = userData?.user;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Формируем параметры запроса в зависимости от роли пользователя
  let queryUrl = "/api/offers";
  if (user?.role === "advertiser") {
    queryUrl += `?advertiserId=${user.id}`;
  }
  
  const { data: offers, isLoading, error } = useQuery<Offer[]>({
    queryKey: [queryUrl],
  });
  
  // Фильтрация офферов
  const filteredOffers = offers?.filter((offer) => {
    // Фильтр по поисковому запросу
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фильтр по категории
    const matchesCategory = categoryFilter === "all" || offer.category === categoryFilter;
    
    // Фильтр по статусу
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && offer.isActive) ||
                         (statusFilter === "inactive" && !offer.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Проверка, может ли пользователь создавать офферы
  const canCreateOffer = user?.role === "admin" || user?.role === "advertiser";
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Офферы</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {user?.role === "advertiser" 
                ? "Управление вашими офферами" 
                : "Список доступных офферов на платформе"}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {canCreateOffer && (
              <Button asChild>
                <Link href="/offers/create">
                  <span className="material-icons mr-2 text-sm">add</span>
                  Новый оффер
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Фильтры */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Фильтрация и поиск офферов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                  <SelectItem value="insurance">Страхование</SelectItem>
                  <SelectItem value="loans">Микрозаймы</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Список офферов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          // Скелетон загрузки
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center p-8">
            <div className="text-error text-lg mb-2">Ошибка при загрузке офферов</div>
            <p className="text-neutral-600 dark:text-neutral-400">Пожалуйста, попробуйте обновить страницу</p>
          </div>
        ) : filteredOffers && filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className={`overflow-hidden ${!offer.isActive ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  {offer.isActive ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Активный
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                      Неактивный
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {getOfferCategoryName(offer.category)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4">
                  {offer.description}
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Оплата:</span>
                    <span className="font-medium">{formatCurrency(offer.paymentAmount)} ({offer.paymentType})</span>
                  </div>
                  {offer.conversionRate !== null && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">Конверсия:</span>
                      <span className="font-medium">{offer.conversionRate.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/offers/${offer.id}`}>
                      Подробнее
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-8">
            <div className="text-lg mb-2">Офферы не найдены</div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Попробуйте изменить параметры фильтрации"
                : "На данный момент нет доступных офферов"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

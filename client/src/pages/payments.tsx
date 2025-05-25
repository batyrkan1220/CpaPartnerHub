import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Payment = {
  id: number;
  partnerId: number;
  amount: number;
  status: string;
  createdAt: string;
  processedAt: string | null;
  method: string;
  details: any;
};

const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: "Сумма должна быть положительным числом" }),
  method: z.string().min(1, { message: "Выберите метод выплаты" }),
  details: z.object({
    accountNumber: z.string().min(1, { message: "Введите номер счета" }),
  }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const { data: userData } = useUser();
  const user = userData?.user;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("all");
  const [openRequestPayment, setOpenRequestPayment] = useState(false);
  
  // Формируем URL в зависимости от роли пользователя
  const paymentsUrl = user?.role === "partner" ? "/api/payments" : "/api/payments";
  
  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: [paymentsUrl],
  });
  
  // Фильтрация платежей по статусу
  const filteredPayments = payments?.filter(payment => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return payment.status === "pending";
    if (activeTab === "completed") return payment.status === "completed";
    if (activeTab === "rejected") return payment.status === "rejected";
    return true;
  });
  
  // Форма для запроса выплаты
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      method: "",
      details: {
        accountNumber: "",
      },
    },
  });
  
  // Мутация для создания запроса на выплату
  const createPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormValues) => {
      return apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [paymentsUrl] });
      toast({
        title: "Запрос создан",
        description: "Запрос на выплату успешно отправлен",
      });
      setOpenRequestPayment(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать запрос на выплату. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  // Мутация для обновления статуса выплаты (для админа)
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => {
      return apiRequest("PATCH", `/api/payments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [paymentsUrl] });
      toast({
        title: "Статус обновлен",
        description: "Статус выплаты успешно обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус выплаты",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  const onSubmitPaymentRequest = (values: PaymentFormValues) => {
    createPaymentMutation.mutate(values);
  };
  
  const handleUpdateStatus = (id: number, status: string) => {
    updatePaymentStatusMutation.mutate({ id, status });
  };
  
  // Получение цвета бейджа в зависимости от статуса
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "rejected":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700";
    }
  };
  
  // Получение локализованного названия статуса
  const getStatusName = (status: string) => {
    switch (status) {
      case "completed":
        return "Выполнено";
      case "pending":
        return "В обработке";
      case "rejected":
        return "Отклонено";
      default:
        return status;
    }
  };
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Выплаты</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {user?.role === "partner" 
                ? "Управление вашими выплатами" 
                : "Управление выплатами партнерам"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {user?.role === "partner" && (
              <Dialog open={openRequestPayment} onOpenChange={setOpenRequestPayment}>
                <DialogTrigger asChild>
                  <Button>
                    <span className="material-icons mr-2 text-sm">account_balance_wallet</span>
                    Запросить выплату
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Запрос на выплату</DialogTitle>
                    <DialogDescription>
                      Заполните форму для запроса выплаты заработанных средств
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitPaymentRequest)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Сумма выплаты (₽)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1000" step="100" {...field} />
                            </FormControl>
                            <FormDescription>
                              Доступно к выводу: {formatCurrency(user?.balance || 0)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Способ выплаты</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите способ выплаты" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bank">Банковский перевод</SelectItem>
                                <SelectItem value="card">Карта</SelectItem>
                                <SelectItem value="electronic">Электронный кошелек</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="details.accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Реквизиты</FormLabel>
                            <FormControl>
                              <Input placeholder="Номер счета или карты" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setOpenRequestPayment(false)}
                        >
                          Отмена
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPaymentMutation.isPending}
                        >
                          {createPaymentMutation.isPending ? "Отправка..." : "Отправить запрос"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      
      {/* Вкладки для фильтрации по статусу */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="pending">В обработке</TabsTrigger>
          <TabsTrigger value="completed">Выполненные</TabsTrigger>
          <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Список выплат */}
      <div className="space-y-5">
        {isLoading ? (
          // Скелетон загрузки
          Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-error text-lg mb-2">Ошибка при загрузке выплат</div>
              <p className="text-neutral-600 dark:text-neutral-400">Пожалуйста, попробуйте обновить страницу</p>
            </CardContent>
          </Card>
        ) : filteredPayments && filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div className="flex items-center mb-2 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
                      <span className="material-icons">account_balance_wallet</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-lg font-semibold">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        ID: {payment.id}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusBadgeStyle(payment.status)}>
                    {getStatusName(payment.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Партнер</p>
                    <p className="font-medium">ID: {payment.partnerId}</p>
                  </div>
                  
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Метод</p>
                    <p className="font-medium">{payment.method}</p>
                  </div>
                  
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Дата запроса</p>
                    <p className="font-medium">
                      {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Обработано</p>
                    <p className="font-medium">
                      {payment.processedAt 
                        ? new Date(payment.processedAt).toLocaleDateString('ru-RU')
                        : "Не обработано"}
                    </p>
                  </div>
                </div>
                
                {user?.role === "admin" && payment.status === "pending" && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(payment.id, "rejected")}
                      disabled={updatePaymentStatusMutation.isPending}
                    >
                      Отклонить
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateStatus(payment.id, "completed")}
                      disabled={updatePaymentStatusMutation.isPending}
                    >
                      Подтвердить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg mb-2">Выплаты не найдены</div>
              <p className="text-neutral-600 dark:text-neutral-400">
                {activeTab !== "all" 
                  ? `Нет выплат со статусом "${getStatusName(activeTab)}"` 
                  : "На данный момент нет запросов на выплаты"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

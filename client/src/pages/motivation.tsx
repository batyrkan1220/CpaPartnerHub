import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type MotivationProgram = {
  id: number;
  title: string;
  description: string;
  targetLeads: number | null;
  bonusAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Partner = {
  id: number;
  fullName: string;
  avatarInitials: string;
  balance: number;
  leads: number;
};

const motivationProgramSchema = z.object({
  title: z.string().min(3, { message: "Название должно содержать не менее 3 символов" }),
  description: z.string().min(10, { message: "Описание должно содержать не менее 10 символов" }),
  targetLeads: z.coerce.number().positive({ message: "Целевое количество лидов должно быть положительным числом" }),
  bonusAmount: z.coerce.number().positive({ message: "Бонус должен быть положительным числом" }),
  startDate: z.string().min(1, { message: "Выберите дату начала" }),
  endDate: z.string().min(1, { message: "Выберите дату окончания" }),
  isActive: z.boolean().default(true),
});

type MotivationFormValues = z.infer<typeof motivationProgramSchema>;

export default function MotivationPage() {
  const { data: userData } = useUser();
  const user = userData?.user;
  const { toast } = useToast();
  
  const [openCreateProgram, setOpenCreateProgram] = useState(false);
  
  // Получение мотивационных программ
  const { data: programs, isLoading: isLoadingPrograms } = useQuery<MotivationProgram[]>({
    queryKey: ["/api/motivation-programs"],
  });
  
  // Получение партнеров (для админа)
  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ["/api/stats/top-partners"],
    enabled: user?.role === "admin",
  });
  
  // Форма для создания новой мотивационной программы
  const form = useForm<MotivationFormValues>({
    resolver: zodResolver(motivationProgramSchema),
    defaultValues: {
      title: "",
      description: "",
      targetLeads: 100,
      bonusAmount: 5000,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    },
  });
  
  // Мутация для создания новой мотивационной программы
  const createProgramMutation = useMutation({
    mutationFn: (data: MotivationFormValues) => {
      return apiRequest("POST", "/api/motivation-programs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/motivation-programs"] });
      toast({
        title: "Программа создана",
        description: "Мотивационная программа успешно создана",
      });
      setOpenCreateProgram(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать мотивационную программу. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  // Обработка отправки формы
  const onSubmitProgram = (values: MotivationFormValues) => {
    createProgramMutation.mutate(values);
  };
  
  // Функция для расчета прогресса партнера по программе
  const calculateProgress = (targetLeads: number | null, partnerLeads: number): number => {
    if (!targetLeads || targetLeads === 0) return 0;
    const progress = (partnerLeads / targetLeads) * 100;
    return Math.min(progress, 100);
  };
  
  // Проверка прав доступа для админа при создании программы
  const canCreateProgram = user?.role === "admin";
  
  return (
    <>
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Мотивационные программы</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {user?.role === "partner" 
                ? "Доступные программы для получения дополнительных бонусов" 
                : "Управление мотивационными программами для партнеров"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {canCreateProgram && (
              <Dialog open={openCreateProgram} onOpenChange={setOpenCreateProgram}>
                <DialogTrigger asChild>
                  <Button>
                    <span className="material-icons mr-2 text-sm">add</span>
                    Новая программа
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Создание мотивационной программы</DialogTitle>
                    <DialogDescription>
                      Заполните данные для создания новой мотивационной программы для партнеров
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitProgram)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название программы</FormLabel>
                            <FormControl>
                              <Input placeholder="Например: Летний бонус" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Подробное описание программы и условий" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="targetLeads"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Целевое количество лидов</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bonusAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Сумма бонуса (₽)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" step="100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Дата начала</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Дата окончания</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Статус активности</FormLabel>
                              <FormDescription>
                                Активная программа будет видна партнерам и доступна для участия
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setOpenCreateProgram(false)}
                        >
                          Отмена
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createProgramMutation.isPending}
                        >
                          {createProgramMutation.isPending ? "Создание..." : "Создать программу"}
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
      
      {/* Список мотивационных программ */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">
          {user?.role === "partner" ? "Доступные программы" : "Активные программы"}
        </h2>
        
        {isLoadingPrograms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : programs && programs.filter(program => program.isActive).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs
              .filter(program => program.isActive)
              .map(program => (
                <Card key={program.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{program.title}</CardTitle>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Активно
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(program.startDate)} - {formatDate(program.endDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      {program.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">Целевое количество лидов:</span>
                        <span className="font-medium">{formatNumber(program.targetLeads || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">Бонус за выполнение:</span>
                        <span className="font-medium">{formatCurrency(program.bonusAmount || 0)}</span>
                      </div>
                      
                      {user?.role === "partner" && (
                        <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-neutral-600 dark:text-neutral-400">Ваш прогресс:</span>
                            <span className="font-medium">75 / {formatNumber(program.targetLeads || 0)}</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {user?.role === "partner" ? (
                      <Button className="w-full" variant="outline">
                        Подробнее
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline">
                        Управление программой
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg mb-2">Активные программы не найдены</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {user?.role === "partner" 
                  ? "На данный момент нет доступных мотивационных программ" 
                  : "Создайте новую мотивационную программу для партнеров"}
              </p>
              {canCreateProgram && (
                <Button onClick={() => setOpenCreateProgram(true)}>
                  <span className="material-icons mr-2 text-sm">add</span>
                  Создать программу
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Рейтинг партнеров (только для админа) */}
      {user?.role === "admin" && (
        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Рейтинг партнеров</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Лучшие партнеры по количеству лидов</CardTitle>
              <CardDescription>
                Статистика и прогресс партнеров в текущих мотивационных программах
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <div className="space-y-6">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-5 w-36 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : partners && partners.length > 0 ? (
                <div className="space-y-6">
                  {partners.map((partner, index) => {
                    const progress = calculateProgress(100, partner.leads);
                    return (
                      <div key={partner.id} className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-accent'}`}>
                              {partner.avatarInitials}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">{partner.fullName}</div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {formatNumber(partner.leads)} лидов
                              </div>
                            </div>
                          </div>
                          <div className="font-medium">
                            {progress >= 100 ? (
                              <Badge className="bg-success/10 text-success border-success/20">
                                Выполнено
                              </Badge>
                            ) : (
                              <span>{progress.toFixed(0)}%</span>
                            )}
                          </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg mb-2">Данные не найдены</div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Нет данных о партнерах для отображения
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Архивные программы (отображаются только если есть неактивные программы) */}
      {programs && programs.filter(program => !program.isActive).length > 0 && (
        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Архивные программы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs
              .filter(program => !program.isActive)
              .map(program => (
                <Card key={program.id} className="overflow-hidden opacity-70">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{program.title}</CardTitle>
                      <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                        Завершено
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(program.startDate)} - {formatDate(program.endDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      {program.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">Целевое количество лидов:</span>
                        <span className="font-medium">{formatNumber(program.targetLeads || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">Бонус за выполнение:</span>
                        <span className="font-medium">{formatCurrency(program.bonusAmount || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Просмотреть результаты
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

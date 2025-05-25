import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useUser } from "@/lib/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const offerSchema = z.object({
  title: z.string().min(3, { message: "Название должно содержать не менее 3 символов" }),
  description: z.string().min(10, { message: "Описание должно содержать не менее 10 символов" }),
  category: z.enum(["finance", "insurance", "loans", "other"], {
    required_error: "Выберите категорию",
  }),
  paymentAmount: z.coerce.number().positive({ message: "Сумма оплаты должна быть положительным числом" }),
  paymentType: z.enum(["CPA", "CPL", "CPC", "RevShare"], {
    required_error: "Выберите тип оплаты",
  }),
  requirements: z.string().optional(),
  isActive: z.boolean().default(true),
  advertiserId: z.number().optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function CreateOfferPage() {
  const { data } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Проверка прав доступа
  const user = data?.user;
  if (user?.role !== "admin" && user?.role !== "advertiser") {
    navigate("/dashboard");
    return null;
  }
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      paymentAmount: 0,
      requirements: "",
      isActive: true,
    },
  });
  
  const createOfferMutation = useMutation({
    mutationFn: (data: OfferFormValues) => {
      return apiRequest("POST", "/api/offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Оффер создан",
        description: "Оффер успешно создан и добавлен в систему",
      });
      navigate("/offers");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать оффер. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
      console.error(error);
    },
  });
  
  const onSubmit = (values: OfferFormValues) => {
    // Если пользователь - рекламодатель, устанавливаем его ID
    if (user?.role === "advertiser") {
      values.advertiserId = user.id;
    }
    
    createOfferMutation.mutate(values);
  };
  
  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading dark:text-neutral-100">Создание оффера</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Заполните информацию о новом оффере</p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Информация об оффере</CardTitle>
          <CardDescription>
            Введите основные параметры оффера, которые будут видны партнерам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название оффера</FormLabel>
                      <FormControl>
                        <Input placeholder="Например: Кредитная карта ВТБ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="finance">Финансы</SelectItem>
                          <SelectItem value="insurance">Страхование</SelectItem>
                          <SelectItem value="loans">Микрозаймы</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробное описание оффера" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="paymentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма оплаты (₽)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="50" 
                          placeholder="1000" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип оплаты</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип оплаты" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CPA">CPA (оплата за действие)</SelectItem>
                          <SelectItem value="CPL">CPL (оплата за лид)</SelectItem>
                          <SelectItem value="CPC">CPC (оплата за клик)</SelectItem>
                          <SelectItem value="RevShare">RevShare (процент от дохода)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Требования</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Требования к партнерам и трафику" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Укажите требования к партнерам и ограничения по источникам трафика
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Статус активности</FormLabel>
                      <FormDescription>
                        Активный оффер будет виден партнерам и доступен для работы
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
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/offers")}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={createOfferMutation.isPending}
                >
                  {createOfferMutation.isPending ? "Создание..." : "Создать оффер"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

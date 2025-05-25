import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Имя пользователя обязательно" }),
  password: z.string().min(1, { message: "Пароль обязателен" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const login = useLogin();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login.mutateAsync(values);
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: "Неверные учетные данные. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-heading">CPA Платформа</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Войдите в вашу учетную запись</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Введите ваши учетные данные для доступа к платформе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={login.isPending}
                >
                  {login.isPending ? "Вход..." : "Войти"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
              <p>Для демонстрации используйте:</p>
              <p className="mt-1"><strong>Админ:</strong> admin / admin123</p>
              <p><strong>Партнер:</strong> partner / partner123</p>
              <p><strong>Рекламодатель:</strong> advertiser / advertiser123</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

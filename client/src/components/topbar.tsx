import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { User, useLogout } from "@/lib/auth";
import { useTheme } from "@/components/ui/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TopbarProps {
  user: User;
  onToggleSidebar: () => void;
}

export function Topbar({ user, onToggleSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Выход из системы",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow dark:bg-neutral-800 dark:shadow-neutral-900/20">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="border-r border-neutral-200 px-4 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:border-neutral-700 dark:text-neutral-400 md:hidden"
      >
        <span className="sr-only">Открыть меню</span>
        <span className="material-icons">menu</span>
      </button>

      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-icons text-neutral-400 text-sm dark:text-neutral-500">search</span>
              </div>
              <input
                id="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder-neutral-500"
                placeholder="Поиск..."
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center md:ml-6">
          {/* Выбор языка */}
          <div className="relative mx-3">
            <button
              type="button"
              className="flex items-center text-sm text-neutral-700 hover:text-primary dark:text-neutral-300 dark:hover:text-primary"
            >
              <span className="material-icons text-neutral-400 mr-1 dark:text-neutral-500">language</span>
              <span>РУС</span>
            </button>
          </div>

          {/* Переключатель темы */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                {theme === "light" ? (
                  <span className="material-icons">light_mode</span>
                ) : (
                  <span className="material-icons">dark_mode</span>
                )}
                <span className="sr-only">Переключить тему</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <span className="material-icons mr-2">light_mode</span>
                <span>Светлая</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <span className="material-icons mr-2">dark_mode</span>
                <span>Тёмная</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <span className="material-icons mr-2">computer</span>
                <span>Системная</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Колокольчик уведомлений */}
          <button
            type="button"
            className="relative rounded-full bg-white p-1 text-neutral-400 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-neutral-800 dark:hover:text-primary"
          >
            <span className="sr-only">Уведомления</span>
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-error text-xs text-white font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Выпадающее меню профиля */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex ml-3 max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-neutral-800">
                <span className="sr-only">Открыть профиль</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {user.avatarInitials}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <span className="material-icons mr-2 text-sm">person</span>
                  <span>Профиль</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <span className="material-icons mr-2 text-sm">settings</span>
                  <span>Настройки</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
                <span className="material-icons mr-2 text-sm">logout</span>
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

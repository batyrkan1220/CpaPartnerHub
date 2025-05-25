import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { User } from "@/lib/auth";
import { getUserRoleName } from "@/lib/utils";

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  // Пункты меню для разных ролей
  const commonMenuItems = [
    { path: "/dashboard", icon: "dashboard", label: "Панель управления" },
  ];

  const adminMenuItems = [
    { path: "/offers", icon: "local_offer", label: "Офферы" },
    { path: "/partners", icon: "person_add", label: "Партнеры" },
    { path: "/advertisers", icon: "business", label: "Рекламодатели" },
    { path: "/statistics", icon: "assessment", label: "Статистика" },
    { path: "/payments", icon: "account_balance_wallet", label: "Выплаты" },
    { path: "/anti-fraud", icon: "security", label: "Анти-фрод" },
    { path: "/motivation", icon: "emoji_events", label: "Мотивация" },
  ];

  const partnerMenuItems = [
    { path: "/offers", icon: "local_offer", label: "Офферы" },
    { path: "/my-leads", icon: "list_alt", label: "Мои лиды" },
    { path: "/statistics", icon: "assessment", label: "Статистика" },
    { path: "/payments", icon: "account_balance_wallet", label: "Выплаты" },
  ];

  const advertiserMenuItems = [
    { path: "/my-offers", icon: "local_offer", label: "Мои офферы" },
    { path: "/leads", icon: "list_alt", label: "Лиды" },
    { path: "/statistics", icon: "assessment", label: "Статистика" },
  ];

  // Выбор меню в зависимости от роли
  let menuItems = [...commonMenuItems];
  if (user.role === "admin") {
    menuItems = [...menuItems, ...adminMenuItems];
  } else if (user.role === "partner") {
    menuItems = [...menuItems, ...partnerMenuItems];
  } else if (user.role === "advertiser") {
    menuItems = [...menuItems, ...advertiserMenuItems];
  }

  const settingsMenuItems = [
    { path: "/settings", icon: "settings", label: "Настройки" },
    { path: "/support", icon: "help_outline", label: "Поддержка" },
  ];

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r dark:bg-neutral-800 dark:border-neutral-700">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="text-xl font-bold text-primary font-heading">CPA Платформа</span>
        </div>

        {/* Профиль пользователя */}
        <div className="px-4 py-3 mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user.avatarInitials}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user.fullName}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{getUserRoleName(user.role)}</p>
            </div>
          </div>
        </div>

        {/* Навигационные ссылки */}
        <div className="flex-grow">
          <div className="px-4 mt-2 mb-2 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">Главное меню</div>
          <nav className="flex-1 space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "sidebar-link flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                    isActive
                      ? "active text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:text-primary"
                  )}
                >
                  <span className={cn(
                    "material-icons mr-3 text-sm",
                    isActive
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-primary dark:text-neutral-500 dark:group-hover:text-primary"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">Настройки</div>
          <nav className="flex-1 space-y-1 px-2">
            {settingsMenuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "sidebar-link flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                    isActive
                      ? "active text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:text-primary"
                  )}
                >
                  <span className={cn(
                    "material-icons mr-3 text-sm",
                    isActive
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-primary dark:text-neutral-500 dark:group-hover:text-primary"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

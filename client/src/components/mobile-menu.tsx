import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { User } from "@/lib/auth";
import { getUserRoleName } from "@/lib/utils";

interface MobileMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ user, isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике по фону
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.classList.add("overflow-hidden");
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-neutral-600 bg-opacity-75 dark:bg-neutral-900 dark:bg-opacity-80" aria-hidden="true"></div>
      
      <div ref={modalRef} className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-neutral-800">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Закрыть меню</span>
            <span className="material-icons text-white">close</span>
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-xl font-bold text-primary font-heading">CPA Платформа</span>
          </div>
          
          <div className="px-4 py-3 mt-3 mb-3 border-t border-b border-neutral-200 dark:border-neutral-700">
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
          
          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`group flex items-center px-2 py-2 text-base font-medium ${
                    isActive
                      ? "bg-primary bg-opacity-10 border-l-4 border-primary text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  <span className={`material-icons mr-4 text-sm ${
                    isActive
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-primary dark:text-neutral-500 dark:group-hover:text-primary"
                  }`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

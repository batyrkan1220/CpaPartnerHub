import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileMenu } from "@/components/mobile-menu";
import { useUser } from "@/lib/auth";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useUser();
  const [location, setLocation] = useLocation();
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!data?.user) {
    setLocation("/login");
    return null;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* Боковое меню (видимое на настольных устройствах) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={data.user} />
      </div>
      
      {/* Мобильное меню (видимое только когда открыто) */}
      <MobileMenu 
        user={data.user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Основная область контента */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Верхняя панель навигации */}
        <Topbar 
          user={data.user}
          onToggleSidebar={toggleSidebar}
        />
        
        {/* Основной контент страницы */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 md:p-6 dark:bg-neutral-900">
          {children}
        </main>
      </div>
    </div>
  );
}

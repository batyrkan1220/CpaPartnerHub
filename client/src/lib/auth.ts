import { apiRequest } from "./queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export type User = {
  id: number;
  username: string;
  email: string;
  role: "admin" | "partner" | "advertiser";
  fullName: string;
  avatarInitials: string;
  balance: number;
  trafficSources: string | null;
  isActive: boolean;
  fraudScore: number;
};

// Проверка, аутентифицирован ли пользователь
export function useUser() {
  return useQuery<{ user: User | null }>({
    queryKey: ["/api/auth/me"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        if (res.status === 401) {
          return { user: null };
        }
        return await res.json();
      } catch (error) {
        return { user: null };
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
}

// Хук для входа в систему
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

// Хук для выхода из системы
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
    },
  });
}

// Проверка, имеет ли пользователь указанную роль
export function hasRole(user: User | null | undefined, roles: string | string[]): boolean {
  if (!user) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
}

// Редирект неавторизованных пользователей
export function useRequireAuth() {
  const { data, isLoading } = useUser();
  return {
    user: data?.user,
    isLoading,
    isAuthorized: !!data?.user,
  };
}

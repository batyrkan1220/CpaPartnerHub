import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Форматирование чисел
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}

// Форматирование денежных сумм
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Форматирование процентов
export function formatPercent(percent: number): string {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'percent', 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(percent / 100);
}

// Форматирование даты
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Склонение слов по числам
export function pluralize(count: number, words: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    count % 100 > 4 && count % 100 < 20 
      ? 2 
      : cases[Math.min(count % 10, 5)]
  ];
}

// Сокращение длинного текста
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Получение инициалов из полного имени
export function getInitials(fullName: string): string {
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

// Генерация случайного цвета из заданного набора
export function getRandomColor(index?: number): string {
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-secondary text-secondary-foreground',
    'bg-accent text-accent-foreground',
    'bg-primary-light text-primary-foreground',
    'bg-secondary-light text-secondary-foreground',
    'bg-accent-light text-accent-foreground',
  ];
  
  if (typeof index === 'number') {
    return colors[index % colors.length];
  }
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Генерация даты для демонстрации
export function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Получение локализованного названия категории оффера
export function getOfferCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'finance': 'Финансы',
    'loans': 'Микрозаймы',
    'insurance': 'Страхование',
    'other': 'Другое'
  };
  
  return categories[category] || 'Другое';
}

// Получение цвета статуса лида
export function getLeadStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'text-success';
    case 'rejected':
      return 'text-error';
    case 'pending':
      return 'text-warning';
    default:
      return 'text-neutral-500';
  }
}

// Получение локализованного названия статуса лида
export function getLeadStatusName(status: string): string {
  const statuses: Record<string, string> = {
    'approved': 'Подтвержден',
    'rejected': 'Отклонен',
    'pending': 'На рассмотрении'
  };
  
  return statuses[status] || 'Неизвестно';
}

// Получение локализованного названия роли пользователя
export function getUserRoleName(role: string): string {
  const roles: Record<string, string> = {
    'admin': 'Администратор',
    'partner': 'Партнер',
    'advertiser': 'Рекламодатель'
  };
  
  return roles[role] || 'Неизвестно';
}

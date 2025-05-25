import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type TopPartner = {
  id: number;
  fullName: string;
  avatarInitials: string;
  trafficSources: string | null;
  leads: number;
  approvalRate: number;
  earnings: number;
};

export function TopPartners() {
  const { data, isLoading, error } = useQuery<TopPartner[]>({
    queryKey: ["/api/stats/top-partners"],
  });

  return (
    <div className="bg-white rounded-lg shadow dark:bg-neutral-800">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Лучшие партнеры</h3>
        <Link href="/partners" className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light">
          Просмотреть всех
        </Link>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Партнер
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Лиды
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Аппрув
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Заработок
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Ошибка загрузки данных
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((partner, index) => {
                  // Выбор цвета для аватара
                  let avatarBgClass = "bg-primary-light";
                  
                  if (index % 3 === 1) {
                    avatarBgClass = "bg-secondary-light";
                  } else if (index % 3 === 2) {
                    avatarBgClass = "bg-accent-light";
                  }

                  return (
                    <tr key={partner.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${avatarBgClass} flex items-center justify-center text-white`}>
                            {partner.avatarInitials}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                              {partner.fullName}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {partner.trafficSources || "Не указано"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">
                        {partner.leads}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-200">
                          {partner.approvalRate.toFixed(0)}%
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1 dark:bg-neutral-700">
                          <div
                            className="bg-success h-1.5 rounded-full"
                            style={{ width: `${partner.approvalRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          {formatCurrency(partner.earnings)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Нет данных для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

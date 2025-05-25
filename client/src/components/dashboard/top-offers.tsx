import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getOfferCategoryName } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type TopOffer = {
  id: number;
  title: string;
  category: string;
  conversions: number;
  conversionRate: number;
  revenue: number;
};

export function TopOffers() {
  const { data, isLoading, error } = useQuery<TopOffer[]>({
    queryKey: ["/api/stats/top-offers"],
  });

  return (
    <div className="bg-white rounded-lg shadow dark:bg-neutral-800">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Топ офферы</h3>
        <Link href="/offers" className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light">
          Просмотреть все
        </Link>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Оффер
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Конверсии
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  CR
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
                  Доход
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded" />
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
                      <Skeleton className="h-4 w-12" />
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
                data.map((offer, index) => {
                  // Выбор иконки и цвета в зависимости от категории
                  let iconBgClass = "bg-primary-light/10";
                  let iconColorClass = "text-primary";
                  
                  if (index % 3 === 1) {
                    iconBgClass = "bg-secondary-light/10";
                    iconColorClass = "text-secondary";
                  } else if (index % 3 === 2) {
                    iconBgClass = "bg-accent-light/10";
                    iconColorClass = "text-accent";
                  }

                  return (
                    <tr key={offer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded ${iconBgClass} flex items-center justify-center`}>
                            <span className={`material-icons ${iconColorClass} text-sm`}>local_offer</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{offer.title}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">{getOfferCategoryName(offer.category)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">
                        {offer.conversions}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-200">{offer.conversionRate.toFixed(1)}%</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                          {formatCurrency(offer.revenue)}
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

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  changePercent: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  valueType?: "number" | "currency" | "percent";
}

function MetricCard({
  title,
  value,
  changePercent,
  icon,
  iconBgColor,
  iconColor,
  valueType = "number"
}: MetricCardProps) {
  let formattedValue = "";
  if (valueType === "number") {
    formattedValue = formatNumber(value);
  } else if (valueType === "currency") {
    formattedValue = formatCurrency(value);
  } else if (valueType === "percent") {
    formattedValue = formatPercent(value);
  }

  const isPositiveChange = changePercent > 0;
  const changeIcon = isPositiveChange ? "arrow_upward" : "arrow_downward";
  const changeColor = isPositiveChange ? "text-success" : "text-error";

  return (
    <div className="data-card overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}>
              <span className={`material-icons ${iconColor}`}>{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate dark:text-neutral-400">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{formattedValue}</div>
                <div className="mt-1 flex items-baseline text-sm">
                  <span className={`${changeColor} font-medium flex items-center`}>
                    <span className="material-icons text-xs mr-1">{changeIcon}</span>
                    {Math.abs(changePercent).toFixed(1)}%
                  </span>
                  <span className="ml-2 text-neutral-500 dark:text-neutral-400">vs. прошлый месяц</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricsOverview() {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Всего лидов"
          value={2457}
          changePercent={12.5}
          icon="pie_chart"
          iconBgColor="bg-primary-light/10"
          iconColor="text-primary"
          valueType="number"
        />

        <MetricCard
          title="Доход (₽)"
          value={624938}
          changePercent={8.2}
          icon="account_balance"
          iconBgColor="bg-secondary-light/10"
          iconColor="text-secondary"
          valueType="currency"
        />

        <MetricCard
          title="Активные партнеры"
          value={146}
          changePercent={4.7}
          icon="group"
          iconBgColor="bg-accent-light/10"
          iconColor="text-accent"
          valueType="number"
        />

        <MetricCard
          title="Фрод активность"
          value={1.7}
          changePercent={-0.3}
          icon="gpp_maybe"
          iconBgColor="bg-error/10"
          iconColor="text-error"
          valueType="percent"
        />
      </div>
    </div>
  );
}

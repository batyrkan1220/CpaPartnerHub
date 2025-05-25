import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "chart.js/auto";

export function PerformanceCharts() {
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let lineChart: Chart | null = null;
    let pieChart: Chart | null = null;

    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext("2d");
      if (ctx) {
        lineChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["1 Мая", "8 Мая", "15 Мая", "22 Мая", "29 Мая", "5 Июня", "12 Июня", "19 Июня", "26 Июня"],
            datasets: [
              {
                label: "Лиды",
                data: [65, 78, 90, 85, 95, 110, 120, 118, 130],
                borderColor: "hsl(var(--primary))",
                backgroundColor: "hsla(var(--primary), 0.1)",
                tension: 0.3,
                fill: true,
              },
              {
                label: "Конверсии",
                data: [45, 52, 64, 60, 70, 85, 92, 90, 102],
                borderColor: "hsl(var(--success))",
                backgroundColor: "hsla(var(--success), 0.1)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                },
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            hover: {
              mode: "nearest",
              intersect: true,
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
            },
          },
        });
      }
    }

    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        pieChart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Таргетированная реклама", "Контекстная реклама", "SEO", "Тизерные сети", "Push-уведомления"],
            datasets: [
              {
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--success))",
                  "hsl(var(--chart-5))",
                ],
                borderWidth: 1,
                borderColor: "hsl(var(--background))",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (lineChart) {
        lineChart.destroy();
      }
      if (pieChart) {
        pieChart.destroy();
      }
    };
  }, []);

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* График конверсий по дням */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow dark:bg-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Конверсии по дням
          </h3>
        </div>
        <div className="p-4">
          <div className="chart-container">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Лиды по источникам */}
      <div className="bg-white rounded-lg shadow dark:bg-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Лиды по источникам
          </h3>
        </div>
        <div className="p-4">
          <div className="chart-container">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

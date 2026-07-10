"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const EM6 = "#059669";

export default function ReportChart({
  type,
  labels,
  data,
  colors,
}: {
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  data: number[];
  colors: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    chartRef.current?.destroy();

    const circular = type === "pie" || type === "doughnut";
    chartRef.current = new Chart(el, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: "",
            data,
            backgroundColor: circular ? colors : type === "line" ? "rgba(16,185,129,0.14)" : colors,
            borderColor: type === "line" ? EM6 : circular ? "#ffffff" : colors,
            borderWidth: circular ? 2 : type === "line" ? 2.5 : 0,
            borderRadius: type === "bar" ? 6 : 0,
            fill: type === "line",
            tension: 0.35,
            pointBackgroundColor: EM6,
            pointRadius: type === "line" ? 3 : 0,
            maxBarThickness: 46,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: circular, position: "bottom", labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } } },
          tooltip: { backgroundColor: "#0f172a", padding: 10, cornerRadius: 8 },
        },
        scales: circular
          ? {}
          : {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { beginAtZero: true, grid: { color: "#eef2f7" }, ticks: { font: { size: 11 }, precision: 0 } as any },
            },
      },
    });

    return () => chartRef.current?.destroy();
  }, [type, labels, data, colors]);

  return <canvas ref={canvasRef} />;
}

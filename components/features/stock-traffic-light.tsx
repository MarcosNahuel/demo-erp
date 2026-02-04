"use client";

import { cn } from "@/lib/utils";
import { getStockStatus, stockStatusColors, type StockStatus } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockTrafficLightProps {
  stock: number;
  sales30d: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function StockTrafficLight({
  stock,
  sales30d,
  showLabel = false,
  size = "md",
}: StockTrafficLightProps) {
  const status = getStockStatus(stock, sales30d);
  const { bg, label } = stockStatusColors[status];

  const daysOfStock = sales30d > 0 ? (stock / (sales30d / 30)).toFixed(1) : "∞";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full",
                sizeClasses[size],
                bg,
                status === "critical" && "animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]",
                status === "alert" && "shadow-[0_0_6px_rgba(249,115,22,0.5)]"
              )}
            />
            {showLabel && (
              <span
                className={cn(
                  "text-xs font-medium",
                  stockStatusColors[status].text
                )}
              >
                {label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{label}</p>
            <p className="text-xs text-dark-400">
              Stock: {stock} | Ventas/mes: {sales30d}
            </p>
            <p className="text-xs text-dark-400">
              Días de stock: {daysOfStock}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar la leyenda de semáforos
export function StockLegend() {
  const statuses: StockStatus[] = ["critical", "alert", "low", "normal", "overstock"];

  return (
    <div className="flex flex-wrap gap-4 text-xs">
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              stockStatusColors[status].bg
            )}
          />
          <span className="text-dark-400">{stockStatusColors[status].label}</span>
        </div>
      ))}
    </div>
  );
}

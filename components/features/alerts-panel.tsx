"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, Package } from "lucide-react";
import type { Alert } from "@/types";

interface AlertsPanelProps {
  alerts: Alert[];
  limit?: number;
  showAll?: boolean;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    dot: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    dot: "bg-blue-500",
  },
};

const typeLabels: Record<string, string> = {
  low_stock: "Stock Bajo",
  out_of_stock: "Sin Stock",
  negative_margin: "Margen Negativo",
  slow_rotation: "Rotación Lenta",
  price_change: "Cambio de Precio",
};

export function AlertsPanel({ alerts, limit = 5, showAll = false }: AlertsPanelProps) {
  const displayAlerts = showAll ? alerts : alerts.slice(0, limit);

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-12 w-12 text-dark-600" />
        <p className="mt-3 text-sm text-dark-400">No hay alertas activas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              "flex gap-3 rounded-lg border p-3 transition-all hover:bg-dark-800/50",
              config.bg,
              config.border
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                config.bg
              )}
            >
              <Icon className={cn("h-4 w-4", config.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {alert.product_title || `Producto ${alert.product_id}`}
                  </p>
                  <p className="mt-0.5 text-xs text-dark-400 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      config.bg,
                      config.iconColor
                    )}
                  >
                    {typeLabels[alert.type]}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-dark-500">
                <span>{formatRelativeDate(alert.created_at)}</span>
                {alert.notified && (
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Notificado
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

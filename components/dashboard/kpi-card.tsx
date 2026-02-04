"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "border-dark-700",
  primary: "border-primary-500/30 bg-primary-500/5",
  success: "border-green-500/30 bg-green-500/5",
  warning: "border-yellow-500/30 bg-yellow-500/5",
  danger: "border-red-500/30 bg-red-500/5",
};

const iconStyles = {
  default: "bg-dark-700 text-dark-300",
  primary: "bg-primary-500/20 text-primary-400",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  danger: "bg-red-500/20 text-red-400",
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = "default",
  className,
}: KPICardProps) {
  const TrendIcon =
    trend?.value && trend.value > 0
      ? TrendingUp
      : trend?.value && trend.value < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.value && trend.value > 0
      ? "text-green-400"
      : trend?.value && trend.value < 0
      ? "text-red-400"
      : "text-dark-400";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border p-5 transition-all hover:shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-dark-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <span className={cn("text-sm font-medium", trendColor)}>
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
          {trend.label && (
            <span className="text-xs text-dark-500">{trend.label}</span>
          )}
        </div>
      )}

      {/* Decorative gradient */}
      {variant !== "default" && (
        <div
          className={cn(
            "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl",
            variant === "primary" && "bg-primary-500",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "danger" && "bg-red-500"
          )}
        />
      )}
    </Card>
  );
}

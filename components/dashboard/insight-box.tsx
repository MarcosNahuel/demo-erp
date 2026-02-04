"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle, LucideIcon } from "lucide-react";

interface InsightBoxProps {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variants: Record<
  InsightBoxProps["type"],
  { icon: LucideIcon; bg: string; border: string; iconBg: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  danger: {
    icon: XCircle,
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
};

export function InsightBox({
  type,
  title,
  description,
  action,
  className,
}: InsightBoxProps) {
  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        variant.bg,
        variant.border,
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          variant.iconBg
        )}
      >
        <Icon className={cn("h-4 w-4", variant.iconColor)} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-dark-400">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "mt-2 text-xs font-medium hover:underline",
              variant.iconColor
            )}
          >
            {action.label} →
          </button>
        )}
      </div>
    </div>
  );
}

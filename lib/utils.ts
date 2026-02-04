import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formato de moneda CLP (peso chileno)
export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Formato de número con separador de miles
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CL").format(value);
}

// Formato de porcentaje
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Formato compacto para números grandes
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

// Formato de fecha relativa
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }
  if (diffHours < 24) {
    return `hace ${diffHours}h`;
  }
  if (diffDays < 7) {
    return `hace ${diffDays}d`;
  }
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
}

// Formato de fecha completa
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Determinar estado de stock
export type StockStatus = "critical" | "alert" | "low" | "normal" | "overstock";

export function getStockStatus(stock: number, sales30d: number): StockStatus {
  if (stock <= 1) return "critical";
  if (sales30d === 0) {
    return stock > 10 ? "overstock" : "normal";
  }
  const daysOfStock = stock / (sales30d / 30);
  if (daysOfStock <= 3) return "critical";
  if (daysOfStock <= 7) return "alert";
  if (daysOfStock <= 15) return "low";
  if (daysOfStock > 60) return "overstock";
  return "normal";
}

// Colores por estado de stock
export const stockStatusColors: Record<StockStatus, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500", text: "text-red-500", label: "Crítico" },
  alert: { bg: "bg-orange-500", text: "text-orange-500", label: "Alerta" },
  low: { bg: "bg-yellow-500", text: "text-yellow-500", label: "Bajo" },
  normal: { bg: "bg-green-500", text: "text-green-500", label: "Normal" },
  overstock: { bg: "bg-blue-500", text: "text-blue-500", label: "Sobrestock" },
};

// Calcular clasificación ABC (Pareto)
export type ABCClass = "A" | "B" | "C";

export function getABCClass(cumulativePercent: number): ABCClass {
  if (cumulativePercent <= 80) return "A";
  if (cumulativePercent <= 95) return "B";
  return "C";
}

export const abcClassColors: Record<ABCClass, { bg: string; text: string }> = {
  A: { bg: "bg-primary-500", text: "text-primary-500" },
  B: { bg: "bg-accent-500", text: "text-accent-500" },
  C: { bg: "bg-dark-400", text: "text-dark-400" },
};

// Generar color aleatorio para gráficos
export function generateChartColors(count: number): string[] {
  const baseColors = [
    "#7c3aed", // primary
    "#db2777", // accent
    "#10b981", // success
    "#f59e0b", // warning
    "#3b82f6", // info
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

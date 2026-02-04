import productsData from "@/data/products.json";
import suppliersData from "@/data/suppliers.json";
import ordersData from "@/data/orders.json";
import alertsData from "@/data/alerts.json";
import type { Product, Supplier, Order, Alert, DashboardKPIs, SalesByChannel, SalesTrend, StockDistribution, LogisticType } from "@/types";
import { getStockStatus } from "./utils";

// Acceso a datos
export const products: Product[] = productsData as Product[];
export const suppliers: Supplier[] = suppliersData as Supplier[];
export const orders: Order[] = ordersData as Order[];
export const alerts: Alert[] = alertsData as Alert[];

// KPIs del Dashboard
export function getDashboardKPIs(): DashboardKPIs {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_total, 0);
  const stockValuation = products.reduce((sum, p) => sum + p.stock_total * p.cost, 0);
  const sales30d = products.reduce((sum, p) => sum + p.sales_amount_30d, 0);

  const paidOrders = orders.filter(o => o.status === "paid");
  const orders30d = paidOrders.length;
  const avgTicket = orders30d > 0 ? sales30d / orders30d : 0;

  const avgMargin = products.reduce((sum, p) => sum + p.margin_percent, 0) / totalProducts;

  const criticalProducts = products.filter(p => {
    const status = getStockStatus(p.stock_total, p.sales_30d);
    return status === "critical" || status === "alert";
  }).length;

  const alertsCount = alerts.filter(a => !a.resolved).length;

  return {
    totalProducts,
    totalStock,
    stockValuation,
    sales30d,
    orders30d,
    avgTicket,
    avgMargin,
    criticalProducts,
    alertsCount,
  };
}

// Ventas por canal
export function getSalesByChannel(): SalesByChannel[] {
  const channels: Record<string, { sales: number; orders: number; label: string }> = {
    fulfillment: { sales: 0, orders: 0, label: "FULL" },
    flex: { sales: 0, orders: 0, label: "FLEX" },
    xd_drop_off: { sales: 0, orders: 0, label: "Centro" },
  };

  const paidOrders = orders.filter(o => o.status === "paid");

  paidOrders.forEach(order => {
    const channel = order.logistic_type;
    if (channels[channel]) {
      channels[channel].sales += order.total_amount;
      channels[channel].orders += 1;
    }
  });

  const totalSales = Object.values(channels).reduce((sum, c) => sum + c.sales, 0);

  return Object.entries(channels).map(([channel, data]) => ({
    channel: channel as LogisticType,
    label: data.label,
    sales: data.sales,
    orders: data.orders,
    percent: totalSales > 0 ? (data.sales / totalSales) * 100 : 0,
  }));
}

// Tendencia de ventas (últimos 14 días)
export function getSalesTrend(): SalesTrend[] {
  const today = new Date("2026-02-04");
  const trend: SalesTrend[] = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.date_created).toISOString().split("T")[0];
      return orderDate === dateStr && o.status === "paid";
    });

    trend.push({
      date: dateStr,
      sales: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
      orders: dayOrders.length,
    });
  }

  return trend;
}

// Distribución de stock por estado
export function getStockDistribution(): StockDistribution[] {
  const distribution: Record<string, number> = {
    critical: 0,
    alert: 0,
    low: 0,
    normal: 0,
    overstock: 0,
  };

  products.forEach(p => {
    const status = getStockStatus(p.stock_total, p.sales_30d);
    distribution[status]++;
  });

  const total = products.length;
  const labels: Record<string, string> = {
    critical: "Crítico",
    alert: "Alerta",
    low: "Bajo",
    normal: "Normal",
    overstock: "Sobrestock",
  };

  return Object.entries(distribution).map(([status, count]) => ({
    status: labels[status],
    count,
    percent: (count / total) * 100,
  }));
}

// Productos por categoría
export function getProductsByCategory() {
  const categories: Record<string, { count: number; stock: number; sales: number }> = {};

  products.forEach(p => {
    if (!categories[p.category]) {
      categories[p.category] = { count: 0, stock: 0, sales: 0 };
    }
    categories[p.category].count++;
    categories[p.category].stock += p.stock_total;
    categories[p.category].sales += p.sales_amount_30d;
  });

  return Object.entries(categories)
    .map(([category, data]) => ({
      category,
      ...data,
    }))
    .sort((a, b) => b.sales - a.sales);
}

// Alertas activas
export function getActiveAlerts() {
  return alerts.filter(a => !a.resolved).sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// Productos críticos
export function getCriticalProducts() {
  return products
    .map(p => ({
      ...p,
      stockStatus: getStockStatus(p.stock_total, p.sales_30d),
    }))
    .filter(p => p.stockStatus === "critical" || p.stockStatus === "alert")
    .sort((a, b) => a.days_of_stock - b.days_of_stock);
}

// Top productos por ventas
export function getTopProducts(limit: number = 10) {
  return [...products]
    .sort((a, b) => b.sales_amount_30d - a.sales_amount_30d)
    .slice(0, limit);
}

// Productos por proveedor
export function getProductsBySupplier(supplierId: string) {
  return products.filter(p => p.supplier_id === supplierId);
}

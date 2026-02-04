import type { Product, ParetoItem, ABCClass } from "@/types";
import { getABCClass } from "./utils";

// Análisis Pareto (80/20)
export function calculatePareto(products: Product[]): ParetoItem[] {
  // Ordenar por ventas de mayor a menor
  const sorted = [...products].sort((a, b) => b.sales_amount_30d - a.sales_amount_30d);

  // Calcular total de ventas
  const totalSales = sorted.reduce((sum, p) => sum + p.sales_amount_30d, 0);

  // Calcular porcentajes y acumulados
  let cumulative = 0;

  return sorted.map(product => {
    const salesPercent = (product.sales_amount_30d / totalSales) * 100;
    cumulative += salesPercent;

    return {
      product,
      salesAmount: product.sales_amount_30d,
      salesPercent,
      cumulativePercent: cumulative,
      abcClass: getABCClass(cumulative),
    };
  });
}

// Resumen de clasificación ABC
export function getABCSummary(paretoItems: ParetoItem[]) {
  const summary = {
    A: { count: 0, sales: 0, percent: 0 },
    B: { count: 0, sales: 0, percent: 0 },
    C: { count: 0, sales: 0, percent: 0 },
  };

  const totalSales = paretoItems.reduce((sum, item) => sum + item.salesAmount, 0);

  paretoItems.forEach(item => {
    summary[item.abcClass].count++;
    summary[item.abcClass].sales += item.salesAmount;
  });

  // Calcular porcentajes
  (Object.keys(summary) as ABCClass[]).forEach(key => {
    summary[key].percent = (summary[key].sales / totalSales) * 100;
  });

  return summary;
}

// Calcular ROI
export function calculateROI(price: number, cost: number): number {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
}

// Calcular margen
export function calculateMargin(price: number, cost: number): { margin: number; percent: number } {
  const margin = price - cost;
  const percent = price > 0 ? (margin / price) * 100 : 0;
  return { margin, percent };
}

// Calcular días de stock
export function calculateDaysOfStock(stock: number, sales30d: number): number {
  if (sales30d === 0) return stock > 0 ? 999 : 0;
  const dailySales = sales30d / 30;
  return stock / dailySales;
}

// Calcular punto de reorden sugerido
export function calculateReorderPoint(sales30d: number, leadTimeDays: number = 7): number {
  const dailySales = sales30d / 30;
  const safetyStock = dailySales * 3; // 3 días de seguridad
  return Math.ceil(dailySales * leadTimeDays + safetyStock);
}

// Calcular valorización de inventario
export function calculateInventoryValuation(products: Product[]): {
  totalCost: number;
  totalPrice: number;
  potentialProfit: number;
} {
  let totalCost = 0;
  let totalPrice = 0;

  products.forEach(p => {
    totalCost += p.stock_total * p.cost;
    totalPrice += p.stock_total * p.price;
  });

  return {
    totalCost,
    totalPrice,
    potentialProfit: totalPrice - totalCost,
  };
}

// Calcular velocidad de venta (unidades por día)
export function calculateSalesVelocity(sales30d: number): number {
  return sales30d / 30;
}

// Proyección de agotamiento
export function calculateStockoutDate(stock: number, sales30d: number): Date | null {
  if (stock === 0) return new Date();
  if (sales30d === 0) return null; // Nunca se agota

  const daysOfStock = calculateDaysOfStock(stock, sales30d);
  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + daysOfStock);

  return stockoutDate;
}

// Análisis de proveedor
export function analyzeSupplier(products: Product[]) {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_total, 0);
  const totalCost = products.reduce((sum, p) => sum + p.stock_total * p.cost, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales_amount_30d, 0);
  const avgMargin = products.reduce((sum, p) => sum + p.margin_percent, 0) / totalProducts;
  const avgROI = products.reduce((sum, p) => sum + p.roi, 0) / totalProducts;

  return {
    totalProducts,
    totalStock,
    totalCost,
    totalSales,
    avgMargin,
    avgROI,
  };
}

// Datos para gráfico de Pareto
export function getParetoChartData(paretoItems: ParetoItem[]) {
  return paretoItems.map((item, index) => ({
    name: item.product.title.substring(0, 20) + (item.product.title.length > 20 ? "..." : ""),
    sku: item.product.sku,
    sales: item.salesAmount,
    cumulative: item.cumulativePercent,
    abcClass: item.abcClass,
    rank: index + 1,
  }));
}

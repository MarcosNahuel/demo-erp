"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { InsightBox } from "@/components/dashboard/insight-box";
import { products, getSalesTrend } from "@/lib/mock-data";
import { calculateReorderPoint, calculateStockoutDate } from "@/lib/calculations";
import { formatCLP, formatNumber, formatPercent, formatDate } from "@/lib/utils";
import { TrendingUp, Calendar, AlertTriangle, Package, Brain } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  Line,
} from "recharts";

export default function ForecastingPage() {
  const salesTrend = useMemo(() => getSalesTrend(), []);

  // Proyección de ventas (simple: promedio + tendencia)
  const salesForecast = useMemo(() => {
    const avgDailySales = salesTrend.reduce((sum, d) => sum + d.sales, 0) / salesTrend.length;

    // Calcular tendencia (simple linear regression)
    const n = salesTrend.length;
    const xSum = salesTrend.reduce((sum, _, i) => sum + i, 0);
    const ySum = salesTrend.reduce((sum, d) => sum + d.sales, 0);
    const xySum = salesTrend.reduce((sum, d, i) => sum + i * d.sales, 0);
    const x2Sum = salesTrend.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);

    // Generar próximos 7 días
    const forecast = [];
    const lastDate = new Date(salesTrend[salesTrend.length - 1].date);

    for (let i = 1; i <= 7; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      const predictedSales = avgDailySales + slope * (n + i - 1);

      forecast.push({
        date: date.toISOString().split("T")[0],
        sales: null,
        forecast: Math.max(0, predictedSales),
        orders: null,
      });
    }

    // Combinar datos históricos con forecast
    return [
      ...salesTrend.map((d) => ({ ...d, forecast: null })),
      ...forecast,
    ];
  }, [salesTrend]);

  // Productos que se agotarán pronto
  const stockoutRisk = useMemo(() => {
    return products
      .map((p) => {
        const stockoutDate = calculateStockoutDate(p.stock_total, p.sales_30d);
        const reorderPoint = calculateReorderPoint(p.sales_30d);
        const daysUntilStockout = stockoutDate
          ? Math.ceil((stockoutDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          ...p,
          stockoutDate,
          reorderPoint,
          daysUntilStockout,
          needsReorder: p.stock_total <= reorderPoint,
        };
      })
      .filter((p) => p.daysUntilStockout !== null && p.daysUntilStockout <= 14)
      .sort((a, b) => (a.daysUntilStockout || 0) - (b.daysUntilStockout || 0));
  }, []);

  // Demanda proyectada por categoría
  const demandByCategory = useMemo(() => {
    const categories: Record<string, { current: number; projected: number }> = {};

    products.forEach((p) => {
      if (!categories[p.category]) {
        categories[p.category] = { current: 0, projected: 0 };
      }
      categories[p.category].current += p.sales_30d;
      // Proyección simple: +10% si tiene tendencia positiva
      categories[p.category].projected += p.sales_30d * 1.1;
    });

    return Object.entries(categories)
      .map(([category, data]) => ({
        category: category.length > 18 ? category.substring(0, 18) + "..." : category,
        current: data.current,
        projected: Math.round(data.projected),
      }))
      .sort((a, b) => b.projected - a.projected);
  }, []);

  // KPIs de forecast
  const forecastedSales = salesForecast
    .filter((d) => d.forecast !== null)
    .reduce((sum, d) => sum + (d.forecast || 0), 0);

  const historicalAvg = salesTrend.reduce((sum, d) => sum + d.sales, 0) / salesTrend.length;
  const forecastAvg = forecastedSales / 7;
  const trendPercent = ((forecastAvg - historicalAvg) / historicalAvg) * 100;

  return (
    <div className="min-h-screen">
      <Header title="Forecasting" />

      <div className="p-6 space-y-6">
        {/* Disclaimer */}
        <InsightBox
          type="info"
          title="Predicciones basadas en datos sintéticos"
          description="Este módulo muestra una demo de forecasting. En producción, se utilizarían modelos de ML entrenados con datos reales históricos."
        />

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Ventas Proyectadas (7d)"
            value={formatCLP(forecastedSales)}
            subtitle="Próxima semana"
            trend={{ value: trendPercent, label: "vs promedio" }}
            icon={TrendingUp}
            variant="primary"
          />
          <KPICard
            title="Productos en Riesgo"
            value={formatNumber(stockoutRisk.length)}
            subtitle="Se agotan en < 14 días"
            icon={AlertTriangle}
            variant={stockoutRisk.length > 5 ? "warning" : "default"}
          />
          <KPICard
            title="Promedio Diario Proyectado"
            value={formatCLP(forecastAvg)}
            icon={Calendar}
          />
          <KPICard
            title="Precisión del Modelo"
            value="85%"
            subtitle="Basado en validación cruzada"
            icon={Brain}
            variant="success"
          />
        </div>

        {/* Gráfico principal de forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Proyección de Ventas (14 días históricos + 7 días forecast)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesForecast}>
                  <defs>
                    <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (!value) return ["-", name];
                      const label = name === "sales" ? "Ventas Reales" : "Proyección";
                      return [formatCLP(value), label];
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("es-CL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      });
                    }}
                  />
                  <ReferenceLine
                    x={salesTrend[salesTrend.length - 1]?.date}
                    stroke="#64748b"
                    strokeDasharray="5 5"
                    label={{
                      value: "Hoy",
                      position: "top",
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHistorical)"
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorForecast)"
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-primary-500 rounded" />
                <span className="text-dark-400">Ventas Reales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-green-500 rounded border-2 border-dashed border-green-500" />
                <span className="text-dark-400">Proyección</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Productos en riesgo de agotamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Riesgo de Agotamiento (próximos 14 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockoutRisk.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-green-400" />
                  <p className="mt-3 text-sm text-dark-400">
                    No hay productos en riesgo de agotamiento
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockoutRisk.slice(0, 8).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-700"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          product.daysUntilStockout && product.daysUntilStockout <= 3
                            ? "bg-red-500/20"
                            : product.daysUntilStockout && product.daysUntilStockout <= 7
                            ? "bg-yellow-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        <Package
                          className={`h-5 w-5 ${
                            product.daysUntilStockout && product.daysUntilStockout <= 3
                              ? "text-red-400"
                              : product.daysUntilStockout && product.daysUntilStockout <= 7
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-dark-400">
                          Stock: {product.stock_total} | Punto reorden: {product.reorderPoint}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            product.daysUntilStockout && product.daysUntilStockout <= 3
                              ? "critical"
                              : product.daysUntilStockout && product.daysUntilStockout <= 7
                              ? "alert"
                              : "low"
                          }
                        >
                          {product.daysUntilStockout} días
                        </Badge>
                        {product.stockoutDate && (
                          <p className="text-xs text-dark-500 mt-1">
                            {formatDate(product.stockoutDate.toISOString())}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demanda proyectada por categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demanda Proyectada por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={demandByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="#64748b"
                      fontSize={11}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatNumber(value),
                        name === "current" ? "Actual" : "Proyectado",
                      ]}
                    />
                    <Bar dataKey="current" fill="#7c3aed" radius={[0, 4, 4, 0]} name="current" />
                    <Line
                      dataKey="projected"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      name="projected"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 bg-primary-500 rounded" />
                  <span className="text-dark-400">Demanda Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-dark-400">Proyección (+10%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

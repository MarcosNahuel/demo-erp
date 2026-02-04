"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/kpi-card";
import { products } from "@/lib/mock-data";
import { calculatePareto, getABCSummary, getParetoChartData } from "@/lib/calculations";
import { formatCLP, formatNumber, formatPercent, abcClassColors } from "@/lib/utils";
import { TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

export default function ParetoPage() {
  const paretoItems = useMemo(() => calculatePareto(products), []);
  const abcSummary = useMemo(() => getABCSummary(paretoItems), [paretoItems]);
  const chartData = useMemo(() => getParetoChartData(paretoItems).slice(0, 20), [paretoItems]);

  const totalSales = paretoItems.reduce((sum, item) => sum + item.salesAmount, 0);
  const top10Sales = paretoItems.slice(0, 10).reduce((sum, item) => sum + item.salesAmount, 0);
  const top10Percent = (top10Sales / totalSales) * 100;

  return (
    <div className="min-h-screen">
      <Header title="Análisis Pareto" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Ventas Totales"
            value={formatCLP(totalSales)}
            subtitle="Últimos 30 días"
            icon={DollarSign}
            variant="primary"
          />
          <KPICard
            title="Top 10 Productos"
            value={formatPercent(top10Percent)}
            subtitle={`${formatCLP(top10Sales)} de las ventas`}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Productos Clase A"
            value={formatNumber(abcSummary.A.count)}
            subtitle={`${formatPercent(abcSummary.A.percent)} de ventas`}
            icon={Package}
          />
          <KPICard
            title="Clase C (Cola larga)"
            value={formatNumber(abcSummary.C.count)}
            subtitle={`${formatPercent(abcSummary.C.percent)} de ventas`}
            icon={BarChart3}
          />
        </div>

        {/* Resumen ABC */}
        <div className="grid gap-4 md:grid-cols-3">
          {(["A", "B", "C"] as const).map((cls) => (
            <Card key={cls} className={`border-l-4 ${cls === "A" ? "border-l-primary-500" : cls === "B" ? "border-l-accent" : "border-l-dark-500"}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-400">Clase {cls}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatNumber(abcSummary[cls].count)} productos
                    </p>
                    <p className="text-sm text-dark-500 mt-1">
                      {formatPercent((abcSummary[cls].count / products.length) * 100)} del catálogo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dark-400">Ventas</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {formatPercent(abcSummary[cls].percent)}
                    </p>
                    <p className="text-xs text-dark-500 mt-1">
                      {formatCLP(abcSummary[cls].sales)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className={`h-full ${cls === "A" ? "bg-primary-500" : cls === "B" ? "bg-accent" : "bg-dark-500"}`}
                    style={{ width: `${abcSummary[cls].percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico Pareto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Curva de Pareto - Top 20 Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="rank"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `#${value}`}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "sales") return [formatCLP(value), "Ventas"];
                      if (name === "cumulative") return [`${value.toFixed(1)}%`, "Acumulado"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      const item = chartData.find((d) => d.rank === label);
                      return item ? `${item.name} (${item.sku})` : label;
                    }}
                  />
                  <ReferenceLine
                    yAxisId="right"
                    y={80}
                    stroke="#db2777"
                    strokeDasharray="5 5"
                    label={{ value: "80%", position: "right", fill: "#db2777", fontSize: 12 }}
                  />
                  <Bar yAxisId="left" dataKey="sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.abcClass === "A"
                            ? "#7c3aed"
                            : entry.abcClass === "B"
                            ? "#db2777"
                            : "#475569"
                        }
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de productos por clase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalle por Clasificación ABC</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700 text-left text-sm text-dark-400">
                    <th className="p-4 font-medium">#</th>
                    <th className="p-4 font-medium">Producto</th>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium text-right">Ventas 30d</th>
                    <th className="p-4 font-medium text-right">% del Total</th>
                    <th className="p-4 font-medium text-right">% Acumulado</th>
                    <th className="p-4 font-medium">Clase</th>
                  </tr>
                </thead>
                <tbody>
                  {paretoItems.slice(0, 20).map((item, index) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-dark-800 hover:bg-dark-800/50"
                    >
                      <td className="p-4 text-dark-400">{index + 1}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-white truncate max-w-[250px]">
                          {item.product.title}
                        </p>
                      </td>
                      <td className="p-4">
                        <code className="text-xs text-dark-400">{item.product.sku}</code>
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-white">
                        {formatCLP(item.salesAmount)}
                      </td>
                      <td className="p-4 text-right text-sm text-dark-400">
                        {formatPercent(item.salesPercent)}
                      </td>
                      <td className="p-4 text-right text-sm text-dark-400">
                        {formatPercent(item.cumulativePercent)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            item.abcClass === "A"
                              ? "default"
                              : item.abcClass === "B"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            item.abcClass === "A"
                              ? "bg-primary-500"
                              : item.abcClass === "B"
                              ? "bg-accent"
                              : ""
                          }
                        >
                          Clase {item.abcClass}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

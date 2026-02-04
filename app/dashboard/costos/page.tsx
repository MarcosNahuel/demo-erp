"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data";
import { calculateInventoryValuation } from "@/lib/calculations";
import { formatCLP, formatNumber, formatPercent } from "@/lib/utils";
import { DollarSign, TrendingUp, Package, Upload, FileSpreadsheet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const COLORS = ["#7c3aed", "#db2777", "#10b981", "#f59e0b", "#3b82f6"];

export default function CostosPage() {
  const valuation = useMemo(() => calculateInventoryValuation(products), []);

  // Productos por margen
  const marginDistribution = useMemo(() => {
    const ranges = [
      { range: "0-30%", min: 0, max: 30, count: 0, value: 0 },
      { range: "30-50%", min: 30, max: 50, count: 0, value: 0 },
      { range: "50-70%", min: 50, max: 70, count: 0, value: 0 },
      { range: "70-100%", min: 70, max: 100, count: 0, value: 0 },
    ];

    products.forEach((p) => {
      const range = ranges.find(
        (r) => p.margin_percent >= r.min && p.margin_percent < r.max
      );
      if (range) {
        range.count++;
        range.value += p.margin * p.stock_total;
      }
    });

    return ranges;
  }, []);

  // ROI vs Ventas (scatter)
  const roiVsSales = useMemo(() => {
    return products.map((p) => ({
      name: p.title.substring(0, 20),
      roi: p.roi,
      sales: p.sales_amount_30d,
      margin: p.margin_percent,
      stock: p.stock_total,
    }));
  }, []);

  // Top 10 por margen absoluto
  const topByMargin = useMemo(() => {
    return [...products]
      .sort((a, b) => b.margin * b.sales_30d - a.margin * a.sales_30d)
      .slice(0, 10)
      .map((p) => ({
        name: p.title.substring(0, 25) + (p.title.length > 25 ? "..." : ""),
        sku: p.sku,
        marginTotal: p.margin * p.sales_30d,
        marginPercent: p.margin_percent,
        sales: p.sales_30d,
      }));
  }, []);

  // Promedio ponderado de margen
  const avgWeightedMargin = useMemo(() => {
    const totalSales = products.reduce((sum, p) => sum + p.sales_amount_30d, 0);
    const weightedMargin = products.reduce(
      (sum, p) => sum + p.margin_percent * p.sales_amount_30d,
      0
    );
    return totalSales > 0 ? weightedMargin / totalSales : 0;
  }, []);

  return (
    <div className="min-h-screen">
      <Header title="Gestión de Costos" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Valorización Stock"
            value={formatCLP(valuation.totalCost)}
            subtitle="Costo de inventario"
            icon={Package}
            variant="primary"
          />
          <KPICard
            title="Valor de Venta"
            value={formatCLP(valuation.totalPrice)}
            subtitle="Si se vende todo el stock"
            icon={DollarSign}
          />
          <KPICard
            title="Ganancia Potencial"
            value={formatCLP(valuation.potentialProfit)}
            subtitle={`${formatPercent((valuation.potentialProfit / valuation.totalCost) * 100)} del costo`}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Margen Ponderado"
            value={formatPercent(avgWeightedMargin)}
            subtitle="Ponderado por ventas"
          />
        </div>

        {/* Carga de costos (mock) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actualizar Costos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-dark-400 mx-auto mb-3" />
                <p className="text-sm text-dark-400">
                  Arrastra un archivo Excel/CSV o haz clic para seleccionar
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  Formato: SKU, Costo (columnas A y B)
                </p>
              </div>
              <div className="text-center">
                <Button variant="outline" className="mb-2">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Descargar plantilla
                </Button>
                <p className="text-xs text-dark-500">
                  Última actualización: hace 3 días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por margen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos por Rango de Margen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marginDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "count") return [value, "Productos"];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {marginDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top productos por ganancia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 por Ganancia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topByMargin} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={10}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCLP(value), "Ganancia"]}
                    />
                    <Bar dataKey="marginTotal" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de costos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalle de Costos y Márgenes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700 text-left text-sm text-dark-400">
                    <th className="p-4 font-medium">Producto</th>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium text-right">Costo</th>
                    <th className="p-4 font-medium text-right">Precio</th>
                    <th className="p-4 font-medium text-right">Margen $</th>
                    <th className="p-4 font-medium text-right">Margen %</th>
                    <th className="p-4 font-medium text-right">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 15).map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-dark-800 hover:bg-dark-800/50"
                    >
                      <td className="p-4">
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                          {product.title}
                        </p>
                      </td>
                      <td className="p-4">
                        <code className="text-xs text-dark-400">{product.sku}</code>
                      </td>
                      <td className="p-4 text-right text-sm text-dark-400">
                        {formatCLP(product.cost)}
                      </td>
                      <td className="p-4 text-right text-sm text-white">
                        {formatCLP(product.price)}
                      </td>
                      <td className="p-4 text-right text-sm text-green-400">
                        {formatCLP(product.margin)}
                      </td>
                      <td className="p-4 text-right">
                        <Badge
                          variant={
                            product.margin_percent >= 60
                              ? "success"
                              : product.margin_percent >= 40
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {formatPercent(product.margin_percent)}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-sm text-white">
                        {formatPercent(product.roi)}
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

"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { suppliers, getProductsBySupplier, products } from "@/lib/mock-data";
import { analyzeSupplier } from "@/lib/calculations";
import { formatCLP, formatNumber, formatPercent, getStockStatus, stockStatusColors } from "@/lib/utils";
import { Truck, Package, DollarSign, TrendingUp, Mail, Phone } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const COLORS = ["#7c3aed", "#db2777", "#10b981", "#f59e0b", "#3b82f6"];

export default function ProveedoresPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Análisis por proveedor
  const supplierAnalysis = useMemo(() => {
    return suppliers.map((supplier) => {
      const supplierProducts = getProductsBySupplier(supplier.id);
      const analysis = analyzeSupplier(supplierProducts);

      // Contar estados de stock
      const stockStatus = {
        critical: 0,
        alert: 0,
        low: 0,
        normal: 0,
        overstock: 0,
      };

      supplierProducts.forEach((p) => {
        const status = getStockStatus(p.stock_total, p.sales_30d);
        stockStatus[status]++;
      });

      return {
        ...supplier,
        ...analysis,
        stockStatus,
        products: supplierProducts,
      };
    });
  }, []);

  // Datos para gráfico de ventas por proveedor
  const salesBySupplier = useMemo(() => {
    return supplierAnalysis
      .map((s) => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        fullName: s.name,
        sales: s.totalSales,
        products: s.totalProducts,
        margin: s.avgMargin,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [supplierAnalysis]);

  // Proveedor seleccionado
  const selectedSupplierData = useMemo(() => {
    if (!selectedSupplier) return null;
    return supplierAnalysis.find((s) => s.id === selectedSupplier);
  }, [selectedSupplier, supplierAnalysis]);

  // Total de métricas
  const totals = useMemo(() => {
    return {
      products: suppliers.reduce((sum, s) => sum + s.total_products, 0),
      stock: suppliers.reduce((sum, s) => sum + s.total_stock, 0),
      valuation: suppliers.reduce((sum, s) => sum + s.total_valuation, 0),
      sales: suppliers.reduce((sum, s) => sum + s.total_sales_30d, 0),
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header title="Proveedores" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Proveedores"
            value={formatNumber(suppliers.length)}
            icon={Truck}
            variant="primary"
          />
          <KPICard
            title="Productos en Catálogo"
            value={formatNumber(totals.products)}
            icon={Package}
          />
          <KPICard
            title="Valor de Stock"
            value={formatCLP(totals.valuation)}
            icon={DollarSign}
          />
          <KPICard
            title="Ventas Totales 30d"
            value={formatCLP(totals.sales)}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista de proveedores */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proveedores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplierAnalysis.map((supplier, index) => (
                  <button
                    key={supplier.id}
                    onClick={() => setSelectedSupplier(supplier.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedSupplier === supplier.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{supplier.name}</p>
                        <p className="text-xs text-dark-400 mt-1">
                          {supplier.totalProducts} productos
                        </p>
                      </div>
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS[index]}30` }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: COLORS[index] }}
                        >
                          {supplier.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-dark-500">Ventas 30d</p>
                        <p className="font-medium text-white">
                          {formatCLP(supplier.totalSales)}
                        </p>
                      </div>
                      <div>
                        <p className="text-dark-500">Margen prom.</p>
                        <p className="font-medium text-white">
                          {formatPercent(supplier.avgMargin)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detalle del proveedor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSupplierData ? (
              <>
                {/* Info del proveedor */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {selectedSupplierData.name}
                        </CardTitle>
                        <p className="text-sm text-dark-400 mt-1">
                          Contacto: {selectedSupplierData.contact_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`mailto:${selectedSupplierData.email}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                          <Mail className="h-4 w-4 text-dark-300" />
                        </a>
                        <a
                          href={`tel:${selectedSupplierData.phone}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-dark-300" />
                        </a>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-dark-800">
                        <p className="text-xs text-dark-400">Productos</p>
                        <p className="text-xl font-bold text-white mt-1">
                          {selectedSupplierData.totalProducts}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800">
                        <p className="text-xs text-dark-400">Stock Total</p>
                        <p className="text-xl font-bold text-white mt-1">
                          {formatNumber(selectedSupplierData.totalStock)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800">
                        <p className="text-xs text-dark-400">Ventas 30d</p>
                        <p className="text-xl font-bold text-white mt-1">
                          {formatCLP(selectedSupplierData.totalSales)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-dark-800">
                        <p className="text-xs text-dark-400">Margen Prom.</p>
                        <p className="text-xl font-bold text-white mt-1">
                          {formatPercent(selectedSupplierData.avgMargin)}
                        </p>
                      </div>
                    </div>

                    {/* Estado de stock */}
                    <div className="mt-4">
                      <p className="text-sm text-dark-400 mb-2">Estado del inventario</p>
                      <div className="flex gap-2">
                        {Object.entries(selectedSupplierData.stockStatus).map(
                          ([status, count]) => {
                            if (count === 0) return null;
                            const config = stockStatusColors[status as keyof typeof stockStatusColors];
                            return (
                              <Badge
                                key={status}
                                variant="outline"
                                className="gap-1"
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${config.bg}`}
                                />
                                {config.label}: {count}
                              </Badge>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Productos del proveedor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Productos ({selectedSupplierData.products.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-700 text-left text-sm text-dark-400">
                            <th className="p-4 font-medium">Producto</th>
                            <th className="p-4 font-medium text-right">Stock</th>
                            <th className="p-4 font-medium text-right">Ventas 30d</th>
                            <th className="p-4 font-medium text-right">Margen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSupplierData.products.map((product) => (
                            <tr
                              key={product.id}
                              className="border-b border-dark-800 hover:bg-dark-800/50"
                            >
                              <td className="p-4">
                                <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                  {product.title}
                                </p>
                                <code className="text-xs text-dark-500">
                                  {product.sku}
                                </code>
                              </td>
                              <td className="p-4 text-right">
                                <p className="text-sm text-white">
                                  {formatNumber(product.stock_total)}
                                </p>
                              </td>
                              <td className="p-4 text-right">
                                <p className="text-sm text-white">
                                  {formatCLP(product.sales_amount_30d)}
                                </p>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Gráfico general */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ventas por Proveedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesBySupplier} layout="vertical">
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
                          fontSize={12}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [formatCLP(value), "Ventas"]}
                          labelFormatter={(label) => {
                            const supplier = salesBySupplier.find((s) => s.name === label);
                            return supplier?.fullName || label;
                          }}
                        />
                        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                          {salesBySupplier.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-sm text-dark-400 mt-4">
                    Selecciona un proveedor para ver el detalle
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

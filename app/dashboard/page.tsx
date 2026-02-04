"use client";

import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { InsightBox } from "@/components/dashboard/insight-box";
import { AlertsPanel } from "@/components/features/alerts-panel";
import { StockLegend } from "@/components/features/stock-traffic-light";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardKPIs,
  getSalesByChannel,
  getSalesTrend,
  getStockDistribution,
  getActiveAlerts,
  getCriticalProducts,
} from "@/lib/mock-data";
import { formatCLP, formatNumber, formatPercent } from "@/lib/utils";
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#7c3aed", "#db2777", "#10b981", "#f59e0b", "#3b82f6"];

export default function DashboardPage() {
  const kpis = getDashboardKPIs();
  const salesByChannel = getSalesByChannel();
  const salesTrend = getSalesTrend();
  const stockDistribution = getStockDistribution();
  const activeAlerts = getActiveAlerts();
  const criticalProducts = getCriticalProducts();

  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="min-h-screen">
      <Header title="Overview" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Productos Activos"
            value={formatNumber(kpis.totalProducts)}
            subtitle={`${formatNumber(kpis.totalStock)} unidades en stock`}
            icon={Package}
            variant="primary"
          />
          <KPICard
            title="Valorización Stock"
            value={formatCLP(kpis.stockValuation)}
            subtitle="Costo de inventario"
            icon={Boxes}
            variant="default"
          />
          <KPICard
            title="Ventas 30 días"
            value={formatCLP(kpis.sales30d)}
            subtitle={`${formatNumber(kpis.orders30d)} órdenes`}
            trend={{ value: 12.5, label: "vs mes anterior" }}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Alertas Activas"
            value={formatNumber(kpis.alertsCount)}
            subtitle={`${criticalCount} críticas`}
            icon={AlertTriangle}
            variant={criticalCount > 0 ? "danger" : "default"}
          />
        </div>

        {/* Second Row - KPIs adicionales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Ticket Promedio"
            value={formatCLP(kpis.avgTicket)}
            trend={{ value: 5.2, label: "vs mes anterior" }}
            icon={ShoppingCart}
          />
          <KPICard
            title="Margen Promedio"
            value={formatPercent(kpis.avgMargin)}
            icon={DollarSign}
          />
          <KPICard
            title="Productos Críticos"
            value={formatNumber(kpis.criticalProducts)}
            subtitle={`${formatPercent((kpis.criticalProducts / kpis.totalProducts) * 100)} del total`}
            variant={kpis.criticalProducts > 5 ? "warning" : "default"}
          />
          <KPICard
            title="Stock Total"
            value={formatNumber(kpis.totalStock)}
            subtitle="unidades"
          />
        </div>

        {/* Insights */}
        {criticalCount > 0 && (
          <InsightBox
            type="danger"
            title={`${criticalCount} productos con stock crítico`}
            description="Estos productos pueden quedarse sin stock en los próximos días. Revisa las alertas para tomar acción."
            action={{
              label: "Ver alertas",
              onClick: () => (window.location.href = "/dashboard/alertas"),
            }}
          />
        )}

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tendencia de Ventas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencia de Ventas (14 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                      formatter={(value: number) => [formatCLP(value), "Ventas"]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString("es-CL", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        });
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Canal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="sales"
                    >
                      {salesByChannel.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCLP(value), "Ventas"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {salesByChannel.map((channel, index) => (
                    <div key={channel.channel} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {channel.label}
                        </p>
                        <p className="text-xs text-dark-400">
                          {formatPercent(channel.percent)} - {channel.orders} órdenes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución de Stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Estado del Inventario</CardTitle>
              <StockLegend />
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      dataKey="status"
                      type="category"
                      stroke="#64748b"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [
                        `${value} productos`,
                        "Cantidad",
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {stockDistribution.map((entry, index) => {
                        const colors: Record<string, string> = {
                          Crítico: "#ef4444",
                          Alerta: "#f97316",
                          Bajo: "#eab308",
                          Normal: "#22c55e",
                          Sobrestock: "#3b82f6",
                        };
                        return (
                          <Cell key={`cell-${index}`} fill={colors[entry.status]} />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alertas Recientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Alertas Recientes</CardTitle>
              <a
                href="/dashboard/alertas"
                className="text-sm text-primary-400 hover:underline"
              >
                Ver todas →
              </a>
            </CardHeader>
            <CardContent>
              <AlertsPanel alerts={activeAlerts} limit={4} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

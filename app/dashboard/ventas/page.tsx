"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { orders, getSalesTrend, getSalesByChannel, getProductsByCategory } from "@/lib/mock-data";
import { formatCLP, formatNumber, formatPercent } from "@/lib/utils";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
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
  Legend,
} from "recharts";

const COLORS = ["#7c3aed", "#db2777", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function VentasPage() {
  const salesTrend = useMemo(() => getSalesTrend(), []);
  const salesByChannel = useMemo(() => getSalesByChannel(), []);
  const productsByCategory = useMemo(() => getProductsByCategory(), []);

  const paidOrders = useMemo(() => orders.filter((o) => o.status === "paid"), []);
  const totalSales = useMemo(
    () => paidOrders.reduce((sum, o) => sum + o.total_amount, 0),
    [paidOrders]
  );
  const avgTicket = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const cancellationRate = (cancelledOrders / orders.length) * 100;

  // Ventas por día de la semana
  const salesByDayOfWeek = useMemo(() => {
    const days: Record<number, { sales: number; orders: number }> = {
      0: { sales: 0, orders: 0 },
      1: { sales: 0, orders: 0 },
      2: { sales: 0, orders: 0 },
      3: { sales: 0, orders: 0 },
      4: { sales: 0, orders: 0 },
      5: { sales: 0, orders: 0 },
      6: { sales: 0, orders: 0 },
    };

    paidOrders.forEach((order) => {
      const day = new Date(order.date_created).getDay();
      days[day].sales += order.total_amount;
      days[day].orders += 1;
    });

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return Object.entries(days).map(([day, data]) => ({
      day: dayNames[parseInt(day)],
      ...data,
    }));
  }, [paidOrders]);

  return (
    <div className="min-h-screen">
      <Header title="Ventas" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Ventas Totales"
            value={formatCLP(totalSales)}
            subtitle="Últimos 30 días"
            trend={{ value: 12.5, label: "vs mes anterior" }}
            icon={DollarSign}
            variant="primary"
          />
          <KPICard
            title="Órdenes"
            value={formatNumber(paidOrders.length)}
            subtitle={`${cancelledOrders} canceladas`}
            icon={ShoppingCart}
          />
          <KPICard
            title="Ticket Promedio"
            value={formatCLP(avgTicket)}
            trend={{ value: 5.2, label: "vs mes anterior" }}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Tasa de Cancelación"
            value={formatPercent(cancellationRate)}
            icon={Package}
            variant={cancellationRate > 10 ? "warning" : "default"}
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tendencia de ventas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencia de Ventas (14 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorSalesVentas" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value: number, name: string) => {
                        if (name === "sales") return [formatCLP(value), "Ventas"];
                        if (name === "orders") return [value, "Órdenes"];
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString("es-CL", {
                          weekday: "long",
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
                      fill="url(#colorSalesVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ventas por canal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="60%" height="100%">
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
                <div className="space-y-4">
                  {salesByChannel.map((channel, index) => (
                    <div key={channel.channel} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-medium text-white">
                          {channel.label}
                        </span>
                      </div>
                      <div className="pl-5">
                        <p className="text-lg font-bold text-white">
                          {formatPercent(channel.percent)}
                        </p>
                        <p className="text-xs text-dark-400">
                          {formatCLP(channel.sales)} · {channel.orders} órdenes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ventas por día de la semana */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas por Día de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
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
                        if (name === "sales") return [formatCLP(value), "Ventas"];
                        if (name === "orders") return [value, "Órdenes"];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ventas por categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productsByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="#64748b"
                      fontSize={11}
                      width={130}
                      tickFormatter={(value) =>
                        value.length > 18 ? value.substring(0, 18) + "..." : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCLP(value), "Ventas"]}
                    />
                    <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                      {productsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AlertsPanel } from "@/components/features/alerts-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActiveAlerts, products } from "@/lib/mock-data";
import { formatNumber, formatCLP, getStockStatus } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Package } from "lucide-react";
import type { Alert } from "@/types";

export default function AlertasPage() {
  const activeAlerts = useMemo(() => getActiveAlerts(), []);
  const [selectedType, setSelectedType] = useState<string>("all");

  const alertsByType = useMemo(() => {
    const types: Record<string, Alert[]> = {
      all: activeAlerts,
      low_stock: [],
      out_of_stock: [],
      negative_margin: [],
      slow_rotation: [],
    };

    activeAlerts.forEach((alert) => {
      if (types[alert.type]) {
        types[alert.type].push(alert);
      }
    });

    return types;
  }, [activeAlerts]);

  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;
  const infoCount = activeAlerts.filter((a) => a.severity === "info").length;

  // Productos que necesitan acción inmediata
  const urgentProducts = useMemo(() => {
    return products
      .filter((p) => {
        const status = getStockStatus(p.stock_total, p.sales_30d);
        return status === "critical" || p.stock_total === 0;
      })
      .sort((a, b) => a.days_of_stock - b.days_of_stock)
      .slice(0, 5);
  }, []);

  const displayedAlerts = alertsByType[selectedType] || activeAlerts;

  return (
    <div className="min-h-screen">
      <Header title="Centro de Alertas" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Alertas Activas"
            value={formatNumber(activeAlerts.length)}
            icon={AlertTriangle}
            variant="primary"
          />
          <KPICard
            title="Críticas"
            value={formatNumber(criticalCount)}
            subtitle="Requieren acción inmediata"
            icon={AlertCircle}
            variant="danger"
          />
          <KPICard
            title="Advertencias"
            value={formatNumber(warningCount)}
            subtitle="Revisar pronto"
            icon={AlertTriangle}
            variant="warning"
          />
          <KPICard
            title="Informativas"
            value={formatNumber(infoCount)}
            subtitle="Para seguimiento"
            icon={Info}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Panel de alertas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" onValueChange={setSelectedType}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">
                      Todas ({activeAlerts.length})
                    </TabsTrigger>
                    <TabsTrigger value="low_stock">
                      Stock Bajo ({alertsByType.low_stock.length})
                    </TabsTrigger>
                    <TabsTrigger value="out_of_stock">
                      Sin Stock ({alertsByType.out_of_stock.length})
                    </TabsTrigger>
                    <TabsTrigger value="slow_rotation">
                      Rotación Lenta ({alertsByType.slow_rotation.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={selectedType} className="mt-0">
                    <AlertsPanel alerts={displayedAlerts} showAll />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas y productos urgentes */}
          <div className="space-y-6">
            {/* Resumen de severidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por Severidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-sm font-medium text-white">Críticas</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">{criticalCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Advertencias</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">{warningCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Informativas</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">{infoCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Productos urgentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acción Inmediata</CardTitle>
              </CardHeader>
              <CardContent>
                {urgentProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                    <p className="mt-2 text-sm text-dark-400">
                      No hay productos que requieran acción inmediata
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {urgentProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-700"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                          <Package className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-dark-400">
                            Stock: {product.stock_total} | {product.days_of_stock.toFixed(1)} días
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-400">
                            {product.stock_total === 0 ? "SIN STOCK" : "CRÍTICO"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

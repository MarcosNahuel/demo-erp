"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  TrendingUp,
  Bell,
  DollarSign,
  Truck,
  LineChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
  },
  {
    name: "Pareto",
    href: "/dashboard/pareto",
    icon: BarChart3,
  },
  {
    name: "Ventas",
    href: "/dashboard/ventas",
    icon: TrendingUp,
  },
  {
    name: "Alertas",
    href: "/dashboard/alertas",
    icon: Bell,
  },
  {
    name: "Costos",
    href: "/dashboard/costos",
    icon: DollarSign,
  },
  {
    name: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Truck,
  },
  {
    name: "Forecasting",
    href: "/dashboard/forecasting",
    icon: LineChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-dark-700 bg-dark-900 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-dark-700 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="text-lg font-semibold text-white">
                TRAID<span className="text-primary-400">ERP</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent">
              <span className="text-sm font-bold text-white">T</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-600/20 text-primary-400"
                    : "text-dark-400 hover:bg-dark-800 hover:text-white",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary-400" : "text-dark-400"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-dark-700 p-3">
          {!collapsed && (
            <div className="mb-3 rounded-lg bg-dark-800 p-3">
              <p className="text-xs text-dark-400">Demo - TechStore CL</p>
              <p className="text-xs text-dark-500">Datos sintéticos</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", collapsed && "px-2")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Colapsar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

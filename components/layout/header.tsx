"use client";

import { useTheme } from "next-themes";
import { Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActiveAlerts } from "@/lib/mock-data";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const activeAlerts = getActiveAlerts();
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dark-700 bg-dark-900/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-dark-400">TechStore CL - Mercado Libre Chile</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Alertas */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-dark-400" />
          {criticalCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {criticalCount}
            </span>
          )}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 text-dark-400 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-dark-400 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-dark-700 pl-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Usuario Demo</p>
            <p className="text-xs text-dark-400">Administrador</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

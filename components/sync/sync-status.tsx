"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SyncState } from "@/types";
import { CheckCircle, Clock, Link2, Package, Users, RotateCcw } from "lucide-react";

interface SyncStatusProps {
  syncState: SyncState;
  onRestore: () => void;
}

export function SyncStatus({ syncState, onRestore }: SyncStatusProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold text-white">Datos sincronizados</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRestore}
          className="border-dark-600 hover:bg-dark-700"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar originales
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-dark-400" />
          <span className="text-dark-400">Última sync:</span>
          <span className="text-white">
            {syncState.lastSync ? formatDate(syncState.lastSync) : "-"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-dark-400" />
          <span className="text-dark-400">Productos:</span>
          <Badge variant="secondary" className="bg-dark-700">
            {syncState.productsCount}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-dark-400" />
          <span className="text-dark-400">Proveedores:</span>
          <Badge variant="secondary" className="bg-dark-700">
            {syncState.suppliersCount}
          </Badge>
        </div>

        {syncState.sheetUrl && (
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-dark-400" />
            <a
              href={syncState.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 truncate max-w-[200px]"
            >
              Ver Sheet original
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

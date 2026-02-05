"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { extractSheetId } from "@/lib/google-sheets";

interface SheetInputProps {
  onLoadPreview: (sheetId: string, url: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function SheetInput({ onLoadPreview, isLoading, error }: SheetInputProps) {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!url.trim()) {
      setLocalError("Ingresá la URL del Google Sheet");
      return;
    }

    const sheetId = extractSheetId(url);
    if (!sheetId) {
      setLocalError(
        "URL inválida. Usá el link completo del Sheet (ej: https://docs.google.com/spreadsheets/d/...)"
      );
      return;
    }

    await onLoadPreview(sheetId, url);
  };

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-dark-400">
        <FileSpreadsheet className="h-5 w-5" />
        <span className="text-sm">
          Pegá la URL de un Google Sheet público con datos de Productos y
          Proveedores
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="url"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setLocalError(null);
          }}
          className="flex-1 bg-dark-800 border-dark-700 text-white placeholder:text-dark-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            "Cargar Preview"
          )}
        </Button>
      </form>

      {displayError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{displayError}</p>
        </div>
      )}

      <div className="rounded-lg bg-dark-800/50 p-4 text-sm text-dark-400">
        <p className="font-medium text-dark-300 mb-2">
          Formato esperado del Sheet:
        </p>
        <div className="space-y-2">
          <p>
            <span className="text-primary-400">Hoja 1 - Productos:</span> sku,
            title, price, cost, stock_full, stock_flex, category, supplier_name
          </p>
          <p>
            <span className="text-primary-400">Hoja 2 - Proveedores:</span> id,
            name, contact_name, email
          </p>
        </div>
        <p className="mt-3 text-xs text-dark-500">
          El Sheet debe estar publicado: Archivo → Compartir → Publicar en la
          web
        </p>
      </div>
    </div>
  );
}

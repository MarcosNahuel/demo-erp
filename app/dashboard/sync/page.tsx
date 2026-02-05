"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SheetInput } from "@/components/sync/sheet-input";
import { DataPreview } from "@/components/sync/data-preview";
import { SyncStatus } from "@/components/sync/sync-status";
import {
  fetchGoogleSheet,
  validateProductRows,
  validateSupplierRows,
} from "@/lib/google-sheets";
import {
  getSyncState,
  saveSyncState,
  saveSyncedProducts,
  saveSyncedSuppliers,
  clearSyncData,
  sheetProductToProduct,
  sheetSupplierToSupplier,
} from "@/lib/sync-storage";
import type { SyncState, SheetProduct, SheetSupplier, ValidationError } from "@/types";
import { RefreshCw, Loader2, CheckCircle } from "lucide-react";

type PageState = "idle" | "loading" | "preview" | "syncing" | "synced" | "error";

export default function SyncPage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview data
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [products, setProducts] = useState<SheetProduct[]>([]);
  const [suppliers, setSuppliers] = useState<SheetSupplier[]>([]);
  const [productErrors, setProductErrors] = useState<ValidationError[]>([]);
  const [supplierErrors, setSupplierErrors] = useState<ValidationError[]>([]);

  // Cargar estado inicial
  useEffect(() => {
    const state = getSyncState();
    if (state && state.lastSync) {
      setSyncState(state);
      setPageState("synced");
    }
  }, []);

  // Cargar preview del sheet
  const handleLoadPreview = useCallback(async (id: string, url: string) => {
    setPageState("loading");
    setError(null);
    setSheetUrl(url);

    try {
      // Fetch productos (gid=0)
      const productsResult = await fetchGoogleSheet(id, 0);
      if (productsResult.error) {
        setError(productsResult.error);
        setPageState("error");
        return;
      }

      // Fetch proveedores (gid=1, segunda hoja)
      const suppliersResult = await fetchGoogleSheet(id, 1);
      // No es error si no hay hoja de proveedores

      // Validar productos
      const { products: validProducts, errors: prodErrors } = validateProductRows(
        productsResult.data
      );

      // Validar proveedores
      const { suppliers: validSuppliers, errors: supErrors } = validateSupplierRows(
        suppliersResult.data
      );

      setProducts(validProducts);
      setSuppliers(validSuppliers);
      setProductErrors(prodErrors);
      setSupplierErrors(supErrors);

      if (validProducts.length === 0 && prodErrors.length > 0) {
        setError("No se pudieron validar los productos. Revisá los errores.");
        setPageState("error");
        return;
      }

      setPageState("preview");
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Error inesperado al cargar el Sheet");
      setPageState("error");
    }
  }, []);

  // Sincronizar datos
  const handleSync = async () => {
    setPageState("syncing");

    try {
      // Transformar productos
      const fullProducts = products.map((p, i) => sheetProductToProduct(p, i));

      // Transformar proveedores (o generar desde productos si no hay)
      let fullSuppliers;
      if (suppliers.length > 0) {
        fullSuppliers = suppliers.map((s) => sheetSupplierToSupplier(s, fullProducts));
      } else {
        // Generar proveedores únicos desde productos
        const uniqueSupplierNames = [...new Set(products.map((p) => p.supplier_name))];
        fullSuppliers = uniqueSupplierNames.map((name, i) =>
          sheetSupplierToSupplier(
            { id: `sup-${i + 1}`, name },
            fullProducts
          )
        );
      }

      // Guardar en localStorage
      saveSyncedProducts(fullProducts);
      saveSyncedSuppliers(fullSuppliers);

      const newSyncState: SyncState = {
        lastSync: new Date().toISOString(),
        sheetUrl,
        productsCount: fullProducts.length,
        suppliersCount: fullSuppliers.length,
      };
      saveSyncState(newSyncState);
      setSyncState(newSyncState);

      setPageState("synced");

      // Recargar la página para que los datos se reflejen en todo el dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error syncing:", err);
      setError("Error al sincronizar los datos");
      setPageState("error");
    }
  };

  // Restaurar datos originales
  const handleRestore = () => {
    clearSyncData();
    setSyncState(null);
    setPageState("idle");
    setProducts([]);
    setSuppliers([]);
    setProductErrors([]);
    setSupplierErrors([]);

    // Recargar para usar datos originales
    window.location.reload();
  };

  const hasErrors = productErrors.length > 0 || supplierErrors.length > 0;
  const canSync = products.length > 0 && !hasErrors;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-primary-400" />
          Sincronizar Datos
        </h1>
        <p className="mt-1 text-dark-400">
          Actualizá productos y proveedores desde un Google Sheet público
        </p>
      </div>

      {/* Estado actual de sync */}
      {syncState && pageState === "synced" && (
        <SyncStatus syncState={syncState} onRestore={handleRestore} />
      )}

      {/* Input de Sheet */}
      <Card className="border-dark-700 bg-dark-900">
        <CardHeader>
          <CardTitle className="text-white">Fuente de datos</CardTitle>
        </CardHeader>
        <CardContent>
          <SheetInput
            onLoadPreview={handleLoadPreview}
            isLoading={pageState === "loading"}
            error={pageState === "error" ? error : null}
          />
        </CardContent>
      </Card>

      {/* Preview de datos */}
      {pageState === "preview" && (
        <Card className="border-dark-700 bg-dark-900">
          <CardContent className="pt-6">
            <DataPreview
              products={products}
              suppliers={suppliers}
              productErrors={productErrors}
              supplierErrors={supplierErrors}
            />

            {/* Botón de sincronizar */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPageState("idle");
                  setProducts([]);
                  setSuppliers([]);
                }}
                className="border-dark-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSync}
                disabled={!canSync}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {hasErrors
                  ? "Corregí los errores primero"
                  : `Sincronizar ${products.length} productos`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de sincronización */}
      {pageState === "syncing" && (
        <Card className="border-dark-700 bg-dark-900">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
              <p className="mt-4 text-white">Sincronizando datos...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Éxito temporal */}
      {pageState === "synced" && !syncState && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-4 text-white">Datos sincronizados correctamente</p>
              <p className="text-sm text-dark-400">Recargando dashboard...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

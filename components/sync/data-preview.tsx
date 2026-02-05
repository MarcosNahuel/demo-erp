"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { SheetProduct, SheetSupplier, ValidationError } from "@/types";
import { AlertTriangle, Package, Users, AlertCircle } from "lucide-react";

interface DataPreviewProps {
  products: SheetProduct[];
  suppliers: SheetSupplier[];
  productErrors: ValidationError[];
  supplierErrors: ValidationError[];
}

export function DataPreview({
  products,
  suppliers,
  productErrors,
  supplierErrors,
}: DataPreviewProps) {
  const [activeTab, setActiveTab] = useState("products");

  const totalErrors = productErrors.length + supplierErrors.length;
  const hasErrors = totalErrors > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Preview de datos</h3>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-dark-700">
            <Package className="mr-1 h-3 w-3" />
            {products.length} productos
          </Badge>
          <Badge variant="secondary" className="bg-dark-700">
            <Users className="mr-1 h-3 w-3" />
            {suppliers.length} proveedores
          </Badge>
          {hasErrors && (
            <Badge variant="destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {totalErrors} errores
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-dark-800">
          <TabsTrigger value="products" className="data-[state=active]:bg-dark-700">
            Productos
            {productErrors.length > 0 && (
              <span className="ml-1 text-red-400">({productErrors.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-dark-700">
            Proveedores
            {supplierErrors.length > 0 && (
              <span className="ml-1 text-red-400">({supplierErrors.length})</span>
            )}
          </TabsTrigger>
          {hasErrors && (
            <TabsTrigger value="errors" className="data-[state=active]:bg-dark-700">
              Errores
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <ProductsTable products={products.slice(0, 10)} />
          {products.length > 10 && (
            <p className="mt-2 text-sm text-dark-400">
              Mostrando 10 de {products.length} productos
            </p>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <SuppliersTable suppliers={suppliers.slice(0, 10)} />
          {suppliers.length > 10 && (
            <p className="mt-2 text-sm text-dark-400">
              Mostrando 10 de {suppliers.length} proveedores
            </p>
          )}
        </TabsContent>

        {hasErrors && (
          <TabsContent value="errors" className="mt-4">
            <ErrorsList
              productErrors={productErrors}
              supplierErrors={supplierErrors}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ProductsTable({ products }: { products: SheetProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dark-700 p-8 text-center text-dark-400">
        No se encontraron productos válidos
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-dark-700">
      <table className="w-full text-sm">
        <thead className="bg-dark-800">
          <tr>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">SKU</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Título</th>
            <th className="px-4 py-3 text-right text-dark-400 font-medium">Precio</th>
            <th className="px-4 py-3 text-right text-dark-400 font-medium">Costo</th>
            <th className="px-4 py-3 text-right text-dark-400 font-medium">Stock Full</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Categoría</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Proveedor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700">
          {products.map((product, index) => (
            <tr key={index} className="hover:bg-dark-800/50">
              <td className="px-4 py-3 text-white font-mono text-xs">
                {product.sku}
              </td>
              <td className="px-4 py-3 text-white max-w-[200px] truncate">
                {product.title}
              </td>
              <td className="px-4 py-3 text-right text-white">
                ${product.price.toLocaleString("es-CL")}
              </td>
              <td className="px-4 py-3 text-right text-dark-400">
                ${product.cost.toLocaleString("es-CL")}
              </td>
              <td className="px-4 py-3 text-right text-white">
                {product.stock_full}
              </td>
              <td className="px-4 py-3 text-dark-400">{product.category}</td>
              <td className="px-4 py-3 text-dark-400">{product.supplier_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SuppliersTable({ suppliers }: { suppliers: SheetSupplier[] }) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-dark-700 p-8 text-center text-dark-400">
        No se encontraron proveedores válidos
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-dark-700">
      <table className="w-full text-sm">
        <thead className="bg-dark-800">
          <tr>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">ID</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Nombre</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Contacto</th>
            <th className="px-4 py-3 text-left text-dark-400 font-medium">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700">
          {suppliers.map((supplier, index) => (
            <tr key={index} className="hover:bg-dark-800/50">
              <td className="px-4 py-3 text-white font-mono text-xs">
                {supplier.id}
              </td>
              <td className="px-4 py-3 text-white">{supplier.name}</td>
              <td className="px-4 py-3 text-dark-400">
                {supplier.contact_name || "-"}
              </td>
              <td className="px-4 py-3 text-dark-400">{supplier.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorsList({
  productErrors,
  supplierErrors,
}: {
  productErrors: ValidationError[];
  supplierErrors: ValidationError[];
}) {
  const allErrors = [
    ...productErrors.map((e) => ({ ...e, type: "Producto" })),
    ...supplierErrors.map((e) => ({ ...e, type: "Proveedor" })),
  ];

  return (
    <div className="space-y-2">
      {allErrors.map((error, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="text-red-400 font-medium">
              {error.type} - Fila {error.row}
            </span>
            <span className="text-dark-400"> ({error.column}): </span>
            <span className="text-white">{error.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockTrafficLight, StockLegend } from "@/components/features/stock-traffic-light";
import { products } from "@/lib/mock-data";
import { formatCLP, formatNumber, formatPercent, getStockStatus } from "@/lib/utils";
import { Search, Package, ArrowUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortField = "title" | "stock_total" | "sales_30d" | "margin_percent" | "days_of_stock";
type SortOrder = "asc" | "desc";

export default function InventarioPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("sales_30d");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtro de búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de categoría
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Filtro de estado de stock
    if (statusFilter !== "all") {
      result = result.filter((p) => {
        const status = getStockStatus(p.stock_total, p.sales_30d);
        return status === statusFilter;
      });
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "stock_total":
          comparison = a.stock_total - b.stock_total;
          break;
        case "sales_30d":
          comparison = a.sales_30d - b.sales_30d;
          break;
        case "margin_percent":
          comparison = a.margin_percent - b.margin_percent;
          break;
        case "days_of_stock":
          comparison = a.days_of_stock - b.days_of_stock;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [search, categoryFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="min-h-screen">
      <Header title="Inventario" />

      <div className="p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="overstock">Sobrestock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-dark-400">
                {filteredProducts.length} de {products.length} productos
              </p>
              <StockLegend />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700 text-left text-sm text-dark-400">
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">
                      <SortHeader field="title">Producto</SortHeader>
                    </th>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium text-right">
                      <SortHeader field="stock_total">Stock</SortHeader>
                    </th>
                    <th className="p-4 font-medium text-right">
                      <SortHeader field="sales_30d">Ventas/mes</SortHeader>
                    </th>
                    <th className="p-4 font-medium text-right">
                      <SortHeader field="days_of_stock">Días Stock</SortHeader>
                    </th>
                    <th className="p-4 font-medium text-right">Precio</th>
                    <th className="p-4 font-medium text-right">
                      <SortHeader field="margin_percent">Margen</SortHeader>
                    </th>
                    <th className="p-4 font-medium">Canal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <TooltipProvider key={product.id}>
                      <tr className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                        <td className="p-4">
                          <StockTrafficLight
                            stock={product.stock_total}
                            sales30d={product.sales_30d}
                            showLabel
                          />
                        </td>
                        <td className="p-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-dark-700 flex items-center justify-center overflow-hidden">
                                  <Package className="h-5 w-5 text-dark-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate max-w-[250px]">
                                    {product.title}
                                  </p>
                                  <p className="text-xs text-dark-500">{product.category}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[300px]">
                              <p className="font-medium">{product.title}</p>
                              <p className="text-xs text-dark-400 mt-1">
                                Proveedor: {product.supplier_name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-4">
                          <code className="text-xs text-dark-400">{product.sku}</code>
                        </td>
                        <td className="p-4 text-right">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {formatNumber(product.stock_total)}
                            </p>
                            <p className="text-xs text-dark-500">
                              F:{product.stock_full} / X:{product.stock_flex}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-sm font-medium text-white">
                            {formatNumber(product.sales_30d)}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-sm font-medium text-white">
                            {product.days_of_stock.toFixed(1)}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-sm font-medium text-white">
                            {formatCLP(product.price)}
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
                        <td className="p-4">
                          <Badge variant="outline">
                            {product.logistic_type === "fulfillment"
                              ? "FULL"
                              : product.logistic_type === "flex"
                              ? "FLEX"
                              : "Centro"}
                          </Badge>
                        </td>
                      </tr>
                    </TooltipProvider>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

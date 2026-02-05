// Persistencia de datos sincronizados en localStorage

import type { Product, Supplier, SyncState, SheetProduct, SheetSupplier } from "@/types";

const STORAGE_KEYS = {
  syncState: "demo-erp-sync-state",
  products: "demo-erp-synced-products",
  suppliers: "demo-erp-synced-suppliers",
};

// Obtener estado de sincronización
export function getSyncState(): SyncState | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEYS.syncState);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SyncState;
  } catch {
    return null;
  }
}

// Guardar estado de sincronización
export function saveSyncState(state: SyncState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.syncState, JSON.stringify(state));
}

// Obtener productos sincronizados
export function getSyncedProducts(): Product[] | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEYS.products);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Product[];
  } catch {
    return null;
  }
}

// Guardar productos sincronizados
export function saveSyncedProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

// Obtener proveedores sincronizados
export function getSyncedSuppliers(): Supplier[] | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEYS.suppliers);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Supplier[];
  } catch {
    return null;
  }
}

// Guardar proveedores sincronizados
export function saveSyncedSuppliers(suppliers: Supplier[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
}

// Limpiar todos los datos sincronizados
export function clearSyncData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.syncState);
  localStorage.removeItem(STORAGE_KEYS.products);
  localStorage.removeItem(STORAGE_KEYS.suppliers);
}

// Transforma SheetProduct a Product (agrega campos calculados)
export function sheetProductToProduct(
  sheetProduct: SheetProduct,
  index: number
): Product {
  const stockTotal = sheetProduct.stock_full + (sheetProduct.stock_flex || 0);
  const margin = sheetProduct.price - sheetProduct.cost;
  const marginPercent = sheetProduct.price > 0 ? (margin / sheetProduct.price) * 100 : 0;
  const roi = sheetProduct.cost > 0 ? (margin / sheetProduct.cost) * 100 : 0;

  // Generar sales simuladas basadas en stock (para demo)
  const sales30d = Math.floor(Math.random() * (stockTotal * 0.3));
  const sales60d = sales30d + Math.floor(Math.random() * sales30d * 0.5);
  const salesAmount30d = sales30d * sheetProduct.price;

  // Días de stock
  const daysOfStock = sales30d > 0 ? Math.floor((stockTotal / sales30d) * 30) : 999;

  return {
    id: `sync-${index + 1}`,
    sku: sheetProduct.sku,
    title: sheetProduct.title,
    price: sheetProduct.price,
    cost: sheetProduct.cost,
    stock_full: sheetProduct.stock_full,
    stock_flex: sheetProduct.stock_flex || 0,
    stock_total: stockTotal,
    sales_30d: sales30d,
    sales_60d: sales60d,
    sales_amount_30d: salesAmount30d,
    margin,
    margin_percent: marginPercent,
    roi,
    days_of_stock: daysOfStock,
    supplier_id: `sup-${sheetProduct.supplier_name.toLowerCase().replace(/\s+/g, "-")}`,
    supplier_name: sheetProduct.supplier_name,
    logistic_type: sheetProduct.stock_flex && sheetProduct.stock_flex > 0 ? "flex" : "fulfillment",
    status: "active",
    category: sheetProduct.category,
    thumbnail: `https://placehold.co/100x100/1a1a2e/7c3aed?text=${encodeURIComponent(sheetProduct.sku)}`,
    permalink: "#",
  };
}

// Transforma SheetSupplier a Supplier (agrega campos calculados)
export function sheetSupplierToSupplier(
  sheetSupplier: SheetSupplier,
  products: Product[]
): Supplier {
  const supplierProducts = products.filter(
    (p) => p.supplier_name === sheetSupplier.name
  );

  const totalProducts = supplierProducts.length;
  const totalStock = supplierProducts.reduce((sum, p) => sum + p.stock_total, 0);
  const totalValuation = supplierProducts.reduce(
    (sum, p) => sum + p.stock_total * p.cost,
    0
  );
  const totalSales30d = supplierProducts.reduce(
    (sum, p) => sum + p.sales_amount_30d,
    0
  );
  const avgMargin =
    supplierProducts.length > 0
      ? supplierProducts.reduce((sum, p) => sum + p.margin_percent, 0) /
        supplierProducts.length
      : 0;

  return {
    id: sheetSupplier.id,
    name: sheetSupplier.name,
    contact_name: sheetSupplier.contact_name || "",
    email: sheetSupplier.email || "",
    phone: "",
    total_products: totalProducts,
    total_stock: totalStock,
    total_valuation: totalValuation,
    total_sales_30d: totalSales30d,
    avg_margin: avgMargin,
  };
}

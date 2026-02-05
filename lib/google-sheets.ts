// Funciones para fetch y parse de Google Sheets públicos

import type { SheetProduct, SheetSupplier, ValidationError } from "@/types";

// Extrae el ID del Sheet desde una URL de Google Sheets
export function extractSheetId(url: string): string | null {
  // Formatos soportados:
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  // https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Fetch datos de un Google Sheet público usando el endpoint gviz
export async function fetchGoogleSheet(
  sheetId: string,
  gid: number = 0
): Promise<{ data: Record<string, unknown>[]; error?: string }> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          data: [],
          error: "Sheet no encontrado. Verificá que la URL sea correcta.",
        };
      }
      return {
        data: [],
        error: `Error al cargar el Sheet (${response.status})`,
      };
    }

    const text = await response.text();

    // El response viene envuelto en google.visualization.Query.setResponse(...)
    // Extraemos el JSON
    const jsonMatch = text.match(
      /google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/
    );
    if (!jsonMatch) {
      return {
        data: [],
        error:
          "El Sheet no es público. Publicalo en Archivo > Compartir > Publicar en la web",
      };
    }

    const json = JSON.parse(jsonMatch[1]);
    return { data: parseGoogleSheetJson(json) };
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return {
      data: [],
      error: "Error de conexión. Verificá tu conexión a internet.",
    };
  }
}

// Parsea el formato gviz a un array de objetos
function parseGoogleSheetJson(json: {
  table?: {
    cols?: { label?: string }[];
    rows?: { c?: { v?: unknown }[] }[];
  };
}): Record<string, unknown>[] {
  if (!json.table || !json.table.cols || !json.table.rows) {
    return [];
  }

  const { cols, rows } = json.table;

  // Obtener headers desde los labels de las columnas
  const headers = cols.map((col, index) => {
    const label = col.label?.toLowerCase().trim();
    return label || `col_${index}`;
  });

  // Convertir filas a objetos
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    row.c?.forEach((cell, index) => {
      const header = headers[index];
      if (header) {
        obj[header] = cell?.v ?? null;
      }
    });
    return obj;
  });
}

// Valida y transforma filas de productos
export function validateProductRows(
  rows: Record<string, unknown>[]
): { products: SheetProduct[]; errors: ValidationError[] } {
  const products: SheetProduct[] = [];
  const errors: ValidationError[] = [];

  const requiredColumns = [
    "sku",
    "title",
    "price",
    "cost",
    "stock_full",
    "category",
    "supplier_name",
  ];

  // Verificar columnas requeridas en la primera fila
  if (rows.length > 0) {
    const firstRow = rows[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        column: missingColumns.join(", "),
        message: `Faltan columnas requeridas: ${missingColumns.join(", ")}`,
      });
      return { products, errors };
    }
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 porque fila 1 es header

    // Validar campos requeridos
    if (!row.sku || String(row.sku).trim() === "") {
      errors.push({ row: rowNum, column: "sku", message: "SKU es requerido" });
      return;
    }

    if (!row.title || String(row.title).trim() === "") {
      errors.push({
        row: rowNum,
        column: "title",
        message: "Título es requerido",
      });
      return;
    }

    const price = Number(row.price);
    if (isNaN(price) || price < 0) {
      errors.push({
        row: rowNum,
        column: "price",
        message: "Price debe ser un número >= 0",
      });
      return;
    }

    const cost = Number(row.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push({
        row: rowNum,
        column: "cost",
        message: "Cost debe ser un número >= 0",
      });
      return;
    }

    const stockFull = Number(row.stock_full);
    if (isNaN(stockFull) || stockFull < 0) {
      errors.push({
        row: rowNum,
        column: "stock_full",
        message: "stock_full debe ser un número >= 0",
      });
      return;
    }

    const stockFlex = row.stock_flex ? Number(row.stock_flex) : 0;

    if (!row.category || String(row.category).trim() === "") {
      errors.push({
        row: rowNum,
        column: "category",
        message: "Categoría es requerida",
      });
      return;
    }

    if (!row.supplier_name || String(row.supplier_name).trim() === "") {
      errors.push({
        row: rowNum,
        column: "supplier_name",
        message: "Proveedor es requerido",
      });
      return;
    }

    // Todo válido, agregar producto
    products.push({
      sku: String(row.sku).trim(),
      title: String(row.title).trim(),
      price,
      cost,
      stock_full: stockFull,
      stock_flex: stockFlex,
      category: String(row.category).trim(),
      supplier_name: String(row.supplier_name).trim(),
    });
  });

  return { products, errors };
}

// Valida y transforma filas de proveedores
export function validateSupplierRows(
  rows: Record<string, unknown>[]
): { suppliers: SheetSupplier[]; errors: ValidationError[] } {
  const suppliers: SheetSupplier[] = [];
  const errors: ValidationError[] = [];

  const requiredColumns = ["id", "name"];

  // Verificar columnas requeridas
  if (rows.length > 0) {
    const firstRow = rows[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        column: missingColumns.join(", "),
        message: `Faltan columnas requeridas: ${missingColumns.join(", ")}`,
      });
      return { suppliers, errors };
    }
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row.id || String(row.id).trim() === "") {
      errors.push({ row: rowNum, column: "id", message: "ID es requerido" });
      return;
    }

    if (!row.name || String(row.name).trim() === "") {
      errors.push({
        row: rowNum,
        column: "name",
        message: "Nombre es requerido",
      });
      return;
    }

    suppliers.push({
      id: String(row.id).trim(),
      name: String(row.name).trim(),
      contact_name: row.contact_name
        ? String(row.contact_name).trim()
        : undefined,
      email: row.email ? String(row.email).trim() : undefined,
    });
  });

  return { suppliers, errors };
}

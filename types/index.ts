// Tipos principales del Demo ERP

export interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  cost: number;
  stock_full: number;
  stock_flex: number;
  stock_total: number;
  sales_30d: number;
  sales_60d: number;
  sales_amount_30d: number;
  margin: number;
  margin_percent: number;
  roi: number;
  days_of_stock: number;
  supplier_id: string;
  supplier_name: string;
  logistic_type: LogisticType;
  status: ProductStatus;
  category: string;
  thumbnail: string;
  permalink: string;
}

export type LogisticType = "fulfillment" | "flex" | "xd_drop_off";
export type ProductStatus = "active" | "paused" | "closed";

export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  total_products: number;
  total_stock: number;
  total_valuation: number;
  total_sales_30d: number;
  avg_margin: number;
}

export interface Order {
  id: string;
  ml_order_id: number;
  status: OrderStatus;
  buyer_nickname: string;
  total_amount: number;
  items: OrderItem[];
  logistic_type: LogisticType;
  date_created: string;
}

export type OrderStatus = "paid" | "cancelled" | "pending" | "shipped" | "delivered";

export interface OrderItem {
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface Alert {
  id: string;
  product_id: string;
  product_title?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  notified: boolean;
  resolved: boolean;
  created_at: string;
}

export type AlertType = "low_stock" | "out_of_stock" | "negative_margin" | "slow_rotation" | "price_change";
export type AlertSeverity = "critical" | "warning" | "info";

// KPIs
export interface DashboardKPIs {
  totalProducts: number;
  totalStock: number;
  stockValuation: number;
  sales30d: number;
  orders30d: number;
  avgTicket: number;
  avgMargin: number;
  criticalProducts: number;
  alertsCount: number;
}

// ABC Classification
export type ABCClass = "A" | "B" | "C";

// Pareto Analysis
export interface ParetoItem {
  product: Product;
  salesAmount: number;
  salesPercent: number;
  cumulativePercent: number;
  abcClass: ABCClass;
}

// Sales by Channel
export interface SalesByChannel {
  channel: LogisticType;
  label: string;
  sales: number;
  orders: number;
  percent: number;
}

// Sales Trend
export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

// Stock Distribution
export interface StockDistribution {
  status: string;
  count: number;
  percent: number;
}

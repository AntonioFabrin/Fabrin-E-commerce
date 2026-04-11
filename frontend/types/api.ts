// ── Produto ────────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  seller_id: number;
  category_id?: number;
}

export interface ReviewStat {
  product_id: number;
  total: number;
  average: number;
}

// ── Pedido ─────────────────────────────────────────────────────────────────────
export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  external_reference: string;
  created_at: string;
  items: OrderItem[];
  payment_method: string | null;
  payment_status: string | null;
  buyer_name?: string;
  buyer_email?: string;
}

// ── Vendedor ───────────────────────────────────────────────────────────────────
export interface SellerProfile {
  id: number;
  name: string;
  member_since: string;
}

export interface SellerStats {
  total_products: number;
  total_reviews: number;
  avg_rating: number;
  total_sales: number;
}

// ── Analytics ──────────────────────────────────────────────────────────────────
export interface Kpis {
  revenue_total: number;
  orders_paid: number;
  revenue_month: number;
  orders_month: number;
  orders_pending: number;
  avg_ticket: number;
}

export interface MonthData    { month: string; label: string; revenue: number; orders: number; }
export interface TopProduct   { name: string; units_sold: number; revenue: number; }
export interface StatusData   { status: string; count: number; }
export interface RatingData   { rating: number; count: number; }

export interface Analytics {
  kpis: Kpis;
  revenue_by_month: MonthData[];
  top_products: TopProduct[];
  orders_by_status: StatusData[];
  rating_distribution: RatingData[];
}

// ── Review ─────────────────────────────────────────────────────────────────────
export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  buyer_name: string;
  product_name: string;
  product_id: number;
}

// Enums
export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SHIPPED = "SHIPPED",
  CANCELLED = "CANCELLED",
}

export type Item = {
  Product: Product[];
  children: Item[];
  id: number;
  imageUrl: string;
  name: string;
  parentId: number;
};

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export interface User {
  id: number;
  name: string | null;
  email: string;
  phoneNumber?: string | null;
  role: "CUSTOMER" | "ADMIN";
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  orders: any[];
  ShippingAddress: any[];
  Review: any[];
  cart: any | null;
}
export interface Product {
  quantity: number;
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  categoryId: number;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
  OrderItem: OrderItem[];
  CartItem: CartItem[];
  ProductPerformance: ProductPerformance[];
  Review: Review[];
  Size: ColorSize[];
  Color: ColorSize[];
  variants: Variants[];
  selectedColor: string | number | null;
  selectedSize: string | number | null;
  VariantStock: number | null;
}
export interface ColorSize {
  name: string;
  id: number;
}

export interface Variants {
  id: number;
  productId: number;
  colorId: number;
  sizeId: number;
  stock: number;
}

export interface ProductImage {
  id: number;
  url: string;
  productId: number;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  parent?: Category;
  children: Category[];
  products: Product[];
}

export interface OrderItem {
  address: ReactNode;
  selectedColor: ReactNode;
  selectedSize: ReactNode;
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
  order: Order;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  cartItems: CartItem[];
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
  cart: Cart;
}

export interface Order {
  shippingAddressId: number;
  id: number;
  orderNumber: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  items: OrderItem[];
  payment?: Payment | null;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
}

export interface ShippingAddress {
  id: number;
  name: string;
  userId: number;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface ProductPerformance {
  id: number;
  productId: number;
  totalSold: number;
  revenue: number;
  product: Product;
  createdAt: Date;
  updatedAt: Date;
}

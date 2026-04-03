/** API entity shapes (aligned with backend formatters) */

export type ApiProduct = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  brand?: string;
  stock?: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  createdAt?: string;
};

export type ProductsListResponse = {
  products: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export type ApiNFT = {
  _id: string;
  name: string;
  description?: string;
  image: string;
  imageGallery?: string[];
  price: number;
  collection: string;
  rarity?: string;
  contractAddress?: string;
  tokenId?: string;
  creator?: string;
  owner?: string;
  attributes?: { trait: string; value: string }[];
  rating?: number;
  numReviews?: number;
  views?: number;
  createdAt?: string;
};

export type ApiFreelancerService = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  deliveryTime?: string;
  rating?: number;
  numReviews?: number;
  freelancerName?: string;
  freelancerImage?: string;
  skills?: string[];
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type OrderTrackResponse = {
  orderNumber: string;
  email: string;
  currentStatus: { code: string; label: string; description?: string; enteredAt?: string };
  statusHistory: Array<{ code: string; label: string; description?: string; enteredAt?: string }>;
  statusFlow: Array<{ code: string; label: string; description?: string }>;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
  paymentMethod?: string | null;
  subtotal?: number;
  shippingCost?: number;
  total: number;
  currency?: string;
  items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string }>;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FreelancerContactPayload = {
  serviceId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  budget?: number | null;
  timeline?: string;
};

export type ApiErrorBody = {
  message?: string;
  error?: string;
  code?: string;
  errors?: unknown[];
};

import type {
  ApiFreelancerService,
  ApiNFT,
  ApiProduct,
  AuthUser,
  FreelancerContactPayload,
  LoginResponse,
  OrderTrackResponse,
  ProductsListResponse,
} from './types';

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

function normalizeApiBase(rawBase: string | undefined) {
  if (!rawBase) return '/api';
  if (!/^https?:\/\//i.test(rawBase)) {
    return rawBase.replace(/\/$/, '') || '/api';
  }

  try {
    const url = new URL(rawBase);
    const pathname = url.pathname.replace(/\/+$/, '');
    if (!pathname) {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawBase.replace(/\/$/, '');
  }
}

const API_BASE = normalizeApiBase(rawApiBase);

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  } catch {
    /* ignore */
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isUnexpectedTextResponse(body: unknown) {
  return typeof body === 'string' && body.trim().length > 0;
}

function describeUnexpectedResponse(res: Response, body: string) {
  const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.includes('text/html') || /^\s*</.test(body)) {
    return 'HTML';
  }
  return contentType || 'text';
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  // Prefer the server-managed cookie session; bearer auth stays available for explicit callers.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestUrl = `${API_BASE}${path}`;

  const res = await fetch(requestUrl, {
    ...init,
    headers,
    credentials: 'include',
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      (body && typeof body === 'object' && 'message' in body && String((body as { message?: string }).message)) ||
      (body && typeof body === 'object' && 'error' in body && String((body as { error?: string }).error)) ||
      res.statusText;
    throw new ApiError(msg || 'Request failed', res.status, body);
  }

  if (isUnexpectedTextResponse(body)) {
    throw new ApiError(
      `Expected JSON from ${requestUrl} but received ${describeUnexpectedResponse(
        res,
        body,
      )}. Check VITE_API_BASE_URL and Vercel /api routing.`,
      res.status,
      body,
    );
  }

  return body as T;
}

/** --- Products --- */

export type ProductListQuery = Record<string, string | number | undefined>;

export function fetchProducts(query?: ProductListQuery): Promise<ProductsListResponse> {
  const qs = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
  }
  const q = qs.toString();
  return apiFetch<ProductsListResponse>(`/products${q ? `?${q}` : ''}`);
}

export function fetchProductById(id: string): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/products/${encodeURIComponent(id)}`);
}

export function fetchProductCategories(): Promise<{ categories: string[] }> {
  return apiFetch<{ categories: string[] }>('/products/categories');
}

export function fetchSimilarProducts(id: string): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(`/products/${encodeURIComponent(id)}/similar`);
}

export function fetchProductsByCategory(category: string): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(`/products/category/${encodeURIComponent(category)}`);
}

/** --- NFTs --- */

export type NFTListQuery = { collection?: string; rarity?: string; sort?: string };

export function fetchNFTs(query?: NFTListQuery): Promise<ApiNFT[]> {
  const qs = new URLSearchParams();
  if (query?.collection) qs.set('collection', query.collection);
  if (query?.rarity) qs.set('rarity', query.rarity);
  if (query?.sort) qs.set('sort', query.sort);
  const q = qs.toString();
  return apiFetch<ApiNFT[]>(`/nfts${q ? `?${q}` : ''}`);
}

export function fetchNFTById(id: string): Promise<ApiNFT> {
  return apiFetch<ApiNFT>(`/nfts/${encodeURIComponent(id)}`);
}

export function fetchSimilarNFTs(id: string): Promise<ApiNFT[]> {
  return apiFetch<ApiNFT[]>(`/nfts/${encodeURIComponent(id)}/similar`);
}

/** --- Freelancer services --- */

export function fetchFreelancerServices(): Promise<ApiFreelancerService[]> {
  return apiFetch<ApiFreelancerService[]>('/freelancer-services');
}

export function fetchFreelancerServiceById(id: string): Promise<ApiFreelancerService> {
  return apiFetch<ApiFreelancerService>(`/freelancer-services/${encodeURIComponent(id)}`);
}

export function fetchServicesByCategory(category: string): Promise<ApiFreelancerService[]> {
  return apiFetch<ApiFreelancerService[]>(
    `/freelancer-services/category/${encodeURIComponent(category)}`,
  );
}

/** --- Search --- */

export function searchProducts(q: string): Promise<ApiProduct[]> {
  const qs = new URLSearchParams();
  qs.set('q', q);
  return apiFetch<ApiProduct[]>(`/search?${qs.toString()}`);
}

/** --- Auth --- */

export async function registerUser(body: {
  email: string;
  password: string;
  name?: string;
}): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
}

export async function loginUser(body: { email: string; password: string }): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
}

export async function fetchMe(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>('/auth/me');
}

/** --- Checkout --- */

export type CreatePaymentIntentBody = {
  items: Array<{ productId?: string; id?: string; quantity: number }>;
  name: string;
  email: string;
  shippingAddress: string;
};

export type CreatePaymentIntentResponse = {
  clientSecret: string;
  orderNumber: string;
  estimatedDelivery: string;
  statusHistory: unknown[];
  statusFlow: unknown[];
  items: unknown[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
};

export function createPaymentIntent(
  body: CreatePaymentIntentBody,
  token?: string | null,
): Promise<CreatePaymentIntentResponse> {
  return apiFetch<CreatePaymentIntentResponse>('/checkout/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export type CreateCryptoOrderBody = {
  items: Array<{ productId?: string; id?: string; quantity: number }>;
  name: string;
  email: string;
  shippingAddress: string;
  paymentMethod: 'crypto';
  cryptoCurrency: string;
  cryptoAmount: number;
  walletAddress: string;
};

export type CreateOrderResponse = {
  message?: string;
  orderNumber: string;
  estimatedDelivery: string;
  statusHistory: unknown[];
  statusFlow: unknown[];
  items: unknown[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed';
};

export function createCryptoOrder(
  body: CreateCryptoOrderBody,
  token?: string | null,
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/checkout/create-order', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

/** --- Orders --- */

export function trackOrder(body: { orderNumber: string; email: string }): Promise<OrderTrackResponse> {
  return apiFetch<OrderTrackResponse>('/orders/track', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
}

/** --- Freelancer contact --- */

export function submitFreelancerContact(
  payload: FreelancerContactPayload,
  token?: string | null,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/freelancer-contact', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function fetchFreelancerContactById(
  id: string,
  token?: string | null,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/freelancer-contact/${encodeURIComponent(id)}`, { token });
}

export type ContactListItem = {
  _id: string;
  serviceId: string;
  freelancerName?: string;
  serviceName?: string;
  senderName?: string;
  senderEmail?: string;
  subject?: string;
  status?: string;
  createdAt?: string;
};

/** Listed after backend adds GET /api/freelancer-contact/mine */
export function fetchMyFreelancerContacts(token?: string | null): Promise<ContactListItem[]> {
  return apiFetch<ContactListItem[]>('/freelancer-contact/mine', { token });
}

/** --- MetaMask helper API --- */

export function fetchMetaMaskTransactions(address: string): Promise<
  Array<{ hash: string; from: string; to: string; amount: string; status: string; timestamp?: string }>
> {
  return apiFetch(`/metamask/transactions/${encodeURIComponent(address)}`, { token: null });
}

export function fetchMetaMaskBalance(address: string): Promise<{ balance: string; currency: string }> {
  return apiFetch(`/metamask/balance/${encodeURIComponent(address)}`, { token: null });
}

export function verifyMetaMaskSignature(body: {
  message: string;
  signature: string;
  address: string;
}): Promise<{ verified: boolean }> {
  return apiFetch('/metamask/verify-signature', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
}

/** --- Product rating --- */

export function submitProductRating(
  productId: string,
  rating: number,
  token?: string | null,
): Promise<unknown> {
  return apiFetch(`/products/${encodeURIComponent(productId)}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ rating }),
    token,
  });
}

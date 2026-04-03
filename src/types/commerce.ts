import type { ApiFreelancerService, ApiNFT, ApiProduct } from '@/services/types';
import { resolvePublicAssetUrl } from '@/lib/publicAssetUrl';

/** Product shape stored in cart and shown on cards */
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  inStock: boolean;
  brand: string;
  description?: string;
};

export function apiProductToCartProduct(p: ApiProduct): CartProduct {
  const stock = typeof p.stock === 'number' ? p.stock : 0;
  return {
    id: p.id || p._id,
    name: p.name,
    price: p.price,
    category: p.category,
    rating: typeof p.rating === 'number' ? p.rating : 0,
    image: resolvePublicAssetUrl(p.image),
    inStock: stock > 0,
    brand: p.brand || 'Brand',
    description: p.description,
  };
}

/** NFT display model for gallery cards */
export type NFTCardModel = {
  id: string;
  title: string;
  image: string;
  collection: string;
  artist: string;
  priceEth: number;
  priceUsd: number;
};

const ETH_USD_ESTIMATE = 3500;

export function apiNFTToCardModel(n: ApiNFT): NFTCardModel {
  const eth = typeof n.price === 'number' ? n.price : 0;
  return {
    id: String(n._id),
    title: n.name,
    image: resolvePublicAssetUrl(n.image),
    collection: n.collection || 'Collection',
    artist: n.creator || 'Artist',
    priceEth: eth,
    priceUsd: Math.round(eth * ETH_USD_ESTIMATE),
  };
}

/** Service display model for listing cards */
export type ServiceCardModel = {
  id: string;
  title: string;
  freelancer: string;
  category: string;
  image: string;
  rating: number;
  deliveryLabel: string;
  price: number;
  avatar: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function apiServiceToCardModel(s: ApiFreelancerService): ServiceCardModel {
  const fname = s.freelancerName || 'Freelancer';
  return {
    id: String(s._id),
    title: s.name,
    freelancer: fname,
    category: s.category,
    image: resolvePublicAssetUrl(s.image),
    rating: typeof s.rating === 'number' ? s.rating : 0,
    deliveryLabel: s.deliveryTime || '—',
    price: s.price,
    avatar: initials(fname),
  };
}

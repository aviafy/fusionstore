export const queryKeys = {
  products: (q?: Record<string, string | number | undefined>) => ['products', q] as const,
  product: (id: string) => ['product', id] as const,
  productSimilar: (id: string) => ['productSimilar', id] as const,
  categories: () => ['productCategories'] as const,
  nfts: (q?: { collection?: string; rarity?: string; sort?: string }) => ['nfts', q] as const,
  nft: (id: string) => ['nft', id] as const,
  nftSimilar: (id: string) => ['nftSimilar', id] as const,
  services: () => ['freelancerServices'] as const,
  service: (id: string) => ['freelancerService', id] as const,
  search: (q: string) => ['search', q] as const,
  myContacts: () => ['freelancerContacts', 'mine'] as const,
};

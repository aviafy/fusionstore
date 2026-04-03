import { useQuery } from '@tanstack/react-query';
import {
  fetchProductById,
  fetchProductCategories,
  fetchProducts,
  fetchSimilarProducts,
  type ProductListQuery,
} from '@/services/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useProductsList(query?: ProductListQuery) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => fetchProducts(query),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id || ''),
    queryFn: () => fetchProductById(id!),
    enabled: Boolean(id),
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: fetchProductCategories,
  });
}

export function useSimilarProducts(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.productSimilar(id || ''),
    queryFn: () => fetchSimilarProducts(id!),
    enabled: Boolean(id),
  });
}

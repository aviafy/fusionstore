import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/services/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useSearchProducts(q: string, enabled = true) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: () => searchProducts(trimmed),
    enabled: enabled && trimmed.length > 0,
  });
}

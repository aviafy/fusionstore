import { useQuery } from '@tanstack/react-query';
import { fetchFreelancerServiceById, fetchFreelancerServices } from '@/services/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useFreelancerServicesList() {
  return useQuery({
    queryKey: queryKeys.services(),
    queryFn: fetchFreelancerServices,
  });
}

export function useFreelancerService(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.service(id || ''),
    queryFn: () => fetchFreelancerServiceById(id!),
    enabled: Boolean(id),
  });
}

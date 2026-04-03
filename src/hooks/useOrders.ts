import { useMutation } from '@tanstack/react-query';
import { trackOrder } from '@/services/apiClient';

export function useTrackOrderMutation() {
  return useMutation({
    mutationFn: (body: { orderNumber: string; email: string }) => trackOrder(body),
  });
}

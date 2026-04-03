import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyFreelancerContacts, submitFreelancerContact } from '@/services/apiClient';
import type { FreelancerContactPayload } from '@/services/types';
import { queryKeys } from '@/lib/queryKeys';

export function useMyFreelancerContacts() {
  return useQuery({
    queryKey: queryKeys.myContacts(),
    queryFn: () => fetchMyFreelancerContacts(),
  });
}

export function useSubmitFreelancerContactMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FreelancerContactPayload) => submitFreelancerContact(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myContacts() });
    },
  });
}

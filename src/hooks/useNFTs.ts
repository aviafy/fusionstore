import { useQuery } from '@tanstack/react-query';
import { fetchNFTById, fetchNFTs, fetchSimilarNFTs, type NFTListQuery } from '@/services/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useNFTsList(query?: NFTListQuery) {
  return useQuery({
    queryKey: queryKeys.nfts(query),
    queryFn: () => fetchNFTs(query),
  });
}

export function useNFT(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.nft(id || ''),
    queryFn: () => fetchNFTById(id!),
    enabled: Boolean(id),
  });
}

export function useSimilarNFTs(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.nftSimilar(id || ''),
    queryFn: () => fetchSimilarNFTs(id!),
    enabled: Boolean(id),
  });
}

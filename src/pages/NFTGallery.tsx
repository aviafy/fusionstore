import { Link } from "react-router-dom";
import { NFTCard } from "@/components/NFTCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wallet } from "lucide-react";
import { useNFTsList } from "@/hooks/useNFTs";
import { apiNFTToCardModel } from "@/types/commerce";
import { Skeleton } from "@/components/ui/skeleton";

export default function NFTGallery() {
  const { data: nfts = [], isLoading, isError, error } = useNFTsList();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="nft-section flex-1">
        <div className="section-padding py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-nft-text">NFT Gallery</h1>
              <p className="text-sm text-nft-muted mt-1">
                Curated digital collectibles from top artists
              </p>
            </div>
            <Link
              to="/metamask"
              className="inline-flex items-center gap-2 rounded-lg border border-nft-border px-5 py-2.5 text-sm font-medium text-nft-text transition-colors hover:bg-nft-card"
            >
              <Wallet className="h-4 w-4" />
              Wallet &amp; MetaMask
            </Link>
          </div>
          {isError && (
            <p className="text-sm text-destructive mb-4">
              {(error as Error)?.message || "Could not load NFTs."}
            </p>
          )}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl bg-nft-card" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft) => (
                <NFTCard key={String(nft._id)} nft={apiNFTToCardModel(nft)} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

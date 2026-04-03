import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNFT, useSimilarNFTs } from "@/hooks/useNFTs";
import { NFTCard } from "@/components/NFTCard";
import { apiNFTToCardModel } from "@/types/commerce";
import { resolvePublicAssetUrl } from "@/lib/publicAssetUrl";
import { Skeleton } from "@/components/ui/skeleton";

export default function NFTDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: nft, isLoading, isError, error } = useNFT(id);
  const { data: similar = [] } = useSimilarNFTs(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="nft-section flex-1 section-padding py-12">
          <Skeleton className="h-96 max-w-4xl mx-auto rounded-xl bg-nft-card" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !nft) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="nft-section flex-1 section-padding py-20 text-center">
          <p className="text-destructive mb-4">{(error as Error)?.message || "NFT not found"}</p>
          <Button asChild variant="outline" className="border-nft-border text-nft-text">
            <Link to="/nft">Back to gallery</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const eth = typeof nft.price === "number" ? nft.price : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="nft-section flex-1 section-padding py-10">
        <Link
          to="/nft"
          className="inline-flex items-center gap-2 text-sm text-nft-muted hover:text-nft-text mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="rounded-xl border border-nft-border overflow-hidden nft-card">
            <img src={resolvePublicAssetUrl(nft.image)} alt={nft.name} className="w-full aspect-square object-cover" />
          </div>
          <div>
            <p className="text-xs text-nft-muted uppercase tracking-wider mb-2">{nft.collection}</p>
            <h1 className="font-display text-3xl font-bold text-nft-text mb-4">{nft.name}</h1>
            {nft.rarity && (
              <Badge className="mb-4 bg-nft-card text-nft-text border-nft-border">{nft.rarity}</Badge>
            )}
            <p className="font-display text-3xl font-bold text-nft-text mb-2">{eth} ETH</p>
            <p className="text-sm text-nft-muted mb-6">by {nft.creator || "Unknown"}</p>
            <p className="text-nft-muted leading-relaxed mb-8">{nft.description}</p>
            {nft.attributes && nft.attributes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-sm font-semibold text-nft-text mb-3">Attributes</h3>
                <ul className="space-y-2 text-sm text-nft-muted">
                  {nft.attributes.map((a, i) => (
                    <li key={i}>
                      <span className="text-nft-text">{a.trait}:</span> {a.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-xs text-nft-muted space-y-1">
              {nft.contractAddress && <p>Contract: {nft.contractAddress}</p>}
              {nft.tokenId && <p>Token ID: {nft.tokenId}</p>}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-20 max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-nft-text mb-8">More from collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar
                .filter((n) => String(n._id) !== String(nft._id))
                .slice(0, 3)
                .map((n) => (
                  <NFTCard key={String(n._id)} nft={apiNFTToCardModel(n)} />
                ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

import { Link } from "react-router-dom";
import type { NFTCardModel } from "@/types/commerce";

interface NFTCardProps {
  nft: NFTCardModel;
}

export function NFTCard({ nft }: NFTCardProps) {
  return (
    <div className="group nft-card rounded-xl border overflow-hidden transition-all duration-300 hover:border-nft-muted">
      <Link to={`/nft/${nft.id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={nft.image}
            alt={nft.title}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs text-nft-muted uppercase tracking-wider mb-1">
          {nft.collection}
        </p>
        <Link to={`/nft/${nft.id}`}>
          <h3 className="font-display font-semibold text-sm text-nft-text mb-1 hover:underline">
            {nft.title}
          </h3>
        </Link>
        <p className="text-xs text-nft-muted mb-4">by {nft.artist}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold text-nft-text">
              {nft.priceEth} ETH
            </p>
            <p className="text-xs text-nft-muted">
              ≈ ${nft.priceUsd.toLocaleString()}
            </p>
          </div>
          <Link
            to={`/nft/${nft.id}`}
            className="rounded-lg border border-nft-border px-4 py-2 text-xs font-medium text-nft-text transition-colors hover:bg-nft-border"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

import nft1 from "@/assets/nft/nft1.jpg";
import nft2 from "@/assets/nft/nft2.jpg";
import nft3 from "@/assets/nft/nft3.jpg";

export interface NFT {
  id: string;
  title: string;
  artist: string;
  priceEth: number;
  priceUsd: number;
  image: string;
  collection: string;
}

export const nfts: NFT[] = [
  { id: "n1", title: "Neon Genesis #042", artist: "CryptoArtist", priceEth: 0.85, priceUsd: 2720, image: nft1, collection: "Neon Genesis" },
  { id: "n2", title: "Golden Flow #007", artist: "DigitalMuse", priceEth: 1.2, priceUsd: 3840, image: nft2, collection: "Liquid Gold" },
  { id: "n3", title: "Crystal Prism #019", artist: "VoxelKing", priceEth: 2.5, priceUsd: 8000, image: nft3, collection: "Prismatic" },
  { id: "n4", title: "Neon Genesis #108", artist: "CryptoArtist", priceEth: 0.65, priceUsd: 2080, image: nft1, collection: "Neon Genesis" },
  { id: "n5", title: "Golden Flow #023", artist: "DigitalMuse", priceEth: 0.95, priceUsd: 3040, image: nft2, collection: "Liquid Gold" },
  { id: "n6", title: "Crystal Prism #055", artist: "VoxelKing", priceEth: 1.8, priceUsd: 5760, image: nft3, collection: "Prismatic" },
];

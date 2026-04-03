import electronicsImg from "@/assets/services/electronics.jpg";
import embeddedImg from "@/assets/services/embedded.jpg";
import blockchainImg from "@/assets/services/blockchain.jpg";

export interface FreelancerService {
  id: string;
  title: string;
  freelancer: string;
  category: string;
  price: number;
  deliveryDays: number;
  rating: number;
  image: string;
  avatar: string;
}

export const serviceCategories = [
  "Electronics Design",
  "PCB Layout",
  "Embedded Programming",
  "NFT Art",
  "Smart Contracts",
];

export const services: FreelancerService[] = [
  { id: "s1", title: "Custom PCB Design & Layout", freelancer: "Alex Chen", category: "PCB Layout", price: 250, deliveryDays: 7, rating: 4.9, image: electronicsImg, avatar: "AC" },
  { id: "s2", title: "ESP32 Firmware Development", freelancer: "Maria Santos", category: "Embedded Programming", price: 400, deliveryDays: 14, rating: 4.8, image: embeddedImg, avatar: "MS" },
  { id: "s3", title: "Solidity Smart Contract Audit", freelancer: "James Wu", category: "Smart Contracts", price: 800, deliveryDays: 5, rating: 5.0, image: blockchainImg, avatar: "JW" },
  { id: "s4", title: "Schematic & Circuit Design", freelancer: "Nina Patel", category: "Electronics Design", price: 350, deliveryDays: 10, rating: 4.7, image: electronicsImg, avatar: "NP" },
  { id: "s5", title: "Generative NFT Collection", freelancer: "Leo Kim", category: "NFT Art", price: 1200, deliveryDays: 21, rating: 4.6, image: blockchainImg, avatar: "LK" },
  { id: "s6", title: "STM32 Driver Development", freelancer: "Omar Hassan", category: "Embedded Programming", price: 500, deliveryDays: 12, rating: 4.8, image: embeddedImg, avatar: "OH" },
];

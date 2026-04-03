import smartphonesImg from "@/assets/products/smartphones.jpg";
import laptopsImg from "@/assets/products/laptops.jpg";
import headphonesImg from "@/assets/products/headphones.jpg";
import camerasImg from "@/assets/products/cameras.jpg";
import tvsImg from "@/assets/products/tvs.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  inStock: boolean;
  brand: string;
  description: string;
}

export const categories = [
  { name: "Smartphones", slug: "smartphones", image: smartphonesImg },
  { name: "Laptops", slug: "laptops", image: laptopsImg },
  { name: "Headphones", slug: "headphones", image: headphonesImg },
  { name: "Cameras", slug: "cameras", image: camerasImg },
  { name: "TVs & Displays", slug: "tvs", image: tvsImg },
];

export const products: Product[] = [
  { id: "1", name: "ProPhone 15 Ultra", price: 1199, category: "smartphones", rating: 4.8, image: smartphonesImg, inStock: true, brand: "ProTech", description: "The latest flagship smartphone with advanced AI capabilities." },
  { id: "2", name: "AirWave Pro Headphones", price: 349, category: "headphones", rating: 4.7, image: headphonesImg, inStock: true, brand: "SoundCore", description: "Premium wireless headphones with active noise cancellation." },
  { id: "3", name: "UltraBook X1 Carbon", price: 1899, category: "laptops", rating: 4.9, image: laptopsImg, inStock: true, brand: "TechForge", description: "Ultra-thin laptop with stunning display and all-day battery." },
  { id: "4", name: "Mirrorless Z9 Camera", price: 2499, category: "cameras", rating: 4.6, image: camerasImg, inStock: true, brand: "OptiLens", description: "Professional mirrorless camera with 8K video capability." },
  { id: "5", name: "CrystalView 65\" OLED", price: 1799, category: "tvs", rating: 4.8, image: tvsImg, inStock: false, brand: "VisionMax", description: "Stunning 4K OLED display with Dolby Vision and Atmos." },
  { id: "6", name: "SmartWatch Ultra 3", price: 449, category: "smartphones", rating: 4.5, image: smartphonesImg, inStock: true, brand: "ProTech", description: "Advanced health monitoring and fitness tracking smartwatch." },
  { id: "7", name: "Studio Monitor Pro", price: 599, category: "headphones", rating: 4.4, image: headphonesImg, inStock: true, brand: "SoundCore", description: "Reference-grade studio monitor headphones for professionals." },
  { id: "8", name: "GameBook RTX Pro", price: 2299, category: "laptops", rating: 4.7, image: laptopsImg, inStock: true, brand: "TechForge", description: "High-performance gaming laptop with RTX graphics." },
];

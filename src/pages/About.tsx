import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">About Fusion</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            Fusion is a demo marketplace bringing together curated products, freelance expertise, and digital collectibles
            in one cohesive experience.
          </p>
          <p>
            We focus on fast discovery, transparent pricing, and secure checkout flows—whether you pay with card or
            explore our crypto demo path.
          </p>
          <p>
            This project showcases a modern React frontend with a Node/Express API and MongoDB-backed catalog data.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            By using this demo site you agree it is provided &quot;as is&quot; for evaluation and learning. No
            warranties are made about availability, accuracy of listings, or fitness for a particular purpose.
          </p>
          <p>
            NFT and crypto flows are illustrative. On-chain transfers and wallet security are your responsibility in
            any real deployment.
          </p>
          <p>
            Freelancer engagements facilitated here are demo-only; formal contracts and deliverables are not governed
            by these terms unless you replace this page with legal content for your jurisdiction.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

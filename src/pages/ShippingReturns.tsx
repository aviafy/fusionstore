import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ShippingReturns() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Shipping &amp; Returns</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Shipping.</strong> Standard demo checkout shows estimated delivery
            dates generated at order time. Real carriers, rates, and cutoffs would replace this in production.
          </p>
          <p>
            <strong className="text-foreground">Free shipping.</strong> The cart applies free shipping on orders over
            $99 for the UI preview only.
          </p>
          <p>
            <strong className="text-foreground">Returns.</strong> Return windows and restocking policies are not
            enforced in this demo. Define RMA flows and refund logic before going live.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

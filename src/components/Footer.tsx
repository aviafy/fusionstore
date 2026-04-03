import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Fusion</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your destination for premium tech, expert freelancer services, and digital collectibles.
            </p>
            <Link to="/about" className="text-sm text-foreground font-medium mt-4 inline-block hover:underline">
              About us
            </Link>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All products
                </Link>
              </li>
              <li>
                <Link
                  to="/order-tracking"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Track order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse services
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-history"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact history
                </Link>
              </li>
              <li>
                <Link to="/nft" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  NFT gallery
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ &amp; help
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-returns"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Shipping &amp; returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Fusion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

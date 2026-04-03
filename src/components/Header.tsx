import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User, LogOut } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Shop", path: "/shop" },
  { label: "Services", path: "/services" },
  { label: "NFT Gallery", path: "/nft" },
];

export function Header() {
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchText("");
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  const authReturnTo = `${location.pathname}${location.search}${location.hash}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="section-padding flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          Fusion
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                location.pathname === link.path ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/order-tracking"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              location.pathname === "/order-tracking" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Track order
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            className="relative hidden sm:flex h-9 w-full justify-start rounded-full bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">Search products...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-7 select-none items-center gap-1 rounded-full border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <button
            type="button"
            className="sm:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
            <CommandInput
              placeholder="Search products, services, or NFTs..."
              value={searchText}
              onValueChange={setSearchText}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchText.trim()) {
                  e.preventDefault();
                  runSearch(e as unknown as React.FormEvent);
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {!searchText.trim() && (
                <CommandGroup heading="Quick Links">
                  <CommandItem onSelect={() => { setSearchOpen(false); navigate('/shop'); }}>
                    Shop
                  </CommandItem>
                  <CommandItem onSelect={() => { setSearchOpen(false); navigate('/services'); }}>
                    Services
                  </CommandItem>
                  <CommandItem onSelect={() => { setSearchOpen(false); navigate('/nft'); }}>
                    NFT Gallery
                  </CommandItem>
                </CommandGroup>
              )}
              {searchText.trim() && (
                <CommandGroup heading="Suggestions">
                  <CommandItem
                    onSelect={() => {
                      runSearch({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search for "{searchText}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </CommandDialog>

          {!loading && user ? (
            <>
              <Link
                to="/contact-history"
                className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
              >
                Messages
              </Link>
              <span className="hidden lg:inline text-xs text-muted-foreground max-w-[120px] truncate">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1" onClick={() => void logout()}>
                <LogOut className="h-4 w-4" />
                Out
              </Button>
            </>
          ) : !loading ? (
            <Link
              to="/login"
              state={{ from: authReturnTo }}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Sign in
            </Link>
          ) : null}

          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="section-padding flex flex-col gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/order-tracking" onClick={() => setMobileOpen(false)} className="text-base font-medium">
                Track order
              </Link>
              <Link to="/metamask" onClick={() => setMobileOpen(false)} className="text-base font-medium">
                Wallet
              </Link>
              {user ? (
                <>
                  <Link to="/contact-history" onClick={() => setMobileOpen(false)} className="text-base font-medium">
                    Messages
                  </Link>
                  <button type="button" onClick={() => void logout()} className="text-left text-base font-medium">
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  state={{ from: authReturnTo }}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, type NavigateFunction } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPaymentIntent, createCryptoOrder, ApiError } from "@/services/apiClient";
import { toast } from "sonner";

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePk ? loadStripe(stripePk) : null;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StripeCheckoutSection({
  orderNumber,
  email,
  navigate,
}: {
  orderNumber: string;
  email: string;
  navigate: NavigateFunction;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const returnUrl = new URL(`${window.location.origin}/order-success`);
      returnUrl.searchParams.set("orderNumber", orderNumber);
      returnUrl.searchParams.set("email", email);
      returnUrl.searchParams.set("paymentMethod", "card");

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl.toString(),
        },
        redirect: "if_required",
      });
      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");
        navigate("/order-success", {
          state: { orderNumber, email, paymentMethod: "card", paymentStatus: "paid" },
        });
        return;
      }
      if (paymentIntent?.status === "processing") {
        toast.message("Payment is processing. We will update your order shortly.");
        navigate("/order-success", {
          state: { orderNumber, email, paymentMethod: "card", paymentStatus: "processing" },
        });
        return;
      }
      toast.message("Payment requires additional confirmation.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || busy} className="w-full">
        {busy ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { items, total } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentTab, setPaymentTab] = useState<"card" | "crypto">(stripePromise ? "card" : "crypto");
  const [cryptoCurrency, setCryptoCurrency] = useState("ETH");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "pay">("form");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!stripePromise) setPaymentTab("crypto");
  }, []);

  const shipping = total >= 99 ? 0 : 9.99;
  const grandTotal = total + shipping;

  const buildItems = () =>
    items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }));

  const validateCheckoutDetails = () => {
    if (!name.trim()) {
      toast.error("Full name is required.");
      return false;
    }
    if (!emailRegex.test(email.trim().toLowerCase())) {
      toast.error("Enter a valid email address.");
      return false;
    }
    if (!shippingAddress.trim()) {
      toast.error("Shipping address is required.");
      return false;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }
    return true;
  };

  const startCardPayment = async () => {
    if (!validateCheckoutDetails()) return;
    setBusy(true);
    try {
      const res = await createPaymentIntent(
        {
          items: buildItems(),
          name,
          email,
          shippingAddress,
        },
        token || undefined,
      );
      setClientSecret(res.clientSecret);
      setOrderNumber(res.orderNumber);
      setStep("pay");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not start checkout");
    } finally {
      setBusy(false);
    }
  };

  const submitCrypto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckoutDetails()) return;
    const amt = parseFloat(cryptoAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid crypto amount");
      return;
    }
    if (walletAddress.trim().length < 26) {
      toast.error("Enter a valid wallet address");
      return;
    }
    setBusy(true);
    try {
      const res = await createCryptoOrder(
        {
          items: buildItems(),
          name,
          email,
          shippingAddress,
          paymentMethod: "crypto",
          cryptoCurrency,
          cryptoAmount: amt,
          walletAddress,
        },
        token || undefined,
      );
      navigate("/order-success", {
        state: {
          orderNumber: res.orderNumber,
          email,
          paymentMethod: "crypto",
          paymentStatus: res.paymentStatus,
          total: res.total,
        },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Order failed");
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 section-padding py-20 text-center">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Button asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl">
          <div className="lg:col-span-2 space-y-6">
            {step === "form" && (
              <>
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h2 className="font-display font-semibold">Shipping</h2>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr">Shipping address</Label>
                    <Input
                      id="addr"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold mb-4">Payment</h2>
                  {!stripePromise && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Card payments are not configured. Use crypto checkout or set{" "}
                      <code className="text-xs">VITE_STRIPE_PUBLISHABLE_KEY</code>.
                    </p>
                  )}
                  <Tabs value={paymentTab} onValueChange={(v) => setPaymentTab(v as "card" | "crypto")}>
                    <TabsList>
                      <TabsTrigger value="card" disabled={!stripePromise}>
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="pt-4">
                      <Button
                        type="button"
                        onClick={startCardPayment}
                        disabled={busy || !stripePromise}
                        className="w-full"
                      >
                        {busy ? "Preparing…" : "Continue to secure payment"}
                      </Button>
                    </TabsContent>
                    <TabsContent value="crypto" className="pt-4">
                      <form onSubmit={submitCrypto} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={cryptoCurrency}
                            onChange={(e) => setCryptoCurrency(e.target.value)}
                          >
                            {["ETH", "BTC", "USDC", "USDT"].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="camt">Amount</Label>
                          <Input
                            id="camt"
                            type="number"
                            step="any"
                            min="0"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waddr">Wallet address</Label>
                          <Input
                            id="waddr"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            required
                            minLength={26}
                          />
                        </div>
                        <Button type="submit" disabled={busy} className="w-full">
                          {busy ? "Placing order…" : "Place order (crypto)"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}

            {step === "pay" && clientSecret && orderNumber && stripePromise && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display font-semibold mb-4">Pay with card</h2>
                <p className="text-sm text-muted-foreground mb-4">Order {orderNumber}</p>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <StripeCheckoutSection
                    orderNumber={orderNumber}
                    email={email}
                    navigate={navigate}
                  />
                </Elements>
                <Button type="button" variant="ghost" className="mt-4" onClick={() => setStep("form")}>
                  Back
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24">
            <h2 className="font-display font-semibold mb-4">Summary</h2>
            <ul className="text-sm space-y-2 mb-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {product.name} × {quantity}
                  </span>
                  <span>${(product.price * quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg pt-2">
                <span>Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

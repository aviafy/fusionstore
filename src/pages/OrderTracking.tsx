import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrackOrderMutation } from "@/hooks/useOrders";
import { ApiError } from "@/services/apiClient";
import type { OrderTrackResponse } from "@/services/types";
import { Check } from "lucide-react";
import { asArray } from "@/lib/utils";

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<OrderTrackResponse | null>(null);
  const mutation = useTrackOrderMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    mutation.mutate(
      { orderNumber: orderNumber.trim(), email: email.trim() },
      {
        onSuccess: (data) => setResult(data),
        onError: () => setResult(null),
      },
    );
  };

  const flow = asArray<OrderTrackResponse["statusFlow"][number]>(result?.statusFlow);
  const history = asArray<OrderTrackResponse["statusHistory"][number]>(result?.statusHistory);
  const currentCode = result?.currentStatus?.code;
  const doneIndex = flow.findIndex((s) => s.code === currentCode);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold mb-2">Track your order</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter the order number from your confirmation email and the email you used at checkout.
        </p>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4 mb-10">
          <div className="space-y-2">
            <Label htmlFor="onum">Order number</Label>
            <Input
              id="onum"
              placeholder="FE-XXXXXXXXXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="em">Email</Label>
            <Input
              id="em"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : (mutation.error as Error)?.message || "Could not find that order."}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Looking up…" : "Track order"}
          </Button>
        </form>

        {result && (
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Current status</p>
              <p className="font-display text-xl font-bold mt-1">{result.currentStatus?.label}</p>
              <p className="text-sm text-muted-foreground mt-2">{result.currentStatus?.description}</p>
              <p className="text-sm mt-4">
                Payment: <span className="font-semibold capitalize">{result.paymentStatus}</span>
              </p>
              {result.paymentMethod && (
                <p className="text-sm mt-1">
                  Method: <span className="font-semibold capitalize">{result.paymentMethod}</span>
                </p>
              )}
              <p className="text-sm mt-4">
                Total: <span className="font-semibold">${result.total?.toLocaleString()}</span>
              </p>
              {typeof result.shippingCost === "number" && (
                <p className="text-sm mt-1">
                  Shipping:{" "}
                  <span className="font-semibold">
                    {result.shippingCost === 0 ? "Free" : `$${result.shippingCost.toLocaleString()}`}
                  </span>
                </p>
              )}
            </div>

            <div>
              <h2 className="font-display font-semibold mb-4">Progress</h2>
              <ol className="space-y-3">
                {flow.map((step, i) => {
                  const reached = doneIndex >= i;
                  return (
                    <li
                      key={step.code}
                      className={`flex items-start gap-3 text-sm ${reached ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          reached ? "bg-foreground text-background border-foreground" : "border-border"
                        }`}
                      >
                        {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <div>
                        <p className="font-medium">{step.label}</p>
                        {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {history.length > 1 && (
              <div>
                <h2 className="font-display font-semibold mb-4">History</h2>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {history.map((h, i) => (
                    <li key={i}>
                      {h.label} — {h.enteredAt ? new Date(h.enteredAt).toLocaleString() : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

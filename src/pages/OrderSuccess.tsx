import { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

type SuccessState = {
  orderNumber?: string;
  email?: string;
  paymentMethod?: string;
  total?: number;
  paymentStatus?: "pending" | "processing" | "paid" | "failed";
};

export default function OrderSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state || {}) as SuccessState;
  const { clear } = useCart();

  const orderNumber =
    state.orderNumber || searchParams.get("orderNumber") || "";
  const email = state.email || searchParams.get("email") || "";
  const paymentMethod = state.paymentMethod || searchParams.get("paymentMethod") || "";
  const redirectStatus = searchParams.get("redirect_status");
  const paymentStatus = state.paymentStatus || (redirectStatus as SuccessState["paymentStatus"]) || "paid";
  const isFailed = paymentStatus === "failed";
  const isProcessing = paymentStatus === "processing" || paymentStatus === "pending";

  useEffect(() => {
    if (orderNumber && !isFailed) {
      clear();
    }
  }, [clear, isFailed, orderNumber]);

  const heading = isFailed ? "Payment not completed" : isProcessing ? "Order received" : "Thank you!";
  const message = isFailed
    ? "We could not confirm your payment. Your cart is still available if you want to try again."
    : isProcessing
      ? "Your order is recorded. Payment verification is still in progress before fulfillment begins."
      : "Your order has been received. You'll get a confirmation at the email below.";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 section-padding py-20 flex flex-col items-center text-center max-w-lg mx-auto">
        <h1 className="font-display text-3xl font-bold mb-4">{heading}</h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        {orderNumber && (
          <div className="rounded-xl border border-border bg-card p-6 w-full mb-8 text-left space-y-2">
            <p className="text-sm text-muted-foreground">Order number</p>
            <p className="font-mono font-semibold text-lg">{orderNumber}</p>
            {email && (
              <>
                <p className="text-sm text-muted-foreground pt-2">Email</p>
                <p className="font-medium">{email}</p>
              </>
            )}
            {paymentMethod && (
              <>
                <p className="text-sm text-muted-foreground pt-2">Payment method</p>
                <p className="font-medium capitalize">{paymentMethod}</p>
              </>
            )}
            <p className="text-sm text-muted-foreground pt-2">Payment status</p>
            <p className="font-medium capitalize">{paymentStatus.replace(/_/g, " ")}</p>
            {state.total != null && (
              <>
                <p className="text-sm text-muted-foreground pt-2">Total</p>
                <p className="font-display font-bold">${Number(state.total).toLocaleString()}</p>
              </>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild>
            <Link to="/order-tracking">Track order</Link>
          </Button>
          {isFailed ? (
            <Button asChild variant="outline">
              <Link to="/checkout">Return to checkout</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

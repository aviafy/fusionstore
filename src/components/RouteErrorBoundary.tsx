import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type BoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type BoundaryState = {
  error: Error | null;
};

class RouteErrorBoundaryImpl extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route render failed", error, info);
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen section-padding flex items-center justify-center py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold">The page crashed after loading.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {this.state.error.message || "Unexpected render error."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            If this only happens on Vercel, make sure{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">VITE_API_BASE_URL</code>{" "}
            points to a real backend and that <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">/api/*</code>{" "}
            is returning JSON instead of <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">index.html</code>.
          </p>
        </div>
      </div>
    );
  }
}

export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return <RouteErrorBoundaryImpl resetKey={resetKey}>{children}</RouteErrorBoundaryImpl>;
}

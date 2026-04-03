import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMyFreelancerContacts } from "@/hooks/useFreelancerContacts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactHistory() {
  const { data: contacts = [], isLoading } = useMyFreelancerContacts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold mb-2">Contact history</h1>
        <p className="text-sm text-muted-foreground mb-8">Your freelancer inquiries</p>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-muted-foreground">
            No messages yet.{" "}
            <Link to="/services" className="text-foreground underline underline-offset-4">
              Browse services
            </Link>
          </p>
        ) : (
          <ul className="space-y-4">
            {contacts.map((c) => (
              <li key={c._id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-display font-semibold">{c.subject || "Inquiry"}</p>
                  {c.status && <Badge variant="secondary">{c.status}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{c.serviceName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
}

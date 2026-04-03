import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFreelancerService } from "@/hooks/useFreelancerServices";
import { Skeleton } from "@/components/ui/skeleton";
import { resolvePublicAssetUrl } from "@/lib/publicAssetUrl";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isLoading, isError, error } = useFreelancerService(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-12 flex-1">
          <Skeleton className="h-96 max-w-4xl mx-auto rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-20 flex-1 text-center">
          <p className="text-destructive mb-4">{(error as Error)?.message || "Service not found"}</p>
          <Button asChild variant="outline">
            <Link to="/services">Back to services</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-10 flex-1">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <img
              src={resolvePublicAssetUrl(service.image)}
              alt={service.name}
              className="w-full aspect-video object-cover"
            />
          </div>
          <div>
            <Badge variant="secondary" className="mb-4">
              {service.category}
            </Badge>
            <h1 className="font-display text-3xl font-bold mb-4">{service.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                {service.rating ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {service.deliveryTime || "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-8">
              {service.freelancerImage && (
                <img
                  src={service.freelancerImage}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium">{service.freelancerName}</p>
                <p className="text-sm text-muted-foreground">Freelancer</p>
              </div>
            </div>
            <p className="font-display text-3xl font-bold mb-6">${service.price}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{service.description}</p>
            {service.skills && service.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {service.skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            <Button asChild size="lg">
              <Link to={`/contact-freelancer/${service._id}`}>Contact freelancer</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

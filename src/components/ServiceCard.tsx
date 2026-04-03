import { Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { ServiceCardModel } from "@/types/commerce";

interface ServiceCardProps {
  service: ServiceCardModel;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group card-hover rounded-xl border border-border bg-card overflow-hidden">
      <Link to={`/service/${service.id}`} className="block">
        <div className="aspect-video overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
            {service.avatar}
          </div>
          <div>
            <p className="text-sm font-medium">{service.freelancer}</p>
            <p className="text-xs text-muted-foreground">{service.category}</p>
          </div>
        </div>
        <Link to={`/service/${service.id}`}>
          <h3 className="font-display font-semibold text-sm leading-tight mb-3 hover:underline">
            {service.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-foreground text-foreground" />
            {service.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {service.deliveryLabel}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting at</p>
            <p className="font-display text-lg font-bold">${service.price}</p>
          </div>
          <Link
            to={`/service/${service.id}`}
            className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

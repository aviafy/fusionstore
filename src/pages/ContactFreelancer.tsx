import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useFreelancerService } from "@/hooks/useFreelancerServices";
import { useAuth } from "@/context/AuthContext";
import { useSubmitFreelancerContactMutation } from "@/hooks/useFreelancerContacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const timelines = ["ASAP", "1-2 weeks", "2-4 weeks", "1-3 months", "Flexible"] as const;

export default function ContactFreelancer() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isLoading } = useFreelancerService(id);
  const { user } = useAuth();
  const mutation = useSubmitFreelancerContactMutation();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState<string>(timelines[4]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    mutation.mutate(
      {
        serviceId: id,
        senderName: user.name || user.email,
        senderEmail: user.email,
        subject,
        message,
        budget: budget ? Number(budget) : undefined,
        timeline,
      },
      {
        onSuccess: () => {
          toast.success("Message sent!");
          setSubject("");
          setMessage("");
          setBudget("");
        },
        onError: () => toast.error("Could not send message"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-12 flex-1">
          <Skeleton className="h-64 max-w-xl mx-auto rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-20 flex-1 text-center">
          <p className="text-muted-foreground mb-4">Service not found.</p>
          <Button asChild variant="outline">
            <Link to="/services">Back</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold mb-2">Contact freelancer</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Regarding: <span className="text-foreground font-medium">{service.name}</span> —{" "}
          {service.freelancerName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="sub">Subject</Label>
            <Input id="sub" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bud">Budget (optional)</Label>
            <Input id="bud" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            >
              {timelines.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

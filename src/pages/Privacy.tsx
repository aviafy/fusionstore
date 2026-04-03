import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This demo application may process account email, order details, and messages you send to freelancers
            through our API. Data is stored in the project database for demonstration purposes only.
          </p>
          <p>
            Do not submit real financial or highly sensitive personal information. Configure proper privacy policies
            and data retention before any production launch.
          </p>
          <p>
            Cookies: authentication may use HTTP-only cookies alongside local storage tokens in development. Review
            your deployment&apos;s cookie banner requirements.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

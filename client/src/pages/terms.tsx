import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-4">Last updated: December 2025</p>
        
        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using Crazedo AI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p>Crazedo AI provides real-time trend intelligence and analytics services. The platform analyzes public data from various sources to provide trend insights and AI-powered summaries.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Use of Service</h2>
            <p>You agree to use the service only for lawful purposes and in accordance with these Terms. You may not use the service to harm, abuse, or harass others.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are owned by Crazedo AI and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Disclaimer</h2>
            <p>The service is provided "as is" without warranties of any kind. Trend data and AI-generated insights are for informational purposes only and should not be considered professional advice.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
            <p>For questions about these Terms, please contact us through our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

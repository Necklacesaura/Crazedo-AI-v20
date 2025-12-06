import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last updated: January 2025</p>
        
        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>Crazedo AI collects minimal information necessary to provide our trend intelligence services. This may include search queries you submit and basic usage analytics to improve our platform.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services. We do not sell your personal information to third parties.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or destruction.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Third-Party Services</h2>
            <p>Our platform may integrate with third-party services such as Google Trends and OpenAI. These services have their own privacy policies that govern their use of your data.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us through our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

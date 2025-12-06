import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        
        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <p className="mb-4">We'd love to hear from you. If you have questions, feedback, or inquiries about Crazedo AI, please reach out to us.</p>
            
            <div className="p-6 rounded-xl bg-card/40 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>
              </div>
              <p className="mb-2">For general inquiries and support:</p>
              <a href="mailto:contact@crazedoai.com" className="text-primary hover:underline" data-testid="link-email">contact@crazedoai.com</a>
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Response Time</h2>
            <p>We aim to respond to all inquiries within 1-2 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

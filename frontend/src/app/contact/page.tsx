import { Layout } from "@/components/layout/layout";
import { Section } from "@/components/ui/section";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <Layout>
      <Section
        title="Contact Us"
        description="We'd love to hear from you! Here's how you can reach us."
      >
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-medium mb-4">Our Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <address className="not-italic text-muted-foreground">
                      5A, jamuna tower, tungri<br />
                      Chaibasa, 833201
                    </address>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-muted-foreground">
                      <a href="tel:+917979031093" className="hover:text-primary transition-colors">
                        +91 7979031093
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-muted-foreground">
                      <a href="mailto:sangeetasaraff@gmail.com" className="hover:text-primary transition-colors">
                        sangeetasaraff@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Hours</h4>
                    <div className="text-muted-foreground">
                      <p>Monday - Sunday: 9:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-xl font-medium mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/paradise_cakes24?utm_source=qr&igsh=MWtpZ3RpZWVqdG96ZQ==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a 
                  href="https://www.facebook.com/share/1HrCWLiPTH/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Follow us on social media for the latest updates, special offers, and cake inspiration!
              </p>
            </div>
          </div>
          
          {/* Map */}
          <div className="bg-card rounded-lg border overflow-hidden h-[400px] md:h-full min-h-[400px]">
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <div className="text-center p-6">
                <h3 className="text-xl font-medium mb-2">Find Us</h3>
                <p className="text-muted-foreground mb-4">
                  We're located in Chaibasa
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <h3 className="text-xl font-medium mb-4">Custom Orders</h3>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            For custom cake orders or special requests, please contact us directly by phone or email.
            We recommend placing your order at least 48 hours in advance for regular cakes and 2 weeks for wedding or special event cakes.
          </p>
        </div>
      </Section>
    </Layout>
  );
}

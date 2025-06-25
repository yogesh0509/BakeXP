import Image from "next/image";
import { Layout } from "@/components/layout/layout";
import { Section } from "@/components/ui/section";

export default function AboutPage() {
  return (
    <Layout>
      <Section
        title="About BakeXP"
        description="Our story, our passion, and our commitment to quality"
      >
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="BakeXP"
              width={300}
              height={300}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              BakeXP started as a small family business with a passion for creating delicious and beautiful cakes. 
              What began in our home kitchen has grown into a beloved local bakery, but we still make every cake with the 
              same love and attention to detail as we did on day one.
            </p>
            <p className="text-muted-foreground mb-4">
              Our journey began in 2022 when our founder, Sangeeta Agrawal, started baking cakes for friends and family. 
              The overwhelming response to her creations inspired her to turn her passion into a business, and BakeXP was born.
            </p>
            <p className="text-muted-foreground">
              Today, we're proud to serve our community with the finest handcrafted cakes and pastries for all occasions, 
              from birthdays and weddings to corporate events and everyday celebrations.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: "quality",
                title: "Quality Ingredients",
                description: "We use only the finest, freshest ingredients in all our creations. No compromises, ever."
              },
              {
                id: "handcrafted",
                title: "Handcrafted with Love",
                description: "Every cake is made by hand with attention to detail and a passion for perfection."
              },
              {
                id: "customer",
                title: "Customer Satisfaction",
                description: "Your happiness is our priority. We work closely with you to exceed your expectations."
              },
              {
                id: "creativity",
                title: "Creativity",
                description: "We love bringing unique ideas to life and creating custom designs that wow our customers."
              },
              {
                id: "community",
                title: "Community",
                description: "We're proud to be part of our local community and support local suppliers whenever possible."
              },
              {
                id: "sustainability",
                title: "Sustainability",
                description: "We're committed to reducing our environmental impact through sustainable practices."
              }
            ].map((value) => (
              <div key={value.id} className="bg-card rounded-lg p-6 border">
                <h3 className="font-medium text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: "sangeeta",
                name: "Sangeeta Agrawal",
                role: "Founder & Head Baker",
                bio: "Sangeeta's passion for baking has grown into BakeXP you see today."
              }
            ].map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <h3 className="font-medium text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}

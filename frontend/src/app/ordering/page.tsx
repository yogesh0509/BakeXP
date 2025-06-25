import { Layout } from "@/components/layout/layout";
import { Section } from "@/components/ui/section";
import { OrderInfo } from "@/components/ui/order-info";

export default function OrderingPage() {
  return (
    <Layout>
      <Section
        title="Ordering Guidelines"
        description="Important information about our ordering process"
      >
        <div className="max-w-3xl mx-auto">

          <OrderInfo />

          <div className="mt-10 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">How to Order</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Browse our products and decide what you'd like to order</li>
                <li>Call us at <a href="tel:+917979031093" className="font-medium text-primary hover:underline">+91 7979031093</a></li>
                <li>Discuss any customizations you'd like</li>
                <li>Confirm delivery details and charges</li>
                <li>Provide delivery address and contact information</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Payment Options</h3>
              <p>We accept the following payment methods:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cash on delivery</li>
                <li>UPI payments</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Order Lead Time</h3>
              <p>Please try to place your orders at least 24-48 hours in advance to ensure availability. For custom designs or large orders, additional lead time may be required.</p>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

import { Phone, Truck, Gift, CakeSlice, Tag, Sparkles } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function OrderInfo() {
  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-primary/50 bg-primary/2">
        <Phone className="h-4 w-4" />
        <AlertTitle>Orders via Phone Only</AlertTitle>
        <AlertDescription>
          We currently accept orders only through phone calls. Please contact us at{" "}
          <a href="tel:+917979031093" className="font-medium text-primary hover:underline">
            +91 7979031093
          </a>{" "}
          to place your order.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert>
          <Truck className="h-4 w-4" />
          <AlertTitle>Delivery Information</AlertTitle>
          <AlertDescription>
            Delivery charges are extra (approximately ₹50). Please confirm the exact amount when placing your order.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Tag className="h-4 w-4" />
          <AlertTitle>Product Variations</AlertTitle>
          <AlertDescription>
            Images shown are representative. Actual products may vary in size and appearance. Prices may differ based on customizations.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Customization Available</AlertTitle>
          <AlertDescription>
            Most of our products can be customized with minimal or no extra cost. Discuss your preferences when ordering.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <CakeSlice className="h-4 w-4" />
          <AlertTitle>Premium Ingredients</AlertTitle>
          <AlertDescription>
            We use only high-quality or homemade ingredients to ensure the best taste and quality in all our products.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

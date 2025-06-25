import Link from "next/link";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
        <div className="space-y-6 max-w-md">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-medium">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="pt-6">
            <Button asChild size="lg">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

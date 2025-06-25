"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Cake, Sparkles, AlertCircle } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { useWallet } from "@/contexts/WalletContext";

export default function LogBake() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { logBake, isLoading, error, hasBakedToday, userStats } = useUserData();
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitError, setSubmitError] = useState("");
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock preview (in a real app, we'd handle the file upload)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preview) {
      setSubmitError("Please upload an image of your bake");
      return;
    }
    
    setUploading(true);
    setSubmitError("");
    
    // Convert tags string to array
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    // Call the logBake function from our context
    const success = await logBake(description, preview, tagArray);
    
    if (success) {
      // Wait a bit for the success feeling
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setUploading(false);
      setSubmitError("Failed to log your bake. Please try again.");
    }
  };
  
  // Redirect if not connected
  if (!wallet.connected) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Please connect your wallet to log your bakes and earn XP.
          </p>
          <Button onClick={() => router.push("/")} size="lg">Back to Home</Button>
        </div>
      </Layout>
    );
  }
  
  // Prevent logging multiple bakes per day
  if (hasBakedToday) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Already Baked Today</h1>
            <p className="text-muted-foreground mb-8">
              You've already logged a bake for today! Come back tomorrow to continue your streak.
            </p>
            <Button onClick={() => router.push("/dashboard")} size="lg">Back to Dashboard</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Log Today's Bake</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>What did you bake today?</CardTitle>
            <CardDescription>
              Share your delicious creation to earn XP and continue your streak!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="bake-image">Photo of your bake</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/20 transition-colors">
                  <Input
                    id="bake-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label htmlFor="bake-image" className="cursor-pointer flex flex-col items-center gap-2">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Bake preview" 
                        className="max-h-64 mx-auto rounded-md object-contain" 
                      />
                    ) : (
                      <>
                        <Cake className="h-12 w-12 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload a photo of your delicious bake
                        </span>
                      </>
                    )}
                  </Label>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about what you baked today..."
                  className="min-h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Optional Tag */}
              <div className="space-y-2">
                <Label htmlFor="tags">Recipe or Theme (optional)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., Sourdough, Birthday Cake, Cookie Challenge... (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              {/* Error message */}
              {submitError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {submitError}
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto" 
                  disabled={uploading || !preview || isLoading}
                >
                  {uploading || isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Logging your bake...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Log My Bake
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-6">
            <p>Earning 25 XP for this bake</p>
            <p>Current streak: {userStats?.streak || 0} {userStats?.streak === 1 ? 'day' : 'days'}</p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}

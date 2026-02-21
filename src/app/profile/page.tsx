
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user, authLoading, router]);

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Firebase Auth
      await updateProfile(user, { displayName, photoURL });
      
      // Update Firestore user record
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        photoURL,
      });

      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Update failed", 
        description: error.message 
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Editor</CardTitle>
          <CardDescription>Manage your public identity on CodeShare Connect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
              <AvatarImage src={photoURL} />
              <AvatarFallback className="text-4xl">{displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">Preview</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input 
              id="displayName" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoURL">Profile Picture URL</Label>
            <Input 
              id="photoURL" 
              value={photoURL} 
              onChange={(e) => setPhotoURL(e.target.value)} 
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

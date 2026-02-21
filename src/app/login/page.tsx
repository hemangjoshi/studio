"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/snippets");
    }
  }, [user, isUserLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setDocumentNonBlocking(doc(db, "users", userCredential.user.uid), {
          id: userCredential.user.uid,
          displayName: email.split("@")[0],
          photoURL: `https://picsum.photos/seed/${userCredential.user.uid}/200/200`,
        }, { merge: true });
      }
      toast({ title: isLogin ? "Welcome back!" : "Access Granted" });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Auth Exception", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setDocumentNonBlocking(doc(db, "users", user.uid), {
          id: user.uid,
          displayName: user.displayName || user.email?.split("@")[0],
          photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        }, { merge: true });
      }
      toast({ title: "Google Auth Successful" });
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          variant: "destructive",
          title: "Domain Restricted",
          description: "This domain is not authorized in Firebase Console. Please add your Netlify URL to the Authorized Domains list."
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Sign-in Failed", 
          description: error.message 
        });
      }
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="space-y-4 pt-12 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black tracking-tighter">
              {isLogin ? "Auth Required" : "Create Profile"}
            </CardTitle>
            <CardDescription className="text-base font-medium mt-2">
              Sync your syntax across the global network.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Master Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 rounded-xl bg-secondary/30 border-none shadow-inner"
                  required
                />
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 mt-4" type="submit" disabled={loading}>
              {loading ? "Processing..." : (isLogin ? "Authenticate" : "Initialize")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-card/60 px-4 text-muted-foreground">Unified Login</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="h-14 rounded-2xl font-black gap-3 border-border/60 hover:bg-secondary/50 transition-all" onClick={handleGoogleSignIn}>
              <Chrome className="h-5 w-5" />
              Sign in with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/20 p-6 flex flex-col items-center gap-2">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {isLogin ? "New to the grid?" : "Already synchronized?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-black hover:underline underline-offset-4"
            >
              {isLogin ? "Register Terminal" : "Access Account"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

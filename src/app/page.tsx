
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Code, MessageSquare, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/snippets");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 text-center">
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-foreground md:text-7xl">
          CodeShare <span className="text-primary">Connect</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          The ultimate platform for developers to share snippets and connect in real-time.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8 font-semibold">
              Get Started
            </Button>
          </Link>
          <Link href="/snippets">
            <Button size="lg" variant="outline" className="rounded-full px-8">
              Browse Public Feed
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-5xl">
        <div className="rounded-2xl border bg-card p-8 shadow-sm transition-transform hover:-translate-y-1">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Code className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Smart Snippets</h3>
          <p className="text-muted-foreground">
            Save code with privacy controls. Keep it for yourself or share it with the world.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm transition-transform hover:-translate-y-1">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Real-time Chat</h3>
          <p className="text-muted-foreground">
            Connect with developers globally in our public real-time chat room.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm transition-transform hover:-translate-y-1">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Secure & Private</h3>
          <p className="text-muted-foreground">
            Your private snippets are encrypted and visible only to you.
          </p>
        </div>
      </div>
    </div>
  );
}

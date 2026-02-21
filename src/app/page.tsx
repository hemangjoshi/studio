
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Code, MessageSquare, Shield, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/snippets");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12 text-center md:py-20">
      <div className="space-y-6 max-w-3xl px-4">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          Global Dev Community is Live
        </div>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-foreground md:text-8xl">
          CodeShare <span className="text-primary">Connect</span>
        </h1>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl">
          The ultimate platform for developers to share snippets, solve problems, and connect in real-time.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link href="/login">
            <Button size="lg" className="h-12 rounded-full px-8 font-semibold text-base">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/snippets">
            <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
              Browse Public Feed
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-6xl px-4">
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Code className="h-7 w-7" />
          </div>
          <h3 className="mb-3 text-2xl font-bold">Smart Snippets</h3>
          <p className="text-muted-foreground leading-relaxed">
            Organize your code with granular privacy controls. Keep it private for reference or go public to help others.
          </p>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h3 className="mb-3 text-2xl font-bold">Real-time Chat</h3>
          <p className="text-muted-foreground leading-relaxed">
            Collaborate instantly in the global dev room. Get quick feedback and build your professional network.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-secondary/50 hover:shadow-md">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20 text-foreground transition-transform group-hover:scale-110">
            <Shield className="h-7 w-7" />
          </div>
          <h3 className="mb-3 text-2xl font-bold">Cloud-Synced</h3>
          <p className="text-muted-foreground leading-relaxed">
            Your snippets are safe and accessible from any device. Fully integrated with Firebase for enterprise-grade security.
          </p>
        </div>
      </div>

      <div className="mt-20 w-full max-w-4xl rounded-3xl border bg-card/30 p-12 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">100%</p>
            <p className="text-sm text-muted-foreground">Real-time Sync</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-accent">Real-time</p>
            <p className="text-sm text-muted-foreground">Global Chat</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">Secure</p>
            <p className="text-sm text-muted-foreground">Auth & Database</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-accent">Cloud</p>
            <p className="text-sm text-muted-foreground">Infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

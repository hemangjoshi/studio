"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Code, MessageSquare, Shield, ArrowRight, Zap, Sparkles } from "lucide-react";
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
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12 text-center md:py-24">
      <div className="space-y-8 max-w-4xl px-4">
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] sm:text-xs font-black text-primary shadow-sm uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles className="h-3 w-3" />
          <span>Global Developer Network v2.0</span>
        </div>
        
        <h1 className="font-headline text-5xl font-black tracking-tighter text-foreground md:text-9xl leading-[0.9]">
          code<span className="text-primary">Share</span>
        </h1>
        
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-2xl font-semibold leading-relaxed">
          The ultimate environment for modern engineers to exchange syntax, solve complex logic, and build a secure private knowledge vault.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Link href="/login">
            <Button size="lg" className="h-14 sm:h-16 rounded-[2rem] px-10 sm:px-12 font-black text-base sm:text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
              <Zap className="h-5 w-5 fill-current" />
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/snippets">
            <Button size="lg" variant="outline" className="h-14 sm:h-16 rounded-[2rem] px-10 sm:px-12 text-base sm:text-lg font-black border-border/60 hover:bg-secondary transition-all">
              Explore Library
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-7xl px-4">
        {[
          {
            icon: Code,
            title: "Smart Snippets",
            desc: "Architect your code with granular privacy controls. Keep it private for internal reference or broadcast to the world.",
            color: "primary"
          },
          {
            icon: MessageSquare,
            title: "Real-time Room",
            desc: "Collaborate instantly in the global dev lounge. Get instant feedback and clip valuable code blocks with one click.",
            color: "accent"
          },
          {
            icon: Shield,
            title: "Private Vault",
            desc: "Your intellectual property is safe and cloud-synced across devices, integrated with enterprise-grade security.",
            color: "primary"
          }
        ].map((feature, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 p-8 sm:p-10 shadow-sm transition-all hover:border-primary/40 hover:bg-card hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-${feature.color}/10 text-${feature.color} transition-transform group-hover:scale-110 shadow-inner`}>
              <feature.icon className="h-8 w-8" />
            </div>
            <h3 className="mb-4 text-2xl font-black tracking-tight">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 w-full max-w-5xl rounded-[3rem] border border-border/40 bg-card/20 p-8 sm:p-16 backdrop-blur-xl shadow-inner relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 relative z-10">
          <div className="space-y-2">
            <p className="text-4xl font-black text-primary tracking-tighter">100%</p>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sync Speed</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-black text-accent tracking-tighter">Live</p>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Global Chat</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-black text-primary tracking-tighter">Secure</p>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Auth Layer</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-black text-accent tracking-tighter">Cloud</p>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deployment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
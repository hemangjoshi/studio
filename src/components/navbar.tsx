"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code, MessageSquare, User, LogOut, LayoutGrid, Zap } from "lucide-react";
import { signOut } from "firebase/auth";
import { useAuth, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();

  const navItems = user ? [
    { href: "/snippets", label: "Discovery", icon: LayoutGrid },
    { href: "/chat", label: "Dev Room", icon: MessageSquare },
  ] : [
    { href: "/snippets", label: "Library", icon: LayoutGrid },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-black text-xl sm:text-2xl group">
          <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Code className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent lowercase tracking-tighter">codeShare</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="h-6 w-px bg-border mx-1 hidden md:block" />
          
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/profile" className="flex items-center gap-2 group">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="font-bold">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-black leading-none">{user.displayName || "Developer"}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Pro Account</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut(auth)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full font-bold">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-full px-4 sm:px-6 h-9 sm:h-11 font-bold gap-2 shadow-lg shadow-primary/20">
                  <Zap className="h-4 w-4 fill-white" />
                  <span className="text-xs sm:text-sm">Join Community</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Nav Overlay (bottom) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-3xl border border-border/50 rounded-full px-8 py-3 shadow-2xl flex items-center gap-10 z-[60]">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === item.href ? "text-primary scale-125" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}
        {user && (
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === "/profile" ? "text-primary scale-125" : "text-muted-foreground"
            )}
          >
            <User className="h-6 w-6" />
          </Link>
        )}
      </div>
    </nav>
  );
}
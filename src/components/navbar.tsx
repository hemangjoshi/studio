
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code, MessageSquare, User, LogOut, LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: "/snippets", label: "Snippets", icon: Code },
    { href: "/chat", label: "Global Chat", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-md md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="hidden items-center gap-2 font-headline text-xl font-bold text-primary md:flex">
          <Code className="h-6 w-6" />
          <span>CodeShare</span>
        </Link>

        <div className="flex w-full items-center justify-around gap-1 md:w-auto md:justify-end md:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-2 text-xs transition-colors md:flex-row md:gap-2 md:text-sm",
                pathname.startsWith(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut(auth)}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

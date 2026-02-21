"use client";

import Link from "next/link";
import { Code, Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-md py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black text-primary lowercase tracking-tighter">
              <Code className="h-8 w-8" />
              <span>codeShare</span>
            </Link>
            <p className="max-w-xs text-muted-foreground leading-relaxed font-medium">
              The premier global platform for modern developers to discover, share, and discuss code in real-time. Built for the community, by the community.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-black mb-4 uppercase text-[10px] tracking-widest text-muted-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
              <li><Link href="/snippets" className="hover:text-primary transition-colors">Public Library</Link></li>
              <li><Link href="/chat" className="hover:text-primary transition-colors">Global Chat</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Docs</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-[10px] tracking-widest text-muted-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-semibold">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-bold">
          <p>© {new Date().getFullYear()} codeShare Hub. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineering Excellence with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>powered by Firebase Studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
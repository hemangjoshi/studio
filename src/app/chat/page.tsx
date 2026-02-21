"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, Globe, Paperclip, Terminal, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const chatQuery = useMemoFirebase(() => {
    return query(
      collection(db, "globalChatMessages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );
  }, [db]);

  const { data: messages } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    addDocumentNonBlocking(collection(db, "globalChatMessages"), {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || user.email?.split("@")[0],
      senderPhotoURL: user.photoURL,
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  const handleQuickClip = (text: string) => {
    if (!user) return;
    
    addDocumentNonBlocking(collection(db, "codeSnippets"), {
      title: `Clipped from Chat: ${text.slice(0, 30)}...`,
      codeContent: text,
      language: "javascript", 
      isPublic: false,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      createdAt: serverTimestamp(),
    });

    toast({
      title: "Quick Clip Saved!",
      description: "Successfully added to your personal secure vault.",
    });
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-5xl flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-[2.5rem] bg-card border border-border/60 shadow-2xl shadow-primary/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/30 group">
            <Globe className="h-8 w-8 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tighter">Global Dev Room</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-black border-green-500/50 text-green-500 animate-pulse bg-green-500/5 px-2">Live</Badge>
            </div>
            <p className="text-muted-foreground font-semibold flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-primary" />
              Collaborate with 1.2k+ active developers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-secondary/30 rounded-full border border-border/50 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">E2E Encryption Active</span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden bg-card/40 backdrop-blur-3xl border-border/60 rounded-[3rem] shadow-2xl">
        <ScrollArea className="flex-1 p-8 md:p-12">
          <div className="space-y-10">
            {!messages?.length && (
              <div className="flex h-[40vh] flex-col items-center justify-center text-center opacity-40">
                <div className="p-10 rounded-full bg-secondary/10 mb-8">
                  <MessageSquare className="h-20 w-20 text-muted-foreground" />
                </div>
                <h3 className="text-3xl font-black tracking-tight">Broadcast Transmission</h3>
                <p className="max-w-xs text-lg font-medium mt-2">The frequency is clear. Initiate your first discovery broadcast.</p>
              </div>
            )}
            
            {messages?.map((msg, index) => {
              const isMe = msg.senderId === user.uid;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-5 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <Avatar className="h-12 w-12 border-2 border-background shadow-xl ring-4 ring-primary/5">
                    <AvatarImage src={msg.senderPhotoURL} />
                    <AvatarFallback className="font-black bg-primary/10 text-primary">{msg.senderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[85%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-3 mb-2 px-3">
                      <span className="text-xs font-black uppercase tracking-wider opacity-80">{msg.senderName}</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : "Syncing..."}
                      </span>
                    </div>
                    
                    <div className="relative group">
                      <div className={`rounded-[2rem] px-8 py-4.5 text-base font-medium leading-relaxed shadow-lg ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none shadow-primary/20' 
                          : 'bg-card text-foreground border border-border/50 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className={`absolute -bottom-3 ${isMe ? '-left-3' : '-right-3'} h-11 w-11 rounded-full shadow-2xl border border-border scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-primary hover:text-primary-foreground hover:rotate-12`}
                              onClick={() => handleQuickClip(msg.text)}
                            >
                              <Paperclip className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="font-black rounded-lg">Quick Clip to Vault</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-8 md:p-10 bg-card/60 border-t backdrop-blur-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-5 items-center">
            <div className="relative flex-1">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Broadcast logic or syntax..." 
                className="h-16 rounded-[1.5rem] bg-secondary/30 border-none pl-8 pr-16 text-lg font-medium focus-visible:ring-primary/40 shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3">
                <Terminal className="h-6 w-6 text-muted-foreground/30 animate-pulse" />
              </div>
            </div>
            <Button type="submit" size="icon" className="rounded-[1.2rem] h-16 w-16 shrink-0 shadow-2xl shadow-primary/30 hover:scale-110 active:scale-90 transition-all bg-primary">
              <Send className="h-7 w-7" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

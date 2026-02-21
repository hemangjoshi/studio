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
import { Send, Users, Globe, Paperclip, Terminal, Sparkles, MessageSquare } from "lucide-react";
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
      language: "javascript", // Default to JS, user can edit later
      isPublic: false,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      createdAt: serverTimestamp(),
    });

    toast({
      title: "Quick Clip Saved!",
      description: "This code block has been added to your private vault.",
    });
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-5xl flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-[2rem] bg-card border shadow-xl shadow-primary/5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">Global Dev Room</h2>
              <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-green-500/50 text-green-500 animate-pulse bg-green-500/5">Live</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Real-time collaboration with developers worldwide
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border/50">
          <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sync Active</span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden bg-card/40 backdrop-blur-xl border-border/60 rounded-[2.5rem] shadow-2xl">
        <ScrollArea className="flex-1 p-6 md:p-8">
          <div className="space-y-8">
            {!messages?.length && (
              <div className="flex h-[40vh] flex-col items-center justify-center text-center opacity-30">
                <MessageSquare className="mb-6 h-20 w-20 text-muted-foreground" />
                <h3 className="text-xl font-bold">The frequency is clear</h3>
                <p className="max-w-xs text-sm">Start the conversation by broadcasting your first message.</p>
              </div>
            )}
            
            {messages?.map((msg, index) => {
              const isMe = msg.senderId === user.uid;
              const isCodeLike = msg.text.includes("{") || msg.text.includes("import") || msg.text.includes("const");
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                    <AvatarImage src={msg.senderPhotoURL} />
                    <AvatarFallback className="font-bold">{msg.senderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[80%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-2">
                      <span className="text-xs font-black uppercase tracking-tight opacity-70">{msg.senderName}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : "Sending..."}
                      </span>
                    </div>
                    
                    <div className="relative group">
                      <div className={`rounded-3xl px-6 py-3.5 text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
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
                              className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} h-9 w-9 rounded-full shadow-lg border border-border scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-primary hover:text-primary-foreground`}
                              onClick={() => handleQuickClip(msg.text)}
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="font-bold">Quick Clip to Vault</TooltipContent>
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

        <div className="p-6 md:p-8 bg-card/60 border-t backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Broadcast a message or paste code..." 
                className="h-14 rounded-3xl bg-secondary/30 border-none pl-6 pr-14 text-base focus-visible:ring-primary/40 shadow-inner"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>
            <Button type="submit" size="icon" className="rounded-2xl h-14 w-14 shrink-0 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
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
import { Send, Globe, Paperclip, Terminal, MessageSquare, ShieldCheck } from "lucide-react";
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
      description: "Successfully added to your private vault.",
    });
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] max-w-5xl flex-col gap-4 sm:gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-card border border-border/60 shadow-xl shadow-primary/5 backdrop-blur-xl">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-3xl font-black tracking-tighter">Global Dev Room</h2>
              <Badge variant="outline" className="text-[8px] sm:text-[10px] uppercase font-black border-green-500/50 text-green-500 animate-pulse bg-green-500/5 px-2">Live</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold flex items-center gap-2 mt-1">
              Connect and solve logic in real-time
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2 bg-secondary/50 rounded-full border border-border/50">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E2E Encryption</span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden bg-card/40 backdrop-blur-2xl border-border/60 rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl relative">
        <ScrollArea className="flex-1 p-4 sm:p-10">
          <div className="space-y-8 sm:space-y-10">
            {!messages?.length && (
              <div className="flex h-[30vh] sm:h-[40vh] flex-col items-center justify-center text-center opacity-40">
                <div className="p-6 sm:p-10 rounded-full bg-secondary/10 mb-6 sm:mb-8">
                  <MessageSquare className="h-12 w-12 sm:h-20 sm:w-20 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black tracking-tight">Broadcasting...</h3>
                <p className="max-w-xs text-sm sm:text-lg font-medium mt-2">The frequency is clear. Start the conversation.</p>
              </div>
            )}
            
            {messages?.map((msg) => {
              const isMe = msg.senderId === user.uid;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 sm:gap-5 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-lg">
                    <AvatarImage src={msg.senderPhotoURL} />
                    <AvatarFallback className="font-black bg-primary/10 text-primary">{msg.senderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[85%] sm:max-w-[75%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-2">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{msg.senderName}</span>
                      <span className="text-[8px] font-bold text-muted-foreground">
                        {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : "..."}
                      </span>
                    </div>
                    
                    <div className="relative group">
                      <div className={`rounded-2xl sm:rounded-[2rem] px-5 sm:px-8 py-3 sm:py-4.5 text-sm sm:text-base font-medium shadow-md ${
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
                              className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg border border-border scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-primary hover:text-white`}
                              onClick={() => handleQuickClip(msg.text)}
                            >
                              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="font-black rounded-lg">Clip to Vault</TooltipContent>
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

        <div className="p-4 sm:p-8 bg-card/60 border-t backdrop-blur-3xl">
          <form onSubmit={handleSendMessage} className="flex gap-3 sm:gap-5 items-center max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message the dev room..." 
                className="h-12 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-secondary/30 border-none pl-6 sm:pl-8 pr-12 sm:pr-16 text-sm sm:text-lg font-medium shadow-inner"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Terminal className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/30 animate-pulse" />
              </div>
            </div>
            <Button type="submit" size="icon" className="rounded-xl sm:rounded-[1.2rem] h-12 w-12 sm:h-16 sm:w-16 shrink-0 shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
              <Send className="h-5 w-5 sm:h-7 sm:w-7" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

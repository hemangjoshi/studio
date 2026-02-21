
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc
} from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Globe, Paperclip, Terminal, MessageSquare, ShieldCheck, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleDeleteMessage = (messageId: string) => {
    deleteDocumentNonBlocking(doc(db, "globalChatMessages", messageId));
    toast({
      title: "Message Deleted",
      description: "The message has been removed from the history.",
    });
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] max-w-5xl flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-card border border-border/60 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">Dev Room</h2>
              <Badge variant="outline" className="text-[10px] uppercase border-green-500/50 text-green-500 bg-green-500/5">Live</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Real-time collaboration</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-full border border-border/50">
          <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Encrypted</span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden bg-card/50 backdrop-blur-md border-border/60 rounded-[2rem] shadow-xl relative">
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8">
            {!messages?.length && (
              <div className="flex h-[30vh] flex-col items-center justify-center text-center opacity-30">
                <MessageSquare className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-bold">No signals detected</h3>
                <p className="text-sm">Be the first to transmit a message.</p>
              </div>
            )}
            
            {messages?.map((msg) => {
              const isMe = msg.senderId === user.uid;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-background shrink-0">
                    <AvatarImage src={msg.senderPhotoURL} />
                    <AvatarFallback className="font-bold bg-primary/10 text-primary">{msg.senderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[85%] sm:max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{msg.senderName}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : ""}
                      </span>
                    </div>
                    
                    <div className="relative group flex items-center gap-2">
                      <div className={`rounded-2xl px-4 py-2.5 text-sm sm:text-base font-medium shadow-sm ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-secondary/40 text-foreground border border-border/50 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>

                      <div className={`flex flex-col gap-1 transition-opacity opacity-0 group-hover:opacity-100 ${isMe ? 'items-end' : 'items-start'}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full bg-background/50 hover:bg-primary hover:text-white"
                                onClick={() => handleQuickClip(msg.text)}
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Save Snippet</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {isMe && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/50">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"} className="rounded-xl">
                              <DropdownMenuItem 
                                className="text-destructive font-bold gap-2 cursor-pointer"
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 sm:p-6 bg-card border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-4 items-center max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="h-12 rounded-2xl bg-secondary/30 border-none px-6 text-sm font-medium shadow-inner"
              />
              <Terminal className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20" />
            </div>
            <Button type="submit" size="icon" className="rounded-2xl h-12 w-12 shrink-0 shadow-lg shadow-primary/10">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

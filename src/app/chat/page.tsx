
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, Globe } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const q = query(
      collection(db, "globalChat"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "globalChat"), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split("@")[0],
        senderPhoto: user.photoURL,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-card p-4 border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold">Global Dev Room</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Public Real-time Room</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Dev Community</span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center opacity-40">
                <Send className="mb-4 h-12 w-12" />
                <p>Be the first to start the conversation!</p>
              </div>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.senderId === user.uid;
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 border border-border mt-1">
                    <AvatarImage src={msg.senderPhoto} />
                    <AvatarFallback>{msg.senderName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.timestamp ? format(msg.timestamp.toDate(), "HH:mm") : ""}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-secondary text-secondary-foreground rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="border-t bg-card/80 p-4">
          <div className="flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message global chat..." 
              className="rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
            <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { 
  collection, 
  query, 
  where, 
  serverTimestamp,
  doc
} from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Globe, Lock, Search, Code as CodeIcon, User, Copy, Sparkles, Languages, Terminal, Grid2X2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { explainSnippet } from "@/ai/flows/explain-snippet";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "javascript", "typescript", "python", "html", "css", "sql", "bash", "json", "rust", "go", "java"
];

export default function SnippetsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const [isPublic, setIsPublic] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const { toast } = useToast();

  const publicQuery = useMemoFirebase(() => {
    return query(collection(db, "codeSnippets"), where("isPublic", "==", true));
  }, [db]);
  const { data: publicSnippets, isLoading: publicLoading } = useCollection(publicQuery);

  const myQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "codeSnippets"), where("authorId", "==", user.uid));
  }, [db, user?.uid]);
  const { data: mySnippets, isLoading: myLoading } = useCollection(myQuery);

  const handleCreateSnippet = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required" });
      return;
    }
    if (!newTitle.trim() || !newCode.trim()) {
      toast({ variant: "destructive", title: "Missing fields" });
      return;
    }

    addDocumentNonBlocking(collection(db, "codeSnippets"), {
      title: newTitle.trim(),
      codeContent: newCode.trim(),
      language: newLanguage,
      isPublic,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      createdAt: serverTimestamp(),
    });

    setIsDialogOpen(false);
    setNewTitle("");
    setNewCode("");
    toast({ title: "Snippet created!" });
  };

  const handleAISummarize = async (snippet: any) => {
    if (snippet.aiExplanation) return;
    if (!user) {
      toast({ variant: "destructive", title: "Sign-in Required", description: "Please sign in to generate AI explanations." });
      return;
    }

    setExplainingId(snippet.id);
    try {
      const result = await explainSnippet({ code: snippet.codeContent, language: snippet.language });
      updateDocumentNonBlocking(doc(db, "codeSnippets", snippet.id), {
        aiExplanation: result.explanation
      });
      toast({ title: "AI Analysis Complete" });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setExplainingId(null);
    }
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => (
    <Card className="masonry-item group flex flex-col overflow-hidden border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 overflow-hidden">
            <CardTitle className="text-lg line-clamp-2 leading-tight font-bold">
              {snippet.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{snippet.authorName}</span>
              <span>•</span>
              <Badge variant="secondary" className="h-4 px-1 text-[8px] font-mono uppercase">
                {snippet.language}
              </Badge>
            </div>
          </div>
          <Badge variant={snippet.isPublic ? "outline" : "secondary"} className="shrink-0 h-5 px-1.5">
            {snippet.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-0">
        <div className="relative group/code rounded-xl bg-secondary/30 p-4 text-[11px] leading-relaxed text-foreground font-mono border border-border/50">
          <pre className="max-h-[300px] overflow-hidden whitespace-pre-wrap">{snippet.codeContent}</pre>
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-100 group-hover/code:opacity-0 transition-opacity" />
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-all scale-90 group-hover/code:scale-100 shadow-sm"
            onClick={() => {
              navigator.clipboard.writeText(snippet.codeContent);
              toast({ title: "Copied to clipboard" });
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {snippet.aiExplanation && (
          <div className="mt-4 rounded-xl bg-primary/5 p-4 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" /> AI Context
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "{snippet.aiExplanation}"
            </p>
          </div>
        )}

        {!snippet.aiExplanation && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4 w-full gap-2 text-primary hover:bg-primary/5 hover:text-primary border border-dashed border-primary/20"
            disabled={explainingId === snippet.id}
            onClick={() => handleAISummarize(snippet)}
          >
            <Sparkles className={cn("h-3 w-3", explainingId === snippet.id && "animate-pulse")} />
            {explainingId === snippet.id ? "Analyzing Code..." : "Generate AI Context"}
          </Button>
        )}
      </CardContent>
      <CardFooter className="px-5 py-3 text-[10px] text-muted-foreground border-t bg-muted/20 flex justify-between items-center">
        <span className="font-medium">{snippet.createdAt?.toDate ? formatDistanceToNow(snippet.createdAt.toDate()) + ' ago' : 'Just now'}</span>
        <Terminal className="h-3 w-3 opacity-30" />
      </CardFooter>
    </Card>
  );

  const filterAndSort = (snippets: any[]) => {
    return snippets
      .filter(s => 
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.codeContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.language?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  };

  const filteredPublic = useMemo(() => filterAndSort(publicSnippets || []), [publicSnippets, searchTerm]);
  const filteredMy = useMemo(() => filterAndSort(mySnippets || []), [mySnippets, searchTerm]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-xs">
            The Discovery Feed
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Explore Intelligence
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            A curated grid of modular code blocks, enhanced by AI and ready for your next project.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search concepts or syntax..." 
              className="pl-10 h-11 rounded-full bg-card border-border/60 focus-visible:ring-primary/50 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11 rounded-full px-8 shadow-xl shadow-primary/20 font-bold gap-2">
                <Plus className="h-5 w-5" />
                <span>Publish Snippet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-[2rem] border-primary/10 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">New Knowledge</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold ml-1">Title</Label>
                    <Input 
                      placeholder="e.g. React Auth Hook" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-secondary/20 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold ml-1">Stack/Language</Label>
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="bg-secondary/20 h-12 rounded-xl">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Source Code</Label>
                  <Textarea 
                    placeholder="// Paste your magic here..." 
                    className="font-mono text-sm bg-secondary/40 min-h-[300px] resize-none rounded-2xl border-none focus-visible:ring-primary/20 p-6"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border p-6 bg-muted/30">
                  <div className="space-y-1">
                    <Label className="text-md font-bold">Public Availability</Label>
                    <p className="text-xs text-muted-foreground font-medium">Allow others to learn and build from this</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} className="scale-110" />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-12 px-6">Discard</Button>
                <Button onClick={handleCreateSnippet} className="rounded-full h-12 px-12 font-bold shadow-lg shadow-primary/20">Save to Library</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-10 h-14 bg-muted/50 p-1.5 rounded-full border border-border max-w-md mx-auto flex">
          <TabsTrigger value="public" className="flex-1 gap-2 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold transition-all">
            <Grid2X2 className="h-4 w-4" /> Global Discovery
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-2 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary font-bold transition-all">
            <Lock className="h-4 w-4" /> Personal Vault
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="public">
          {publicLoading ? (
             <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="masonry-item h-[400px] rounded-3xl bg-card animate-pulse border border-border/20" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 masonry-grid">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/20 border-border/60">
              <Languages className="h-16 w-16 text-muted-foreground/20 mb-6" />
              <h3 className="text-2xl font-bold mb-2">No concepts found</h3>
              <p className="text-muted-foreground max-w-xs">Try adjusting your filters or be the first to publish a new discovery.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          {!user ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/20">
              <Lock className="h-16 w-16 text-muted-foreground/20 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Secure Vault</h3>
              <p className="text-muted-foreground max-w-xs">Sign in to manage your private and shared intellectual property.</p>
              <Button asChild className="mt-6 rounded-full px-8" size="lg">
                <a href="/login">Authenticate Now</a>
              </Button>
            </div>
          ) : myLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="masonry-item h-[400px] rounded-3xl bg-card animate-pulse border border-border/20" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 masonry-grid">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/20">
              <CodeIcon className="h-16 w-16 text-muted-foreground/20 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Library Empty</h3>
              <p className="text-muted-foreground max-w-xs">Your personal vault is waiting for its first entry.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
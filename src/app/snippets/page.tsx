"use client";

import { useState, useMemo } from "react";
import { 
  collection, 
  query, 
  where, 
  serverTimestamp,
  doc
} from "firebase/firestore";
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking 
} from "@/firebase";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Globe, 
  Lock, 
  Search, 
  Code as CodeIcon, 
  User, 
  Copy, 
  Sparkles, 
  Languages, 
  Terminal, 
  Grid2X2,
  Trash2,
  MoreVertical,
  Share2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "codeSnippets", id));
    toast({ title: "Snippet deleted", description: "The snippet has been removed from your library." });
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => {
    const isOwner = user?.uid === snippet.authorId;

    return (
      <Card className="masonry-item group flex flex-col overflow-hidden border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card hover:shadow-2xl hover:shadow-primary/10">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 overflow-hidden">
              <CardTitle className="text-lg line-clamp-2 leading-tight font-bold group-hover:text-primary transition-colors">
                {snippet.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate font-medium">{snippet.authorName}</span>
                <span>•</span>
                <Badge variant="secondary" className="h-4 px-1 text-[8px] font-mono uppercase bg-secondary/80">
                  {snippet.language}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Badge variant={snippet.isPublic ? "outline" : "secondary"} className="shrink-0 h-5 px-1.5 border-primary/20 text-primary">
                {snippet.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              </Badge>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive gap-2 font-semibold">
                          <Trash2 className="h-4 w-4" />
                          Delete Snippet
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your snippet
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(snippet.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <DropdownMenuItem className="gap-2 font-semibold" onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + "/snippets/" + snippet.id);
                      toast({ title: "Link copied!" });
                    }}>
                      <Share2 className="h-4 w-4" />
                      Share Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-5 pt-0">
          <div className="relative group/code rounded-xl bg-secondary/30 p-4 text-[11px] leading-relaxed text-foreground font-mono border border-border/50 group-hover:border-primary/20 transition-all">
            <pre className="max-h-[300px] overflow-hidden whitespace-pre-wrap">{snippet.codeContent}</pre>
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-100 group-hover/code:opacity-0 transition-opacity" />
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-all scale-90 group-hover/code:scale-100 shadow-lg bg-card/80 backdrop-blur-sm"
              onClick={() => {
                navigator.clipboard.writeText(snippet.codeContent);
                toast({ title: "Code Copied!", description: "Syntax is now in your clipboard." });
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {snippet.aiExplanation && (
            <div className="mt-4 rounded-xl bg-primary/5 p-4 border border-primary/10 relative overflow-hidden group/ai">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/ai:opacity-10 transition-opacity">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3 animate-pulse" /> AI Analysis
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic relative z-10">
                "{snippet.aiExplanation}"
              </p>
            </div>
          )}

          {!snippet.aiExplanation && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 w-full gap-2 text-primary hover:bg-primary/5 hover:text-primary border border-dashed border-primary/20 rounded-xl"
              disabled={explainingId === snippet.id}
              onClick={() => handleAISummarize(snippet)}
            >
              <Sparkles className={cn("h-3 w-3", explainingId === snippet.id && "animate-pulse")} />
              {explainingId === snippet.id ? "Analyzing Logic..." : "Generate AI Context"}
            </Button>
          )}
        </CardContent>
        <CardFooter className="px-5 py-3 text-[10px] text-muted-foreground border-t bg-muted/20 flex justify-between items-center">
          <span className="font-semibold">{snippet.createdAt?.toDate ? formatDistanceToNow(snippet.createdAt.toDate()) + ' ago' : 'Just now'}</span>
          <div className="flex items-center gap-2 opacity-30">
            <Terminal className="h-3.5 w-3.5" />
            <span className="font-mono uppercase tracking-widest">v1.0</span>
          </div>
        </CardFooter>
      </Card>
    );
  };

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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>Discovery Feed v2.0</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            Developer <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
            A real-time curated grid of modular code blocks, enhanced by generative AI for the modern developer.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <Input 
              placeholder="Search concepts, syntax, or stack..." 
              className="pl-12 h-12 rounded-2xl bg-card border-border/60 focus-visible:ring-primary/40 shadow-inner text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 rounded-2xl px-10 shadow-2xl shadow-primary/30 font-black gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="h-5 w-5" />
                <span>Publish New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-[2.5rem] border-primary/10 bg-card/95 backdrop-blur-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">Broadcast Discovery</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Title</Label>
                    <Input 
                      placeholder="e.g. Optimized GraphQL Hook" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-secondary/20 h-14 rounded-2xl border-none text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Stack</Label>
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="bg-secondary/20 h-14 rounded-2xl border-none text-base">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang} className="capitalize font-bold">{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Source Code</Label>
                  <Textarea 
                    placeholder="// Paste your magic syntax here..." 
                    className="font-mono text-sm bg-secondary/40 min-h-[350px] resize-none rounded-3xl border-none focus-visible:ring-primary/20 p-8 shadow-inner"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-[2rem] border-2 border-dashed border-border p-8 bg-muted/30 transition-colors hover:bg-muted/50">
                  <div className="space-y-1">
                    <Label className="text-lg font-black tracking-tight">Public Availability</Label>
                    <p className="text-sm text-muted-foreground font-medium">Enable community collaboration and AI enhancement</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} className="scale-125" />
                </div>
              </div>
              <DialogFooter className="gap-4">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-14 px-8 font-bold text-muted-foreground">Discard</Button>
                <Button onClick={handleCreateSnippet} className="rounded-2xl h-14 px-16 font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-lg">Save to Library</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-12 h-16 bg-muted/30 p-2 rounded-full border border-border/40 max-w-lg mx-auto flex shadow-sm backdrop-blur-md">
          <TabsTrigger value="public" className="flex-1 gap-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:text-primary font-black transition-all text-sm">
            <Grid2X2 className="h-4 w-4" /> Global Discovery
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-xl data-[state=active]:text-primary font-black transition-all text-sm">
            <Lock className="h-4 w-4" /> My Private Vault
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="public" className="mt-0">
          {publicLoading ? (
             <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="masonry-item h-[450px] rounded-[2.5rem] bg-card/40 animate-pulse border border-border/10 mb-8" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 masonry-grid">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-[4rem] border-2 border-dashed text-center bg-card/20 border-border/40 backdrop-blur-sm">
              <div className="p-10 rounded-full bg-secondary/10 mb-8">
                <Languages className="h-20 w-20 text-muted-foreground/30" />
              </div>
              <h3 className="text-3xl font-black mb-3">No Concepts Found</h3>
              <p className="text-muted-foreground max-w-sm text-lg font-medium leading-relaxed">
                The library is quiet. Try broadening your search or be the first to publish a new breakthrough.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-0">
          {!user ? (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-[4rem] border-2 border-dashed text-center bg-card/20 backdrop-blur-sm">
              <div className="p-10 rounded-full bg-primary/5 mb-8">
                <Lock className="h-20 w-20 text-primary/30" />
              </div>
              <h3 className="text-3xl font-black mb-3">Secure Encryption</h3>
              <p className="text-muted-foreground max-w-sm text-lg font-medium">
                Authenticate your session to manage your personal intellectual property and private references.
              </p>
              <Button asChild className="mt-10 rounded-2xl px-12 h-14 font-black shadow-2xl shadow-primary/20" size="lg">
                <a href="/login">Authenticate Session</a>
              </Button>
            </div>
          ) : myLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="masonry-item h-[450px] rounded-[2.5rem] bg-card/40 animate-pulse border border-border/10 mb-8" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 masonry-grid">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-[4rem] border-2 border-dashed text-center bg-card/20">
              <div className="p-10 rounded-full bg-secondary/10 mb-8">
                <CodeIcon className="h-20 w-20 text-muted-foreground/30" />
              </div>
              <h3 className="text-3xl font-black mb-3">Library Static</h3>
              <p className="text-muted-foreground max-w-sm text-lg font-medium">
                Your personal secure vault is empty. Start clipping from chat or create a new snippet to fill it up.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

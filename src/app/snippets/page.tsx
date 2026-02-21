
"use client";

import { useState, useMemo, useEffect } from "react";
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
  Share2,
  Check,
  Zap
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LANGUAGES = [
  "javascript", "typescript", "python", "html", "css", "sql", "bash", "json", "rust", "go", "java"
];

/**
 * A client-safe component for rendering relative time to avoid hydration mismatches.
 */
function TimeAgo({ timestamp }: { timestamp: any }) {
  const [timeStr, setTimeStr] = useState<string>("Incoming");

  useEffect(() => {
    if (timestamp?.toDate) {
      setTimeStr(formatDistanceToNow(timestamp.toDate()) + ' ago');
    }
  }, [timestamp]);

  return <>{timeStr}</>;
}

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
      toast({ 
        variant: "destructive", 
        title: "Auth Required", 
        description: "Please sign in to use AI analysis features." 
      });
      return;
    }

    setExplainingId(snippet.id);
    try {
      const result = await explainSnippet({ code: snippet.codeContent, language: snippet.language });
      updateDocumentNonBlocking(doc(db, "codeSnippets", snippet.id), {
        aiExplanation: result.explanation
      });
      toast({ title: "Analysis successful" });
    } catch (error) {
      toast({ variant: "destructive", title: "AI processing failed" });
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "codeSnippets", id));
    toast({ title: "Snippet removed" });
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => {
    const isOwner = user?.uid === snippet.authorId;
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
      navigator.clipboard.writeText(snippet.codeContent);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Card className="masonry-item group relative flex flex-col overflow-hidden border-border bg-card/40 hover:bg-card transition-all duration-300">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 overflow-hidden">
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                {snippet.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                <Badge variant="secondary" className="h-4 px-1 text-[8px] font-mono uppercase">
                  {snippet.language}
                </Badge>
                <span>by {snippet.authorName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1 rounded-full bg-muted/50">
                      {snippet.isPublic ? <Globe className="h-3 w-3 text-primary" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{snippet.isPublic ? 'Public' : 'Private'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[150px]">
                    <DropdownMenuItem className="gap-2 font-bold cursor-pointer" onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + "/snippets/" + snippet.id);
                      toast({ title: "Link copied" });
                    }}>
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive gap-2 font-bold cursor-pointer">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Destroy snippet?</AlertDialogTitle>
                          <AlertDialogDescription>This operation is permanent and will remove the data from the global grid.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Abort</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(snippet.id)} className="bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
          <div className="relative group/code rounded-xl bg-secondary/20 p-4 text-[11px] leading-relaxed font-mono border border-border/50 transition-all">
            <pre className="max-h-[250px] overflow-hidden whitespace-pre-wrap">{snippet.codeContent}</pre>
            <div className="absolute inset-0 bg-gradient-to-t from-card/30 via-transparent to-transparent opacity-80" />
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover/code:opacity-100 transition-all shadow-md bg-card/80 backdrop-blur-sm"
              onClick={copyCode}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          
          {snippet.aiExplanation ? (
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/10 relative overflow-hidden">
              <Sparkles className="absolute -right-2 -bottom-2 h-12 w-12 text-primary opacity-5" />
              <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest mb-1.5">
                <Zap className="h-2.5 w-2.5 fill-current" /> AI CONTEXT
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                {snippet.aiExplanation}
              </p>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-xs font-bold border-dashed h-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
              disabled={explainingId === snippet.id}
              onClick={() => handleAISummarize(snippet)}
            >
              <Sparkles className={cn("h-3 w-3", explainingId === snippet.id && "animate-spin")} />
              {explainingId === snippet.id ? "Analyzing..." : "Generate AI Insight"}
            </Button>
          )}
        </CardContent>

        <CardFooter className="p-3 sm:p-4 text-[9px] text-muted-foreground border-t bg-muted/5 flex justify-between items-center font-bold">
          <span><TimeAgo timestamp={snippet.createdAt} /></span>
          <span className="uppercase tracking-widest opacity-40">System Node 01</span>
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
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="font-black tracking-widest uppercase py-1 px-4 text-[10px] bg-primary/10 text-primary border-none">
            Discovery Grid
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter">
            Smart <span className="text-primary">Repository</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl font-medium">
            A high-fidelity grid of reusable syntax blocks, enhanced by generative logic and collaborative indexing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search library..." 
              className="pl-12 h-12 rounded-2xl bg-card border-border/60 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 w-full sm:w-auto rounded-2xl px-8 shadow-xl shadow-primary/20 font-black gap-2 transition-transform hover:scale-[1.02]">
                <Plus className="h-5 w-5" />
                <span>Create New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem] p-6 sm:p-10 border-primary/5">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">Broadcast Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Context Title</Label>
                    <Input 
                      placeholder="e.g. Firebase Auth Hook" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-secondary/20 h-12 rounded-2xl border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stack</Label>
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="bg-secondary/20 h-12 rounded-2xl border-none">
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source Syntax</Label>
                  <Textarea 
                    placeholder="// Your code here..." 
                    className="font-mono text-sm bg-secondary/30 min-h-[300px] rounded-3xl border-none p-6 shadow-inner"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-3xl border-2 border-dashed border-border p-6 bg-muted/5">
                  <div className="space-y-0.5">
                    <Label className="text-lg font-black">Public Discovery</Label>
                    <p className="text-xs text-muted-foreground font-medium">Allow other developers to find this snippet</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} className="scale-125" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full h-12 px-8 font-bold">Discard</Button>
                <Button onClick={handleCreateSnippet} className="rounded-2xl h-12 px-12 font-black shadow-lg shadow-primary/20">Sync to Vault</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-8 h-12 bg-muted/20 p-1.5 rounded-full border border-border/40 max-w-sm mx-auto flex">
          <TabsTrigger value="public" className="flex-1 gap-2 rounded-full data-[state=active]:bg-card font-black text-xs">
            <Grid2X2 className="h-3.5 w-3.5" /> Discovery
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-2 rounded-full data-[state=active]:bg-card font-black text-xs">
            <Lock className="h-3.5 w-3.5" /> Private Vault
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="public">
          {publicLoading ? (
             <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="masonry-item h-[400px] rounded-3xl bg-card/40 animate-pulse border border-border/10 mb-6" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 masonry-grid">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/10 border-border/20 p-10">
              <Languages className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-2xl font-black">Grid is silent</h3>
              <p className="text-muted-foreground max-w-xs text-sm font-medium">Be the first to publish a new breakthrough snippet to the community.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          {!user ? (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/10 p-10">
              <Lock className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-2xl font-black">Auth Required</h3>
              <p className="text-muted-foreground max-w-xs text-sm font-medium mb-8">Synchronize your session to manage your personal intellectual property.</p>
              <Button asChild className="rounded-2xl px-10 h-12 font-black">
                <a href="/login">Authenticate Session</a>
              </Button>
            </div>
          ) : myLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="masonry-item h-[400px] rounded-3xl bg-card/40 animate-pulse border border-border/10 mb-6" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 masonry-grid">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center bg-card/10 p-10">
              <CodeIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-2xl font-black">Vault Empty</h3>
              <p className="text-muted-foreground max-w-xs text-sm font-medium">Your personal secure storage is ready for deployment. Clip from chat or create new.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

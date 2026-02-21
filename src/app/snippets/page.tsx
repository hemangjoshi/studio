
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
import { Plus, Globe, Lock, Search, Code as CodeIcon, User, Copy, Sparkles, Languages, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { explainSnippet } from "@/ai/flows/explain-snippet";

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
    
    // Protection against unauthenticated updates
    if (!user) {
      toast({ 
        variant: "destructive", 
        title: "Sign-in Required", 
        description: "Please sign in to generate AI explanations for snippets." 
      });
      return;
    }

    setExplainingId(snippet.id);
    try {
      const result = await explainSnippet({ code: snippet.codeContent, language: snippet.language });
      updateDocumentNonBlocking(doc(db, "codeSnippets", snippet.id), {
        aiExplanation: result.explanation
      });
      toast({ title: "AI Analysis Complete", description: "The explanation has been added to the snippet." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate explanation." });
    } finally {
      setExplainingId(null);
    }
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => (
    <Card className="group flex flex-col overflow-hidden border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 overflow-hidden">
            <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
              {snippet.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{snippet.authorName}</span>
              <span>•</span>
              <Badge variant="outline" className="h-4 px-1 text-[10px] font-mono uppercase bg-secondary/50">
                {snippet.language || "code"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Badge variant={snippet.isPublic ? "secondary" : "outline"} className="flex gap-1 shrink-0 h-5">
              {snippet.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-2">
        <div className="relative group/code rounded-md bg-secondary/80 p-3 text-[11px] leading-relaxed text-secondary-foreground font-mono">
          <pre className="max-h-32 overflow-hidden whitespace-pre-wrap">{snippet.codeContent}</pre>
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-100 group-hover/code:opacity-0 transition-opacity" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/80"
            onClick={() => {
              navigator.clipboard.writeText(snippet.codeContent);
              toast({ title: "Copied!" });
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        
        {snippet.aiExplanation ? (
          <div className="mt-3 rounded-lg bg-primary/5 p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3" /> AI Explanation
            </div>
            <p className="text-xs text-muted-foreground leading-normal italic">
              "{snippet.aiExplanation}"
            </p>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full gap-2 border-dashed border-primary/30 hover:bg-primary/5 text-primary"
            disabled={explainingId === snippet.id}
            onClick={() => handleAISummarize(snippet)}
          >
            <Sparkles className={`h-3 w-3 ${explainingId === snippet.id ? 'animate-pulse' : ''}`} />
            {explainingId === snippet.id ? "Analyzing..." : "Explain with AI"}
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 text-[10px] text-muted-foreground border-t border-border/10 flex justify-between items-center bg-muted/20">
        <span>{snippet.createdAt?.toDate ? formatDistanceToNow(snippet.createdAt.toDate()) + ' ago' : 'Recent'}</span>
        <div className="flex gap-2">
           <Terminal className="h-3 w-3 opacity-30" />
        </div>
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
    <div className="space-y-8 pb-20 md:pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Code Library</h1>
          <p className="text-muted-foreground text-sm">Organize and understand your shared knowledge base</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Filter by title, code or language..." 
              className="pl-10 h-10 rounded-full bg-secondary/30 border-none ring-1 ring-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full px-6 h-10 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                <span>Snippet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-2xl border-primary/20 bg-card/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Title</Label>
                    <Input 
                      placeholder="Snippet name" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-secondary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Language</Label>
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="bg-secondary/20">
                        <SelectValue placeholder="Select Language" />
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
                  <Label className="text-sm font-semibold">Code</Label>
                  <Textarea 
                    placeholder="// Paste your code here..." 
                    className="font-mono text-xs bg-secondary/40 min-h-[200px] resize-none"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Public Access</Label>
                    <p className="text-[10px] text-muted-foreground">Visible to global dev room</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSnippet} className="px-10">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-6 h-11 bg-secondary/30 p-1 rounded-full border border-border/50 max-w-xs">
          <TabsTrigger value="public" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary">
            <Globe className="h-4 w-4" /> Global
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary">
            <Lock className="h-4 w-4" /> My Own
          </TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          {publicLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map(i => <div key={i} className="h-80 rounded-xl bg-card animate-pulse border border-border/20" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center rounded-3xl border border-dashed text-center">
              <Languages className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">No snippets found in the public library.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="my">
          {!user ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-3xl border border-dashed text-center">
              <Lock className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">Please sign in to view your library.</p>
            </div>
          ) : myLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {[1,2].map(i => <div key={i} className="h-80 rounded-xl bg-card animate-pulse border border-border/20" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center rounded-3xl border border-dashed text-center">
              <CodeIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">Your private library is empty.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

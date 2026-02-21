"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Globe, Lock, Search, Code as CodeIcon, User, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function SnippetsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Query for public snippets: All snippets where isPublic is true
  const publicQuery = useMemoFirebase(() => {
    return query(
      collection(db, "codeSnippets"), 
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db]);
  const { data: publicSnippets, isLoading: publicLoading } = useCollection(publicQuery);

  // Query for user's own snippets: All snippets where authorId matches current user
  const myQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "codeSnippets"), 
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);
  const { data: mySnippets, isLoading: myLoading } = useCollection(myQuery);

  const handleCreateSnippet = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please sign in to create snippets." });
      return;
    }
    if (!newTitle.trim() || !newCode.trim()) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and code are required." });
      return;
    }

    addDocumentNonBlocking(collection(db, "codeSnippets"), {
      title: newTitle.trim(),
      codeContent: newCode.trim(),
      isPublic,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous Developer",
      createdAt: serverTimestamp(),
    });

    setIsDialogOpen(false);
    setNewTitle("");
    setNewCode("");
    toast({ title: "Snippet created!", description: "Your code has been saved." });
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => (
    <Card className="group overflow-hidden border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{snippet.title}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{snippet.authorName || "Anonymous"}</span>
              <span>•</span>
              <span>{snippet.createdAt?.toDate ? formatDistanceToNow(snippet.createdAt.toDate()) + ' ago' : 'Just now'}</span>
            </div>
          </div>
          <Badge variant={snippet.isPublic ? "secondary" : "outline"} className="flex gap-1 shrink-0">
            {snippet.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {snippet.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="code-editor relative max-h-40 overflow-hidden rounded-md bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
          <pre className="whitespace-pre-wrap font-mono">{snippet.codeContent}</pre>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-secondary to-transparent" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="ghost" size="sm" className="w-full gap-2 text-primary hover:text-primary hover:bg-primary/10" onClick={() => {
          navigator.clipboard.writeText(snippet.codeContent);
          toast({ title: "Copied!", description: "Code snippet copied to clipboard." });
        }}>
          <Copy className="h-4 w-4" />
          Copy Code
        </Button>
      </CardFooter>
    </Card>
  );

  const filterFn = (s: any) => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.codeContent?.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredPublic = (publicSnippets || []).filter(filterFn);
  const filteredMy = (mySnippets || []).filter(filterFn);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Code Snippets</h1>
          <p className="text-muted-foreground">Store, share, and discover useful code snippets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search snippets..." 
              className="pl-10 h-10 rounded-full bg-secondary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full px-6 h-10 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-2xl border-primary/20 bg-card/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">New Code Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Next.js API Route Template" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-secondary/20 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold">Code</Label>
                  <Textarea 
                    id="code" 
                    placeholder="Paste your code here..." 
                    className="code-editor min-h-[250px] font-mono text-xs bg-secondary/40 border-border/50 resize-none focus-visible:ring-primary/50"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-xl border border-border/50 bg-secondary/10 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Public Visibility</Label>
                    <p className="text-xs text-muted-foreground">
                      {isPublic ? "Available to the entire developer community" : "Only you can see this snippet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {isPublic ? "Public" : "Private"}
                    </span>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={handleCreateSnippet} className="rounded-full px-8">Save Snippet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-8 h-12 w-full max-w-md bg-secondary/30 p-1 rounded-full border border-border/50">
          <TabsTrigger value="public" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4" />
            Public Feed
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lock className="h-4 w-4" />
            My Snippets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="public" className="mt-0 outline-none">
          {publicLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-xl bg-card animate-pulse border border-border/20 shadow-sm" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/10 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No snippets yet</h3>
              <p className="text-muted-foreground max-w-sm">The public feed is currently empty. Be the first to share something amazing with the world!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="my" className="mt-0 outline-none">
          {!user ? (
            <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/10 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private Collection</h3>
              <p className="text-muted-foreground max-w-sm mb-6">Sign in to start building your personal library of reusable code snippets.</p>
              <Button onClick={() => router.push('/login')} className="rounded-full px-8">
                Sign In Now
              </Button>
            </div>
          ) : myLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {[1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-card animate-pulse border border-border/20 shadow-sm" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/10 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <CodeIcon className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
              <p className="text-muted-foreground max-w-sm mb-6">Start saving your favorite code fragments for easy access later.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="rounded-full px-8">
                Create First Snippet
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
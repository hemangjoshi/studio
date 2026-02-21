"use client";

import { useState, useEffect } from "react";
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
import { Plus, Globe, Lock, Search, Code as CodeIcon, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function SnippetsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Public Feed memoized query
  const publicQuery = useMemoFirebase(() => {
    return query(
      collection(db, "codeSnippets"), 
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db]);
  const { data: publicSnippets, isLoading: publicLoading } = useCollection(publicQuery);

  // My Snippets memoized query
  const myQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "codeSnippets"), 
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);
  const { data: mySnippets, isLoading: myLoading } = useCollection(myQuery);

  const handleCreateSnippet = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please sign in to create snippets." });
      return;
    }
    if (!newTitle || !newCode) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and code are required." });
      return;
    }

    addDocumentNonBlocking(collection(db, "codeSnippets"), {
      title: newTitle,
      codeContent: newCode,
      isPublic,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Dev User",
      createdAt: serverTimestamp(),
    });

    setIsDialogOpen(false);
    setNewTitle("");
    setNewCode("");
    toast({ title: "Snippet created successfully!" });
  };

  const SnippetCard = ({ snippet }: { snippet: any }) => (
    <Card className="group overflow-hidden border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{snippet.title}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{snippet.authorName || "Anonymous"}</span>
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
        <Button variant="ghost" size="sm" className="w-full gap-2 text-primary" onClick={() => {
          navigator.clipboard.writeText(snippet.codeContent);
          toast({ title: "Copied to clipboard" });
        }}>
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
          <p className="text-muted-foreground">Manage and explore reusable code snippets</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search snippets..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Snippet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., React Debounce Hook" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code Content</Label>
                  <Textarea 
                    id="code" 
                    placeholder="Paste your code here..." 
                    className="code-editor min-h-[200px] font-mono text-xs"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label className="text-base">Privacy Settings</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublic ? "Visible to everyone on the public feed" : "Visible only to you"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{isPublic ? "Public" : "Private"}</span>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSnippet}>Save Snippet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="mb-8 h-12 w-full max-w-md bg-secondary/50 p-1">
          <TabsTrigger value="public" className="flex-1 gap-2 rounded-md">
            <Globe className="h-4 w-4" />
            Public Feed
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 gap-2 rounded-md">
            <Lock className="h-4 w-4" />
            My Collection
          </TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          {publicLoading ? (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-50">
                {[1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-card animate-pulse border" />)}
             </div>
          ) : filteredPublic.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPublic.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">No public snippets found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="my">
          {!user ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
              <Lock className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">Sign in to view your collection</p>
              <Button variant="link" onClick={() => useRouter().push('/login')} className="mt-2">
                Sign In Now
              </Button>
            </div>
          ) : myLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-50">
               {[1,2].map(i => <div key={i} className="h-64 rounded-xl bg-card animate-pulse border" />)}
            </div>
          ) : filteredMy.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMy.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center">
              <CodeIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">You haven't saved any snippets yet</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2">
                Create your first one
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
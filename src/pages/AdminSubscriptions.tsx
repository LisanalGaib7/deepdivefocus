import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Crown, ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "gkswjdals0821@gmail.com";

interface UserResult {
  user_id: string;
  display_name: string | null;
  email?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string;
}

const AdminSubscriptions = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [userSub, setUserSub] = useState<Subscription | null>(null);
  const [planType, setPlanType] = useState<string>("lifetime");
  const [searching, setSearching] = useState(false);
  const [granting, setGranting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-robotic tracking-widest">AUTHORIZING...</div>
      </div>
    );
  }

  // Gate: only admin email can access
  if (!user?.email || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSelectedUser(null);
    setUserSub(null);

    // Search profiles by display_name (email part) — we can't query auth.users directly
    // We'll use an edge function approach, but for simplicity search profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .ilike("display_name", `%${searchEmail.trim()}%`)
      .limit(10);

    if (error) {
      toast.error("Search failed", { description: error.message });
      setSearchResults([]);
    } else {
      setSearchResults((data || []).map(d => ({ ...d, email: d.display_name || "" })));
    }
    setSearching(false);
  };

  const selectUser = async (u: UserResult) => {
    setSelectedUser(u);

    // Fetch existing subscription
    const { data } = await supabase
      .from("pro_subscriptions" as any)
      .select("*")
      .eq("user_id", u.user_id)
      .eq("status", "active")
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle() as any;

    setUserSub(data as Subscription | null);
  };

  const grantPro = async () => {
    if (!selectedUser) return;
    setGranting(true);

    const now = new Date().toISOString();
    let endsAt: string;

    if (planType === "lifetime") {
      endsAt = "2099-12-31T23:59:59Z";
    } else if (planType === "yearly") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      endsAt = d.toISOString();
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      endsAt = d.toISOString();
    }

    // Deactivate existing active subs
    await (supabase
      .from("pro_subscriptions" as any)
      .update({ status: "expired" } as any)
      .eq("user_id", selectedUser.user_id)
      .eq("status", "active") as any);

    // Insert new subscription
    const { error } = await (supabase
      .from("pro_subscriptions" as any)
      .insert({
        user_id: selectedUser.user_id,
        plan_type: planType,
        status: "active",
        starts_at: now,
        ends_at: endsAt,
      } as any) as any);

    if (error) {
      toast.error("Failed to grant Pro", { description: error.message });
    } else {
      toast.success("NUCLEAR REACTOR ACTIVATED", {
        description: `${planType.toUpperCase()} Pro granted to ${selectedUser.display_name}`,
      });
      // Refresh
      await selectUser(selectedUser);
    }
    setGranting(false);
  };

  const revokePro = async () => {
    if (!selectedUser || !userSub) return;

    await (supabase
      .from("pro_subscriptions" as any)
      .update({ status: "revoked" } as any)
      .eq("id", userSub.id) as any);

    toast.info("Pro access revoked");
    setUserSub(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-robotic tracking-widest uppercase text-primary">
            Admin — Subscriptions
          </h1>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by display name or email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUser()}
            className="flex-1 border-primary/30 bg-background"
          />
          <Button onClick={searchUser} disabled={searching} className="gap-2">
            <Search className="w-4 h-4" />
            {searching ? "..." : "Search"}
          </Button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="border border-primary/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((u) => (
                  <TableRow
                    key={u.user_id}
                    className={selectedUser?.user_id === u.user_id ? "bg-primary/10" : ""}
                  >
                    <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {u.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => selectUser(u)}>
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Selected user panel */}
        {selectedUser && (
          <div className="border border-primary/30 rounded-lg p-4 space-y-4 bg-card">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-bold">{selectedUser.display_name}</span>
              {userSub ? (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {userSub.plan_type} — Active
                </span>
              ) : (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Free
                </span>
              )}
            </div>

            {userSub && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Expires: {new Date(userSub.ends_at).toLocaleDateString()}</p>
                <Button size="sm" variant="destructive" onClick={revokePro}>
                  Revoke Access
                </Button>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Plan Type</label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={grantPro} disabled={granting} className="gap-2">
                <Crown className="w-4 h-4" />
                {granting ? "Granting..." : "Grant Pro"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;

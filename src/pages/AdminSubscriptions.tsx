// Admin tooling — always on, bypasses SUBSCRIPTION_ENABLED by design.
// Lets ops grant/revoke Pro and inspect subscriptions regardless of the
// public-facing feature flag. Access is gated by the `is_admin()` RPC.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Crown, ArrowLeft, Shield, Users, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "aaaehgus@gmail.com";

interface UserWithSub {
  user_id: string;
  display_name: string | null;
  total_pearls: number | null;
  total_depth: number | null;
  created_at: string;
  // Subscription info (joined)
  sub_id?: string;
  plan_type?: string;
  sub_status?: string;
  starts_at?: string;
  ends_at?: string;
}

const AdminSubscriptions = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserWithSub[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithSub | null>(null);
  const [planType, setPlanType] = useState<string>("lifetime");
  const [granting, setGranting] = useState(false);
  const [insertingTestUser, setInsertingTestUser] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);

    console.log("[Admin] Fetching all profiles...");

    // Fetch all profiles
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("user_id, display_name, total_pearls, total_depth, created_at")
      .order("created_at", { ascending: false });

    console.log("FETCHED USERS:", profiles);
    console.log("[Admin] Profiles result:", { count: profiles?.length, error: pErr });

    if (pErr) {
      console.error("[Admin] Profile fetch error:", pErr);
      toast.error("Failed to load users", { description: pErr.message });
      setLoadingUsers(false);
      return;
    }

    // Fetch all active subscriptions
    const { data: subs, error: sErr } = await supabase
      .from("pro_subscriptions")
      .select("*")
      .eq("status", "active");

    console.log("[Admin] Subs result:", { count: subs?.length, error: sErr });

    const subMap = new Map<string, any>();
    if (sErr) {
      console.error("[Admin] Subscription fetch error:", sErr);
    }

    if (subs) {
      for (const s of subs) {
        // Keep latest sub per user
        const existing = subMap.get(s.user_id);
        if (!existing || new Date(s.ends_at) > new Date(existing.ends_at)) {
          subMap.set(s.user_id, s);
        }
      }
    }

    const merged: UserWithSub[] = (profiles || []).map((p) => {
      const sub = subMap.get(p.user_id);
      return {
        ...p,
        sub_id: sub?.id,
        plan_type: sub?.plan_type,
        sub_status: sub?.status,
        starts_at: sub?.starts_at,
        ends_at: sub?.ends_at,
      };
    });

    console.log("[Admin] MERGED USERS:", merged);
    setAllUsers(merged);
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    if (!loading && user?.email === ADMIN_EMAIL) {
      console.log("[Admin] User verified as admin, fetching users...");
      fetchAllUsers();
    } else if (!loading) {
      console.log("[Admin] Not admin:", user?.email);
    }
  }, [loading, user, fetchAllUsers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-robotic tracking-widest">AUTHORIZING...</div>
      </div>
    );
  }

  if (!user?.email || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  const isProActive = (u: UserWithSub) =>
    u.sub_status === "active" && u.ends_at && new Date(u.ends_at) > new Date();

  const filteredUsers = allUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.display_name || "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q)
    );
  });

  const totalUsers = allUsers.length;
  const proUsers = allUsers.filter(isProActive).length;
  const freeUsers = totalUsers - proUsers;
  const usersToRender = filteredUsers;

  const grantPro = async (targetUser: UserWithSub) => {
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

    // Deactivate existing
    await supabase
      .from("pro_subscriptions")
      .update({ status: "expired" })
      .eq("user_id", targetUser.user_id)
      .eq("status", "active");

    const { error } = await supabase
      .from("pro_subscriptions")
      .insert({
        user_id: targetUser.user_id,
        plan_type: planType as "monthly" | "yearly" | "lifetime",
        status: "active",
        starts_at: now,
        ends_at: endsAt,
      });

    if (error) {
      toast.error("Failed to grant Pro", { description: error.message });
    } else {
      toast.success("NUCLEAR REACTOR ACTIVATED", {
        description: `${planType.toUpperCase()} Pro → ${targetUser.display_name}`,
      });
      await fetchAllUsers();
    }
    setGranting(false);
    setSelectedUser(null);
  };

  const revokePro = async (targetUser: UserWithSub) => {
    if (!targetUser.sub_id) return;

    await supabase
      .from("pro_subscriptions")
      .update({ status: "revoked" })
      .eq("id", targetUser.sub_id);

    toast.info("Pro access revoked");
    await fetchAllUsers();
    setSelectedUser(null);
  };

  const insertTestUser = async () => {
    if (!user?.id) {
      toast.error("You need to be logged in to insert a test user");
      return;
    }

    setInsertingTestUser(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: `Test Diver ${new Date().toLocaleTimeString("en-US", { hour12: false })}`,
        total_depth: 0,
        total_pearls: 0,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[Admin] Insert test user error:", error);
      toast.error("Failed to insert test user", { description: error.message });
    } else {
      toast.success("Test user upserted");
      await fetchAllUsers();
    }

    setInsertingTestUser(false);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    const date = new Date(d);
    if (date.getFullYear() >= 2099) return "∞ Lifetime";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold font-robotic tracking-widest uppercase text-primary">
              Admin — Subscriptions
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAllUsers} className="gap-2 border-primary/30">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-primary/20 rounded-lg p-4 bg-card text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</div>
          </div>
          <div className="border border-primary/20 rounded-lg p-4 bg-card text-center">
            <Crown className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold text-primary">{proUsers}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Pro Users</div>
          </div>
          <div className="border border-primary/20 rounded-lg p-4 bg-card text-center">
            <div className="w-5 h-5 mx-auto mb-1 text-muted-foreground text-lg leading-5">○</div>
            <div className="text-2xl font-bold text-muted-foreground">{freeUsers}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Free Users</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-primary/30 bg-background"
            />
          </div>
        </div>

        {/* User Table */}
        {loadingUsers ? (
          <div className="text-center py-12 text-primary animate-pulse font-robotic tracking-widest">
            LOADING CREW MANIFEST...
          </div>
        ) : allUsers.length === 0 ? (
          <div className="border border-primary/20 rounded-lg p-12 text-center space-y-4">
            <h2 className="text-lg font-bold font-robotic tracking-widest text-primary uppercase">
              NO DIVERS FOUND IN THE SYSTEM. The database is currently empty.
            </h2>
            <div className="text-foreground text-center py-10">No divers found in DB</div>
            <div className="flex justify-center">
              <Button
                onClick={insertTestUser}
                disabled={insertingTestUser}
                variant="outline"
                className="border-primary/30"
              >
                {insertingTestUser ? "Inserting..." : "Insert Test User"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-primary/20 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="text-primary/80">User</TableHead>
                  <TableHead className="text-primary/80">Status</TableHead>
                  <TableHead className="text-primary/80">Plan</TableHead>
                  <TableHead className="text-primary/80">Starts</TableHead>
                  <TableHead className="text-primary/80">Ends</TableHead>
                  <TableHead className="text-primary/80">Depth</TableHead>
                  <TableHead className="text-primary/80">Pearls</TableHead>
                  <TableHead className="text-primary/80 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersToRender.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  usersToRender.map((u) => {
                    const isPro = isProActive(u);
                    const isSelected = selectedUser?.user_id === u.user_id;

                    return (
                      <TableRow
                        key={u.user_id}
                        className={`border-primary/10 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                        }`}
                        onClick={() => setSelectedUser(isSelected ? null : u)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{u.display_name || "—"}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {u.user_id.slice(0, 12)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isPro ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                              PRO
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              FREE
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {u.plan_type ? (
                            <span className="uppercase tracking-wider text-xs">{u.plan_type}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(u.starts_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(u.ends_at)}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {u.total_depth?.toLocaleString() || "0"}m
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {u.total_pearls?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelected && (
                            <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                              <Select value={planType} onValueChange={setPlanType}>
                                <SelectTrigger className="w-28 h-8 text-xs border-primary/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lifetime">Lifetime</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => grantPro(u)}
                                disabled={granting}
                                className="h-8 gap-1 text-xs"
                              >
                                <Crown className="w-3 h-3" />
                                Grant
                              </Button>
                              {isPro && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => revokePro(u)}
                                  className="h-8 text-xs"
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Showing {filteredUsers.length} of {totalUsers} users
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;

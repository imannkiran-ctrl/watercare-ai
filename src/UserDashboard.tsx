import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ComplaintForm } from "./ComplaintForm";
import { AIChat } from "./AIChat";
import { SafetyTips } from "./SafetyTips";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function UserDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState("chat");

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("complaints")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) console.error("Load complaints failed:", error);
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`complaints-user-${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "complaints", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">

      <TabsList className="grid w-full grid-cols-4 sm:w-auto">
        <TabsTrigger value="chat">AI Chat</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
        <TabsTrigger value="status">My Complaints</TabsTrigger>
        <TabsTrigger value="tips">Safety Tips</TabsTrigger>
      </TabsList>

      <TabsContent value="chat"><AIChat /></TabsContent>

      <TabsContent value="report">
        <ComplaintForm onSubmitted={(row) => {
          if (row) setItems((prev) => [row, ...prev.filter((p) => p.id !== row.id)]);
          load();
          setTab("status");
        }} />
      </TabsContent>



      <TabsContent value="status">
        <Card>
          <CardHeader><CardTitle>My Complaints</CardTitle></CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No complaints yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.issue_type}</TableCell>
                        <TableCell>{c.area}, {c.city}</TableCell>
                        <TableCell><UrgencyBadge urgency={c.urgency} /></TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell className="max-w-[240px] text-sm text-muted-foreground">{c.remarks || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tips"><SafetyTips /></TabsContent>
    </Tabs>
  );
}

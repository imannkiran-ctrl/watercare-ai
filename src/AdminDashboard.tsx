import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

interface Client { id: string; full_name: string | null; email: string | null; }

export function AdminDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [city, setCity] = useState("");
  const [issueType, setIssueType] = useState("all");
  const [status, setStatus] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);

    // Get all client users via user_roles + profiles join (manual)
    const { data: rolesData } = await supabase.from("user_roles").select("user_id").eq("role", "client");
    const ids = rolesData?.map((r) => r.user_id) ?? [];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      setClients(profs ?? []);
    } else {
      setClients([]);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) =>
    (!city || c.city.toLowerCase().includes(city.toLowerCase())) &&
    (issueType === "all" || c.issue_type === issueType) &&
    (status === "all" || c.status === status)
  ), [items, city, issueType, status]);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((c) => c.status === "pending").length,
    in_progress: items.filter((c) => c.status === "in_progress").length,
    solved: items.filter((c) => c.status === "solved").length,
  }), [items]);

  const assign = async (id: string, clientId: string) => {
    const { error } = await supabase.from("complaints")
      .update({ assigned_to: clientId, status: "in_progress" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Assigned"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} icon={ClipboardList} color="text-primary" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="text-warning-foreground" />
        <StatCard title="In Progress" value={stats.in_progress} icon={Loader2} color="text-primary" />
        <StatCard title="Solved" value={stats.solved} icon={CheckCircle2} color="text-success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Filter by city…" value={city} onChange={(e) => setCity(e.target.value)} />
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger><SelectValue placeholder="Issue type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All issue types</SelectItem>
                {["Contamination","Leakage","No Supply","Low Pressure","Sanitation","Other"].map((t) =>
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const assignedClient = clients.find((cl) => cl.id === c.assigned_to);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.area}, {c.city}</TableCell>
                      <TableCell>{c.issue_type}</TableCell>
                      <TableCell><UrgencyBadge urgency={c.urgency} /></TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {assignedClient ? (assignedClient.full_name || assignedClient.email) : "—"}
                      </TableCell>
                      <TableCell>
                        <AssignDialog complaint={c} clients={clients} onAssign={assign} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No complaints match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {clients.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Tip: Promote a user to <span className="font-semibold">client</span> in the database to enable assignment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignDialog({ complaint, clients, onAssign }: { complaint: any; clients: Client[]; onAssign: (id: string, clientId: string) => void; }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string>(complaint.assigned_to ?? "");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Assign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign complaint</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{complaint.issue_type} — {complaint.area}, {complaint.city}</p>
        <Select value={sel} onValueChange={setSel}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={() => { if (sel) { onAssign(complaint.id, sel); setOpen(false); } }}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

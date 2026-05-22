import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FilePlus } from "lucide-react";

export function ComplaintForm({ onSubmitted }: { onSubmitted?: (row?: any) => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "", city: "", area: "",
    issue_type: "Contamination",
    description: "",
    urgency: "medium",
  });

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to submit a complaint");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.from("complaints")
      .insert({ ...form, user_id: user.id })
      .select()
      .single();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Complaint submitted successfully");
      setForm({ name: "", city: "", area: "", issue_type: "Contamination", description: "", urgency: "medium" });
      onSubmitted?.(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FilePlus className="h-5 w-5 text-primary" /> Submit a Complaint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label>Your name</Label>
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input required value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Area / Neighborhood</Label>
            <Input required value={form.area} onChange={(e) => update("area", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Issue type</Label>
            <Select value={form.issue_type} onValueChange={(v) => update("issue_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Contamination">Contamination</SelectItem>
                <SelectItem value="Leakage">Leakage</SelectItem>
                <SelectItem value="No Supply">No Supply</SelectItem>
                <SelectItem value="Low Pressure">Low Pressure</SelectItem>
                <SelectItem value="Sanitation">Sanitation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select value={form.urgency} onValueChange={(v) => update("urgency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea required rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full bg-gradient-hero shadow-elegant" disabled={busy}>
              {busy ? "Submitting…" : "Submit complaint"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

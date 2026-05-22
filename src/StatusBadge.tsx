import { Badge } from "@/components/ui/badge";

const map: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  solved: "bg-success/15 text-success border-success/30",
};

const label: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  solved: "Solved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {label[status] ?? status}
    </Badge>
  );
}

const urgencyMap: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning-foreground border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <Badge variant="outline" className={urgencyMap[urgency] ?? ""}>
      {urgency}
    </Badge>
  );
}

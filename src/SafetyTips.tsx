import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Droplet, Recycle, AlertTriangle, Thermometer, Filter } from "lucide-react";

const tips = [
  { icon: Droplet, title: "Boil if unsure", text: "Boil water for at least 1 minute when the source is uncertain." },
  { icon: Filter, title: "Use filtration", text: "Use certified filters to remove sediments and harmful pathogens." },
  { icon: Thermometer, title: "Store correctly", text: "Keep drinking water in clean, covered containers below 25°C." },
  { icon: Recycle, title: "Conserve daily", text: "Fix leaks, take shorter showers, and reuse greywater where possible." },
  { icon: AlertTriangle, title: "Report contamination", text: "Notice discoloration, odor, or illness? File a complaint immediately." },
  { icon: ShieldCheck, title: "Wash hands often", text: "Proper hygiene cuts down waterborne disease transmission drastically." },
];

export function SafetyTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" /> Water Safety Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {tips.map((t) => (
          <div key={t.title} className="flex gap-3 rounded-xl border border-border bg-secondary/40 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
              <t.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.text}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend = "neutral", icon, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-3 md:p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-lg md:text-2xl font-bold">{value}</h3>
            {trend && (
              <p 
                className={cn(
                  "text-xs font-medium mt-1",
                  trend === "up" && "text-price-up",
                  trend === "down" && "text-price-down",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trend === "neutral" && ""}
              </p>
            )}
          </div>
          {icon && <div className="text-muted-foreground hidden md:block">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

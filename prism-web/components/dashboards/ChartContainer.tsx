import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  onExport?: () => void;
  exportLabel?: string;
  className?: string;
  actions?: ReactNode;
}

export function ChartContainer({
  title,
  description,
  icon,
  children,
  onExport,
  exportLabel = "Export",
  className = "",
  actions,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                {exportLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

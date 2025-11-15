import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  positive?: boolean; // Is increase good or bad? Default: up is good
  className?: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  change,
  period,
  icon,
  trend,
  positive = true,
  className = "",
  subtitle,
}: MetricCardProps) {
  // Determine trend automatically if change is provided but trend isn't
  const determinedTrend = trend || (change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined);

  // Determine if the change is "good" based on positive prop and trend
  const isGoodChange =
    determinedTrend === "up" ? positive : determinedTrend === "down" ? !positive : undefined;

  const getTrendColor = () => {
    if (isGoodChange === undefined) return "text-gray-600";
    return isGoodChange ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = () => {
    if (determinedTrend === "up") return <ArrowUp className="w-4 h-4" />;
    if (determinedTrend === "down") return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const formatChange = (value: number) => {
    const abs = Math.abs(value);
    return `${abs}%`;
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <p className="text-sm text-gray-600 font-medium">{title}</p>
        </div>

        <p className="text-3xl font-bold text-gray-900 font-mono">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}

        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              {formatChange(change)}
            </span>
            {period && <span className="text-xs text-gray-500">{period}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

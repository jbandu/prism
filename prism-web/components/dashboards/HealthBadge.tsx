import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

type HealthStatus = "healthy" | "good" | "warning" | "critical" | "degraded" | "error" | "down";

interface HealthBadgeProps {
  status: HealthStatus;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function HealthBadge({ status, label, showIcon = true, className = "" }: HealthBadgeProps) {
  const getStatusConfig = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
      case "good":
        return {
          color: "bg-green-500 hover:bg-green-600",
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: label || "Healthy",
        };
      case "warning":
        return {
          color: "bg-yellow-500 hover:bg-yellow-600",
          icon: <AlertTriangle className="w-3 h-3" />,
          text: label || "Warning",
        };
      case "degraded":
        return {
          color: "bg-orange-500 hover:bg-orange-600",
          icon: <AlertCircle className="w-3 h-3" />,
          text: label || "Degraded",
        };
      case "critical":
      case "error":
        return {
          color: "bg-red-500 hover:bg-red-600",
          icon: <AlertTriangle className="w-3 h-3" />,
          text: label || "Critical",
        };
      case "down":
        return {
          color: "bg-red-600 hover:bg-red-700",
          icon: <XCircle className="w-3 h-3" />,
          text: label || "Down",
        };
      default:
        return {
          color: "bg-gray-500 hover:bg-gray-600",
          icon: <AlertCircle className="w-3 h-3" />,
          text: label || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.text}
    </Badge>
  );
}

// Utility function to get health color for use in charts/other components
export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case "healthy":
    case "good":
      return "#10b981"; // green-500
    case "warning":
      return "#f59e0b"; // yellow-500
    case "degraded":
      return "#f97316"; // orange-500
    case "critical":
    case "error":
      return "#ef4444"; // red-500
    case "down":
      return "#dc2626"; // red-600
    default:
      return "#6b7280"; // gray-500
  }
}

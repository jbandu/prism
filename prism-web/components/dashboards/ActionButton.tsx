import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Eye, Edit, Trash2, Download, RefreshCw } from "lucide-react";
import { ReactNode } from "react";

type ActionType = "view" | "edit" | "delete" | "export" | "refresh" | "external" | "navigate" | "custom";

interface ActionButtonProps {
  action: ActionType;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: ReactNode;
  className?: string;
}

export function ActionButton({
  action,
  label,
  onClick,
  disabled = false,
  variant = "outline",
  size = "sm",
  icon,
  className = "",
}: ActionButtonProps) {
  const getActionConfig = (action: ActionType) => {
    switch (action) {
      case "view":
        return {
          icon: <Eye className="w-4 h-4" />,
          label: label || "View",
          variant: variant,
        };
      case "edit":
        return {
          icon: <Edit className="w-4 h-4" />,
          label: label || "Edit",
          variant: variant,
        };
      case "delete":
        return {
          icon: <Trash2 className="w-4 h-4" />,
          label: label || "Delete",
          variant: "destructive" as const,
        };
      case "export":
        return {
          icon: <Download className="w-4 h-4" />,
          label: label || "Export",
          variant: variant,
        };
      case "refresh":
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          label: label || "Refresh",
          variant: variant,
        };
      case "external":
        return {
          icon: <ExternalLink className="w-4 h-4" />,
          label: label || "Open",
          variant: variant,
        };
      case "navigate":
        return {
          icon: <ArrowRight className="w-4 h-4" />,
          label: label || "View Details",
          variant: variant,
        };
      case "custom":
        return {
          icon: icon || <ArrowRight className="w-4 h-4" />,
          label: label || "Action",
          variant: variant,
        };
      default:
        return {
          icon: <ArrowRight className="w-4 h-4" />,
          label: label || "Action",
          variant: variant,
        };
    }
  };

  const config = getActionConfig(action);
  const buttonIcon = icon || config.icon;
  const buttonLabel = label || config.label;

  return (
    <Button
      variant={config.variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {size !== "icon" && buttonLabel}
      {buttonIcon && <span className={size !== "icon" ? "ml-2" : ""}>{buttonIcon}</span>}
    </Button>
  );
}

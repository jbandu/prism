"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MoreVertical,
  Edit,
  User,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StakeholderCardProps {
  stakeholder: {
    id: string;
    role_type: string;
    role_level: string | null;
    responsibilities: string[] | null;
    decision_weight: number | null;
    role_display_name?: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    department: string | null;
  };
  onEdit?: (stakeholder: any) => void;
  onRemove?: (stakeholderId: string) => void;
  onViewProfile?: (personId: string) => void;
}

export function StakeholderCard({
  stakeholder,
  onEdit,
  onRemove,
  onViewProfile,
}: StakeholderCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (roleType: string) => {
    const colors: Record<string, string> = {
      executive_sponsor: "bg-blue-100 text-blue-700",
      business_owner: "bg-green-100 text-green-700",
      it_owner: "bg-purple-100 text-purple-700",
      procurement_lead: "bg-orange-100 text-orange-700",
      finance_approver: "bg-yellow-100 text-yellow-700",
      security_reviewer: "bg-red-100 text-red-700",
      power_user: "bg-gray-100 text-gray-700",
    };
    return colors[roleType] || "bg-gray-100 text-gray-700";
  };

  const getRoleBadgeVariant = (roleType: string): "default" | "secondary" | "outline" => {
    if (roleType === "executive_sponsor") return "default";
    if (roleType === "business_owner") return "default";
    return "secondary";
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    if (
      confirm(
        `Are you sure you want to remove ${stakeholder.full_name} as ${stakeholder.role_display_name || stakeholder.role_type}?`
      )
    ) {
      setIsRemoving(true);
      try {
        await onRemove(stakeholder.id);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className={getRoleColor(stakeholder.role_type)}>
              {getInitials(stakeholder.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {stakeholder.full_name}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {stakeholder.title}
                </p>
                {stakeholder.department && (
                  <p className="text-xs text-gray-500">{stakeholder.department}</p>
                )}
              </div>

              <Badge variant={getRoleBadgeVariant(stakeholder.role_type)} className="shrink-0">
                {stakeholder.role_display_name || stakeholder.role_type}
              </Badge>
            </div>

            {/* Contact */}
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {stakeholder.email && (
                <a
                  href={`mailto:${stakeholder.email}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Mail size={14} />
                  <span className="truncate">{stakeholder.email}</span>
                </a>
              )}
              {stakeholder.phone && (
                <span className="text-gray-600 flex items-center gap-1">
                  <Phone size={14} />
                  {stakeholder.phone}
                </span>
              )}
            </div>

            {/* Responsibilities */}
            {stakeholder.responsibilities && stakeholder.responsibilities.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Responsibilities:</p>
                <div className="flex flex-wrap gap-1">
                  {stakeholder.responsibilities.map((resp, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {resp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Weight */}
            {stakeholder.decision_weight !== null && stakeholder.decision_weight > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Influence:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${(stakeholder.decision_weight || 0) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {((stakeholder.decision_weight || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {(onEdit || onRemove || onViewProfile) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(stakeholder)}>
                    <Edit size={14} className="mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                {onViewProfile && (
                  <DropdownMenuItem onClick={() => onViewProfile(stakeholder.id)}>
                    <User size={14} className="mr-2" />
                    View Profile
                  </DropdownMenuItem>
                )}
                {(onEdit || onViewProfile) && onRemove && <DropdownMenuSeparator />}
                {onRemove && (
                  <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-red-600"
                    disabled={isRemoving}
                  >
                    <Trash2 size={14} className="mr-2" />
                    {isRemoving ? "Removing..." : "Remove"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

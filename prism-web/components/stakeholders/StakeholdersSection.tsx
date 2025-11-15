"use client";

import { useState, useEffect } from "react";
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StakeholderCard } from "./StakeholderCard";

interface StakeholdersSectionProps {
  softwareId: string;
  companyId: string;
}

export function StakeholdersSection({
  softwareId,
  companyId,
}: StakeholdersSectionProps) {
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStakeholders();
  }, [softwareId]);

  const fetchStakeholders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/stakeholders?softwareId=${softwareId}`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stakeholders");
      }

      setStakeholders(result.data || []);
    } catch (err) {
      console.error("Error fetching stakeholders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load stakeholders"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    try {
      const response = await fetch(`/api/stakeholders/${stakeholderId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to remove stakeholder");
      }

      // Refresh stakeholders
      await fetchStakeholders();
    } catch (err) {
      console.error("Error removing stakeholder:", err);
      alert(
        err instanceof Error ? err.message : "Failed to remove stakeholder"
      );
    }
  };

  const groupedStakeholders = {
    executive_sponsor: stakeholders.filter(
      (s) => s.role_type === "executive_sponsor"
    ),
    business_owner: stakeholders.filter(
      (s) => s.role_type === "business_owner"
    ),
    it_owner: stakeholders.filter((s) => s.role_type === "it_owner"),
    procurement_lead: stakeholders.filter(
      (s) => s.role_type === "procurement_lead"
    ),
    finance_approver: stakeholders.filter(
      (s) => s.role_type === "finance_approver"
    ),
    security_reviewer: stakeholders.filter(
      (s) => s.role_type === "security_reviewer"
    ),
    power_user: stakeholders.filter((s) => s.role_type === "power_user"),
    other: stakeholders.filter(
      (s) =>
        ![
          "executive_sponsor",
          "business_owner",
          "it_owner",
          "procurement_lead",
          "finance_approver",
          "security_reviewer",
          "power_user",
        ].includes(s.role_type)
    ),
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stakeholders & Decision Makers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading stakeholders...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stakeholders & Decision Makers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Stakeholders & Decision Makers
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {stakeholders.length} stakeholder{stakeholders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {stakeholders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No stakeholders assigned yet</p>
            <Button size="sm" variant="outline" className="mt-3">
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Stakeholder
            </Button>
          </div>
        ) : (
          <>
            {/* Executive Sponsor */}
            {groupedStakeholders.executive_sponsor.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Executive Sponsor
                </h4>
                {groupedStakeholders.executive_sponsor.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Business Owner */}
            {groupedStakeholders.business_owner.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Business Owner
                </h4>
                {groupedStakeholders.business_owner.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* IT Owner */}
            {groupedStakeholders.it_owner.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  IT Owner
                </h4>
                {groupedStakeholders.it_owner.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Procurement */}
            {groupedStakeholders.procurement_lead.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Procurement Lead
                </h4>
                {groupedStakeholders.procurement_lead.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Finance Approver */}
            {groupedStakeholders.finance_approver.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Finance Approver
                </h4>
                {groupedStakeholders.finance_approver.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Security Reviewer */}
            {groupedStakeholders.security_reviewer.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Security Reviewer
                </h4>
                {groupedStakeholders.security_reviewer.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Power Users */}
            {groupedStakeholders.power_user.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Power Users
                </h4>
                {groupedStakeholders.power_user.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}

            {/* Other */}
            {groupedStakeholders.other.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Other Stakeholders
                </h4>
                {groupedStakeholders.other.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onRemove={handleRemoveStakeholder}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
